import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { useAuth } from "../context/AuthContext";

const createInitialForm = () => ({
  email: "",
  password: "",
});

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, authError, clearAuthError, loading } = useAuth();
  const [form, setForm] = useState(createInitialForm());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => () => clearAuthError(), [clearAuthError]);

  const redirectTarget = location.state?.from || "/posts";

  if (user) {
    return <Navigate to={redirectTarget} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const result = await login(form);
    setSubmitting(false);

    if (result.success) {
      navigate(redirectTarget, { replace: true });
    }
  };

  const isBusy = submitting || loading;

  return (
    <section className="page">
      <PageHeader
        title="Welcome back"
        description="Log in to share new updates, curate services, and manage your pet community."
        actions={
          <Link className="button secondary" to="/signup">
            Need an account?
          </Link>
        }
      />

      <SectionCard
        title="Log in"
        description="Your email and password keep your pet space secure."
      >
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label htmlFor="email">
              Email
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
            <label htmlFor="password">
              Password
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </label>
          </div>

          {authError && <p className="error">{authError}</p>}

          <div className="form-actions">
            <button type="submit" disabled={isBusy}>
              Log in
            </button>
            <Link className="button secondary" to="/signup">
              Create an account
            </Link>
          </div>
        </form>
      </SectionCard>
    </section>
  );
};

export default LoginPage;
