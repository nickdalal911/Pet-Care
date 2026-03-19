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

const createInitialForm = () => ({
  title: "",
  species: "",
  breed: "",
  age: "",
  price: "",
  location: "",
  contactName: "",
  contactPhone: "",
  description: "",
  photos: [],
});

const formatInrPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "-";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numeric);
};

const ListingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isProvider = user?.role === "provider";
  const [listings, setListings] = useState([]);
  const [form, setForm] = useState(createInitialForm());
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchListings = async () => {
    try {
      const { data } = await apiClient.get("/listings");
      setListings(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load listings");
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotosChange = (event) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setForm((prev) => ({ ...prev, photos: files }));
  };

  const resetFormState = () => {
    setForm(createInitialForm());
    setEditingId(null);
  };

  const ensureProvider = () => {
    if (!user) {
      navigate("/login", { state: { from: "/listings" } });
      return false;
    }
    if (!isProvider) {
      setError("Only service providers can manage listings.");
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

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "photos") {
        value.forEach((file) => formData.append("photos", file));
        return;
      }
      formData.append(key, value);
    });

    try {
      if (editingId) {
        await apiClient.put(`/listings/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await apiClient.post("/listings", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      await fetchListings();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save listing");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (listing) => {
    if (!ensureProvider()) {
      return;
    }
    setEditingId(listing._id);
    setForm({
      title: listing.title || "",
      species: listing.species || "",
      breed: listing.breed || "",
      age: listing.age || "",
      price: listing.price != null ? String(listing.price) : "",
      location: listing.location || "",
      contactName: listing.contactName || "",
      contactPhone: listing.contactPhone || "",
      description: listing.description || "",
      photos: [],
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!ensureProvider()) {
      return;
    }
    if (!window.confirm("Delete this listing?")) {
      return;
    }
    try {
      await apiClient.delete(`/listings/${id}`);
      setListings((prev) => prev.filter((listing) => listing._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete listing");
    }
  };

  const summaryItems = useMemo(() => {
    return [{ label: "Active listings", value: listings.length }];
  }, [listings]);

  return (
    <section className="page">
      <PageHeader
        title="Marketplace Listings"
        description="Connect pets with loving homes and highlight must-have items for pet parents."
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
              <span className="button__label">New listing</span>
            </button>
          ) : !user ? (
            <Link
              className="button button--icon"
              to="/login"
              state={{ from: "/listings" }}
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
        title="Marketplace catalog"
        description="Give every pet and product a polished spotlight."
      >
        {!listings.length ? (
          <EmptyState
            title="No listings yet"
            description="Create your first post to start matching pets with their people."
            action={
              isProvider ? (
                <button
                  type="button"
                  className="button"
                  onClick={openCreateModal}
                >
                  Add a listing
                </button>
              ) : !user ? (
                <Link
                  className="button"
                  to="/login"
                  state={{ from: "/listings" }}
                >
                  Log in to manage
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="list-grid">
            {listings.map((listing) => (
              <article key={listing._id} className="card">
                <div className="listing-card-layout">
                  {listing.photos?.length > 0 && (
                    <div className="media-grid listing-card-layout__media">
                      {listing.photos.map((photo) => (
                        <div key={photo} className="card-media listing-media">
                          <img src={buildMediaUrl(photo)} alt={listing.title} />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="listing-card-layout__details">
                    <div className="card-header">
                      <div>
                        <h3 className="card-title">{listing.title}</h3>
                        <p className="card-subtitle">
                          {listing.location || "Location TBD"}
                        </p>
                      </div>
                      <div className="card-title">
                        {formatInrPrice(listing.price ?? 0)}
                      </div>
                    </div>
                    <div className="card-body">{listing.description}</div>
                    <ul className="meta-list">
                      {listing.species && <li>Species: {listing.species}</li>}
                      {listing.breed && <li>Breed: {listing.breed}</li>}
                      {listing.age && <li>Age: {listing.age}</li>}
                      {listing.contactName && (
                        <li>Contact person: {listing.contactName}</li>
                      )}
                      {listing.contactPhone && (
                        <li>Contact number: {listing.contactPhone}</li>
                      )}
                    </ul>
                  </div>
                </div>
                {isProvider && (
                  <div className="card-actions">
                    <button type="button" onClick={() => handleEdit(listing)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => handleDelete(listing._id)}
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
        title={editingId ? "Update listing" : "Add a new listing"}
        description="Describe the pet or item and add photos to help it stand out."
      >
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Listing title
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Loving golden retriever"
                data-autofocus
                required
              />
            </label>
            <label>
              Species
              <input
                name="species"
                value={form.species}
                onChange={handleChange}
                placeholder="Dog, cat, ..."
              />
            </label>
            <label>
              Breed
              <input
                name="breed"
                value={form.breed}
                onChange={handleChange}
                placeholder="Optional detail"
              />
            </label>
            <label>
              Age
              <input
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="e.g. 2 years"
              />
            </label>
            <label>
              Price (INR)
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 15000"
              />
            </label>
            <label>
              Location
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="City, state"
              />
            </label>
            <label>
              Contact person
              <input
                name="contactName"
                value={form.contactName}
                onChange={handleChange}
                placeholder="e.g. Rajesh Kumar"
              />
            </label>
            <label>
              Contact number
              <input
                name="contactPhone"
                value={form.contactPhone}
                onChange={handleChange}
                placeholder="e.g. +91 98xxxxxx10"
              />
            </label>
          </div>

          <label className="form-row">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Share details like temperament, condition, or bundle notes."
            />
          </label>

          <label className="form-row">
            Listing photos
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotosChange}
            />
          </label>

          {error && <p className="error">{error}</p>}

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {editingId ? "Save listing" : "Publish listing"}
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

export default ListingsPage;
