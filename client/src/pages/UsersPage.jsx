import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";
import { buildMediaUrl } from "../api/helpers";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import SummaryBar from "../components/SummaryBar";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const createFormFromUser = (user) => ({
  name: user?.name || "",
  bio: user?.bio || "",
  location: user?.location || "",
  licenseNumber: user?.licenseNumber || "",
  avatar: null,
});

const getErrorMessage = (error) =>
  error?.response?.data?.message || "Failed to update profile";

const UsersPage = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState(createFormFromUser(null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const roleLabel = useMemo(() => {
    if (user?.role === "provider") {
      return "Service provider";
    }
    return "Community member";
  }, [user?.role]);

  useEffect(() => {
    if (!user) {
      return;
    }
    setForm(createFormFromUser(user));
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, avatar: file }));
  };

  const openEditModal = () => {
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
    setForm(createFormFromUser(user));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("bio", form.bio);
    formData.append("location", form.location);
    if (user?.role === "provider") {
      formData.append("licenseNumber", form.licenseNumber || "");
    }
    if (form.avatar) {
      formData.append("avatar", form.avatar);
    }

    try {
      await apiClient.put("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshUser();
      closeModal();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const summaryItems = useMemo(() => {
    if (!user) {
      return [{ label: "Profile", value: "Guest" }];
    }

    const memberSince = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "—";

    return [
      { label: "Role", value: roleLabel },
      { label: "Email", value: user.email },
      { label: "Member since", value: memberSince },
    ];
  }, [roleLabel, user]);

  const avatarPreviewUrl = useMemo(() => {
    if (!form.avatar) {
      return "";
    }
    return URL.createObjectURL(form.avatar);
  }, [form.avatar]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  return (
    <section className="page">
      <PageHeader
        title="Your profile"
        description="Keep your caretaker details current so pet families know who is helping."
        meta={<SummaryBar items={summaryItems} />}
        actions={
          user ? (
            <button
              type="button"
              className="button button--icon"
              onClick={openEditModal}
            >
              <span aria-hidden="true" className="button__icon">
                ✏️
              </span>
              <span className="button__label">Edit profile</span>
            </button>
          ) : (
            <Link
              className="button button--icon"
              to="/login"
              state={{ from: "/users" }}
            >
              <span aria-hidden="true" className="button__icon">
                🔐
              </span>
              <span className="button__label">Log in</span>
            </Link>
          )
        }
      />

      <SectionCard
        title="Personal details"
        description="These details appear on the posts and services you share."
      >
        {user ? (
          <article className="card" data-testid="profile-card">
            <div className="profile-card">
              {user.avatarUrl ? (
                <div className="profile-card__avatar">
                  <img src={buildMediaUrl(user.avatarUrl)} alt={user.name} />
                </div>
              ) : (
                <div className="profile-card__avatar placeholder">🐾</div>
              )}
              <div className="profile-card__content">
                <div className="profile-card__heading">
                  <h3 className="card-title">{user.name}</h3>
                  <p className="card-subtitle">{roleLabel}</p>
                </div>
                <div className="card-body">
                  {user.bio || "Add a short bio to share your story."}
                </div>
                <ul className="meta-list">
                  <li>
                    <strong>Email:</strong> {user.email}
                  </li>
                  <li>
                    <strong>Location:</strong> {user.location || "Not set"}
                  </li>
                  {user.role === "provider" && user.licenseNumber && (
                    <li>
                      <strong>License:</strong> {user.licenseNumber}
                    </li>
                  )}
                  <li>
                    <strong>Joined:</strong> {summaryItems[2]?.value || "—"}
                  </li>
                </ul>
              </div>
            </div>
          </article>
        ) : (
          <EmptyState
            title="No profile yet"
            description="Log in to manage your caretaker profile and personalize the platform."
            action={
              <Link className="button" to="/login" state={{ from: "/users" }}>
                Log in
              </Link>
            }
          />
        )}
      </SectionCard>

      {user && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Update profile"
          description="Share a quick intro to build trust and highlight specialties."
        >
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jamie Reynolds"
                  data-autofocus
                  required
                />
              </label>
              <label>
                Location
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Portland, OR"
                />
              </label>
              {user.role === "provider" && (
                <label>
                  License number
                  <input
                    name="licenseNumber"
                    value={form.licenseNumber}
                    onChange={handleChange}
                    placeholder="Business license or permit"
                  />
                </label>
              )}
            </div>

            <label className="form-row">
              Bio
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Share experience, certifications, and what pets you love to care for."
              />
            </label>

            <div className="upload-field">
              <label>
                Avatar
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
              {avatarPreviewUrl && (
                <div className="avatar-preview">
                  <img
                    src={avatarPreviewUrl}
                    alt={form.name || "Avatar preview"}
                  />
                </div>
              )}
            </div>

            {error && <p className="error">{error}</p>}

            <div className="form-actions">
              <button type="submit" disabled={saving}>
                Save profile
              </button>
              <button
                type="button"
                className="secondary"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
};

export default UsersPage;
