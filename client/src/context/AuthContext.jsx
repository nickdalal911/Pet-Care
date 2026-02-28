import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import apiClient, { setAuthToken } from "../api/client";

const AuthContext = createContext({
  user: null,
  token: "",
  loading: false,
  authError: "",
  login: async () => ({}),
  signup: async () => ({}),
  logout: () => {},
  refreshUser: async () => null,
  clearAuthError: () => {},
});

const TOKEN_STORAGE_KEY = "petcare_auth_token";

const getErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return "Something went wrong";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const applyToken = useCallback((nextToken) => {
    setToken(nextToken);
    setAuthToken(nextToken);
    if (typeof window !== "undefined") {
      if (nextToken) {
        localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/auth/me");
      setUser(data);
      return data;
    } catch (error) {
      setUser(null);
      if (error?.response?.status === 401) {
        applyToken("");
      }
      return null;
    }
  }, [applyToken]);

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedToken) {
        setLoading(false);
        return;
      }

      applyToken(storedToken);
      await refreshUser();
      setLoading(false);
    };

    bootstrap();
  }, [applyToken, refreshUser]);

  const clearAuthError = useCallback(() => {
    setAuthError("");
  }, []);

  const handleAuthSuccess = useCallback(
    (data) => {
      applyToken(data.token);
      setUser(data.user);
      setAuthError("");
    },
    [applyToken]
  );

  const login = useCallback(
    async ({ email, password }) => {
      setLoading(true);
      clearAuthError();
      try {
        const { data } = await apiClient.post("/auth/login", {
          email,
          password,
        });
        handleAuthSuccess(data);
        return { success: true };
      } catch (error) {
        const message = getErrorMessage(error);
        setAuthError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [clearAuthError, handleAuthSuccess]
  );

  const signup = useCallback(
    async ({ name, email, password }) => {
      setLoading(true);
      clearAuthError();
      try {
        const { data } = await apiClient.post("/auth/signup", {
          name,
          email,
          password,
        });
        handleAuthSuccess(data);
        return { success: true };
      } catch (error) {
        const message = getErrorMessage(error);
        setAuthError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    [clearAuthError, handleAuthSuccess]
  );

  const logout = useCallback(() => {
    setUser(null);
    setAuthError("");
    applyToken("");
  }, [applyToken]);

  const contextValue = useMemo(
    () => ({
      user,
      token,
      loading,
      authError,
      login,
      signup,
      logout,
      refreshUser,
      clearAuthError,
    }),
    [
      authError,
      clearAuthError,
      loading,
      login,
      logout,
      refreshUser,
      signup,
      token,
      user,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
