import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { buildMediaUrl } from "../api/helpers";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import SummaryBar from "../components/SummaryBar";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const CATEGORY_OPTIONS = ["All", "Dog", "Cat", "Fish", "Others"];
const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const createInitialForm = () => ({
  price: "",
  description: "",
  category: "Dog",
  affiliateLink: "",
  image: null,
});

const ProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isProvider = user?.role === "provider";
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [form, setForm] = useState(createInitialForm());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = async (category) => {
    setLoading(true);
    try {
      const params =
        category && category !== "All" ? { category } : undefined;
      const { data } = await apiClient.get("/products", { params });
      setProducts(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, image: file }));
  };

  const ensureProvider = () => {
    if (!user) {
      navigate("/login", { state: { from: "/products" } });
      return false;
    }
    if (!isProvider) {
      setError("Only service providers can add products.");
      return false;
    }
    return true;
  };

  const openCreateModal = () => {
    if (!ensureProvider()) {
      return;
    }
    setForm(createInitialForm());
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
    setForm(createInitialForm());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!ensureProvider()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!form.image) {
        setError("Please upload a product image.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("affiliateLink", form.affiliateLink);
      formData.append("image", form.image);

      await apiClient.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchProducts(activeCategory);
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const buildRedirectUrl = (id) => {
    const apiBase = apiClient.defaults.baseURL || "/api";
    return `${apiBase}/products/redirect/${id}`;
  };

  const handleBuy = (id) => {
    const redirectUrl = buildRedirectUrl(id);
    window.open(redirectUrl, "_blank", "noopener,noreferrer");
  };

  const summaryItems = useMemo(() => {
    return [
      { label: "Products", value: products.length },
      { label: "Category", value: activeCategory },
    ];
  }, [activeCategory, products]);

  return (
    <section className="page">
      <PageHeader
        title="Amazon Affiliate Marketplace"
        description="Curated pet picks with trusted essentials for every pet home."
        meta={<SummaryBar items={summaryItems} />}
        actions={
          isProvider ? (
            <button
              type="button"
              className="button button--icon"
              onClick={openCreateModal}
            >
              <span aria-hidden="true" className="button__icon">
                +
              </span>
              <span className="button__label">New product</span>
            </button>
          ) : !user ? (
            <Link
              className="button button--icon"
              to="/login"
              state={{ from: "/products" }}
            >
              <span aria-hidden="true" className="button__icon">
                🔐
              </span>
              <span className="button__label">Log in to manage</span>
            </Link>
          ) : (
            <span className="role-note">Provider access required</span>
          )
        }
      />

      <SectionCard
        title="Featured categories"
        description="Filter by pet type and shop directly on Amazon."
      >
        <div className="filter-buttons" role="group" aria-label="Filter products by category">
          {CATEGORY_OPTIONS.map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? "" : "secondary"}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="loading-text">Loading products...</p>
        ) : !products.length ? (
          <EmptyState
            title="No products available"
            description="Try another category or add products with POST /api/products."
            action={
              isProvider ? (
                <button
                  type="button"
                  className="button"
                  onClick={openCreateModal}
                >
                  Add a product
                </button>
              ) : !user ? (
                <Link
                  className="button"
                  to="/login"
                  state={{ from: "/products" }}
                >
                  Log in to manage
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="list-grid product-list">
            {products.map((product) => (
              <article key={product._id} className="card product-card">
                <div className="card-media product-image">
                  {product.image ? (
                    <img
                      src={buildMediaUrl(product.image)}
                      alt={`Product in ${product.category} category`}
                      loading="lazy"
                    />
                  ) : (
                    <span className="product-image__fallback">No image</span>
                  )}
                </div>

                <div className="product-card__details">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">
                        {inrFormatter.format(Number(product.price) || 0)}
                      </h3>
                      <p className="card-subtitle">{product.category}</p>
                    </div>
                  </div>
                  <p className="card-body">
                    {product.description || "No description available."}
                  </p>
                  <div className="card-actions">
                    <button type="button" onClick={() => handleBuy(product._id)}>
                      Buy on Amazon
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="affiliate-disclaimer">
          This website participates in the Amazon Associates Program and earns
          from qualifying purchases.
        </p>
      </SectionCard>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Add a new product"
        description="Publish curated Amazon picks for pet owners."
      >
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Price
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 1499"
                min="0"
                step="0.01"
                data-autofocus
                required
              />
            </label>
            <label>
              Category
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {CATEGORY_OPTIONS.filter((option) => option !== "All").map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="form-row">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe why this product is useful for pets."
            />
          </label>

          <label className="form-row">
            Product image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
          </label>

          <label className="form-row">
            Amazon affiliate link
            <input
              name="affiliateLink"
              value={form.affiliateLink}
              onChange={handleChange}
              placeholder="https://www.amazon.com/..."
              required
            />
          </label>

          {error && <p className="error">{error}</p>}

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              Add product
            </button>
            <button
              type="button"
              className="secondary"
              onClick={closeModal}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
};

export default ProductsPage;
