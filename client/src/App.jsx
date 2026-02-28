import { Link, NavLink, Route, Routes } from "react-router-dom";
import { useMemo } from "react";
import HomePage from "./pages/HomePage";
import PostsPage from "./pages/PostsPage";
import ListingsPage from "./pages/ListingsPage";
import ProductsPage from "./pages/ProductsPage";
import ServicesPage from "./pages/ServicesPage";
import UsersPage from "./pages/UsersPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { useAuth } from "./context/AuthContext";

const App = () => {
  const { user, logout, loading } = useAuth();

  const navLinks = useMemo(() => {
    const baseLinks = [
      { to: "/", label: "Home", end: true },
      { to: "/posts", label: "Posts" },
      { to: "/listings", label: "Marketplace" },
      { to: "/products", label: "Products" },
      { to: "/services", label: "Services" },
    ];

    if (user) {
      return [...baseLinks, { to: "/users", label: "Profile" }];
    }

    return baseLinks;
  }, [user]);

  const footerLinks = useMemo(
    () => [
      { to: "/posts", label: "Community" },
      { to: "/listings", label: "Marketplace" },
      { to: "/services", label: "Services" },
      { to: "/products", label: "Products" },
    ],
    []
  );

  return (
    <div className="app">
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="site-brand" aria-label="PetCare home">
            <span className="site-brand__mark" aria-hidden="true">
              🐾
            </span>
            <span className="site-brand__text">
              <span className="site-brand__title">PetCare</span>
              <span className="site-brand__subtitle">Platform</span>
            </span>
          </Link>
          <div className="site-header__group">
            <nav className="primary-nav" aria-label="Primary navigation">
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    isActive
                      ? "primary-nav__link is-active"
                      : "primary-nav__link"
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="site-header__actions">
              {user && !loading ? (
                <button
                  type="button"
                  className="button ghost button--sm"
                  onClick={logout}
                >
                  Log out
                </button>
              ) : (
                <>
                  <Link className="button ghost button--sm" to="/login">
                    Log in
                  </Link>
                  <Link className="button button--sm" to="/signup">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/posts" element={<PostsPage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </div>
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="site-footer__brand">
            <span className="site-footer__mark" aria-hidden="true">
              🐾
            </span>
            <div>
              <p className="site-footer__title">PetCare Platform</p>
              <p className="site-footer__tagline">
                Helping every pet live a healthier, happier life.
              </p>
            </div>
          </div>
          <nav className="site-footer__nav" aria-label="Footer navigation">
            {footerLinks.map(({ to, label }) => (
              <Link key={to} to={to}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="site-footer__meta">
            <a href="mailto:hello@petcare.com">hello@petcare.com</a>
            <span>+1 (800) 555-0199</span>
          </div>
          <p className="site-footer__legal">
            © {new Date().getFullYear()} PetCare Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
