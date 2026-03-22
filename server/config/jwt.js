const DEFAULT_SECRET = "petcare-dev-secret";

const getJwtSecret = () => {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length > 0) {
    return process.env.JWT_SECRET.trim();
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production");
  }

  if (!getJwtSecret._warned) {
    console.warn(
      "Using fallback JWT secret. Set JWT_SECRET in your environment for improved security."
    );
    getJwtSecret._warned = true;
  }

  return DEFAULT_SECRET;
};

export { getJwtSecret };