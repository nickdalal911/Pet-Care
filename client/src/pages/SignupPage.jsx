import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { useAuth } from "../context/AuthContext";

const createInitialForm = () => ({
  name: "",
  email: "",
  password: "",
  role: "user",
  licenseNumber: "",
});

const roleOptions = [
  {
    value: "user",
    label: "Pet community member",
    description: "Create and manage posts while browsing community content.",
  },
  {
    value: "provider",
    label: "Service provider",
    description:
      "Manage marketplace listings, products, and services in addition to posts.",
  },
];

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signup, authError, clearAuthError, loading } = useAuth();
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
    const payload = {
      ...form,
      licenseNumber:
        form.role === "provider" ? form.licenseNumber.trim() : undefined,
    };
    const result = await signup(payload);
    setSubmitting(false);

    if (result.success) {
      navigate(redirectTarget, { replace: true });
    }
  };

  const isBusy = submitting || loading;

  return (
    <section className="page">
      <PageHeader
        title="Join PetCare"
        description="Create an account to manage posts, services, and your caretaker profile."
        actions={
          <Link className="button secondary" to="/login">
            Have an account?
          </Link>
        }
      />

      <SectionCard
        title="Create your account"
        description="A few details help personalize your pet community experience."
      >
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label htmlFor="name">
              Name
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jamie Reynolds"
                autoComplete="name"
                required
              />
            </label>
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
          </div>

          <label htmlFor="password" className="form-row">
            Password
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Choose a secure password"
              autoComplete="new-password"
              required
            />
          </label>

          <fieldset className="form-fieldset">
            <legend>Account type</legend>
            <div className="radio-grid">
              {roleOptions.map((option) => (
                <label key={option.value} className="radio-card">
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={form.role === option.value}
                    onChange={handleChange}
                  />
                  <div>
                    <div className="radio-card__label">{option.label}</div>
                    <p className="radio-card__description">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {form.role === "provider" && (
            <label htmlFor="licenseNumber" className="form-row">
              Verification license number
              <input
                id="licenseNumber"
                name="licenseNumber"
                value={form.licenseNumber}
                onChange={handleChange}
                placeholder="Enter your business or service license"
              />
            </label>
          )}

          {authError && <p className="error">{authError}</p>}

          <div className="form-actions">
            <button type="submit" disabled={isBusy}>
              Sign up
            </button>
            <Link className="button secondary" to="/login">
              Log in instead
            </Link>
          </div>
        </form>
      </SectionCard>
    </section>
  );
};

export default SignupPage;
