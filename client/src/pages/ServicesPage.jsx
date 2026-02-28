import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import SummaryBar from "../components/SummaryBar";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const createInitialForm = () => ({
  name: "",
  type: "",
  address: "",
  phone: "",
  description: "",
});

const ServicesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isProvider = user?.role === "provider";
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(createInitialForm());
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchServices = async () => {
    try {
      const { data } = await apiClient.get("/services");
      setServices(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load services");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetFormState = () => {
    setForm(createInitialForm());
    setEditingId(null);
  };

  const ensureProvider = () => {
    if (!user) {
      navigate("/login", { state: { from: "/services" } });
      return false;
    }
    if (!isProvider) {
      setError("Only service providers can manage services.");
      return false;
    }
    return true;
  };

  const openCreateModal = () => {
    if (!ensureProvider()) {
      return;
    }
    resetFormState();
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
    resetFormState();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!ensureProvider()) {
      setLoading(false);
      return;
    }

    try {
      if (editingId) {
        await apiClient.put(`/services/${editingId}`, form);
      } else {
        await apiClient.post("/services", form);
      }
      await fetchServices();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save service");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    if (!ensureProvider()) {
      return;
    }
    setEditingId(service._id);
    setForm({
      name: service.name || "",
      type: service.type || "",
      address: service.address || "",
      phone: service.phone || "",
      description: service.description || "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!ensureProvider()) {
      return;
    }
    if (!window.confirm("Delete this service?")) {
      return;
    }
    try {
      await apiClient.delete(`/services/${id}`);
      setServices((prev) => prev.filter((service) => service._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete service");
    }
  };

  const summaryItems = useMemo(() => {
    if (!services.length) {
      return [{ label: "Active services", value: 0 }];
    }

    const categories = new Set(
      services
        .map((service) => service.type?.trim())
        .filter((type) => Boolean(type))
    );
    const withPhone = services.filter((service) =>
      service.phone?.trim()
    ).length;
    const phoneCoverage = Math.round((withPhone / services.length) * 100);

    return [
      { label: "Active services", value: services.length },
      { label: "Service categories", value: categories.size || 0 },
      { label: "Phone coverage", value: `${phoneCoverage}%` },
    ];
  }, [services]);

  return (
    <section className="page">
      <PageHeader
        title="Pet Services Directory"
        description="Curate trusted vets, groomers, walkers, and more so owners can reach help fast."
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
              <span className="button__label">New service</span>
            </button>
          ) : !user ? (
            <Link
              className="button button--icon"
              to="/login"
              state={{ from: "/services" }}
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
        title="Service roster"
        description="A quick-glance view of everyone helping your community of pets."
      >
        {!services.length ? (
          <EmptyState
            title="No services yet"
            description="Add your go-to groomer, sitter, or vet to build out the directory."
            action={
              isProvider ? (
                <button
                  type="button"
                  className="button"
                  onClick={openCreateModal}
                >
                  Add a service
                </button>
              ) : !user ? (
                <Link
                  className="button"
                  to="/login"
                  state={{ from: "/services" }}
                >
                  Log in to manage
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="list-grid">
            {services.map((service) => (
              <article key={service._id} className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">{service.name}</h3>
                    <p className="card-subtitle">
                      {service.type || "General pet service"}
                    </p>
                  </div>
                </div>
                <div className="card-body">
                  {service.description ||
                    "No description yet. Add a note about specialties or availability."}
                </div>
                <ul className="meta-list">
                  {service.address && <li>Address: {service.address}</li>}
                  {service.phone && <li>Phone: {service.phone}</li>}
                </ul>
                {isProvider && (
                  <div className="card-actions">
                    <button type="button" onClick={() => handleEdit(service)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => handleDelete(service._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? "Update service" : "Add a new service"}
        description="Keep details polished so pet parents always know who to call."
      >
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Business name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Happy Paws Grooming"
                data-autofocus
                required
              />
            </label>
            <label>
              Service type
              <input
                name="type"
                value={form.type}
                onChange={handleChange}
                placeholder="Groomer, vet, walker..."
              />
            </label>
            <label>
              Address
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="123 Main St, Seattle"
              />
            </label>
            <label>
              Phone
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
              />
            </label>
          </div>

          <label className="form-row">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Share hours, specialties, or why you recommend them."
            />
          </label>

          {error && <p className="error">{error}</p>}

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {editingId ? "Save service" : "Create service"}
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

export default ServicesPage;
