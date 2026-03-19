import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { buildMediaUrl } from "../api/helpers";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

const createInitialForm = () => ({
  caption: "",
  image: null,
});

const createInteractionState = () => ({
  likes: 0,
  liked: false,
  comments: [],
});

const PostsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManagePosts = Boolean(
    user && ["user", "provider"].includes(user.role)
  );
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(createInitialForm());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuPostId, setMenuPostId] = useState(null);
  const [interactions, setInteractions] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [activeCommentId, setActiveCommentId] = useState(null);
  const menuRef = useRef(null);
  const commentInputRef = useRef(null);

  const fetchPosts = async () => {
    try {
      const { data } = await apiClient.get("/posts");
      setPosts(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load posts");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    setInteractions((prev) => {
      const next = {};
      posts.forEach((post) => {
        next[post._id] = prev[post._id] || createInteractionState();
      });
      return next;
    });
    setCommentDrafts((prev) => {
      const next = {};
      posts.forEach((post) => {
        next[post._id] = prev[post._id] || "";
      });
      return next;
    });
  }, [posts]);

  useEffect(() => {
    if (!menuPostId) {
      menuRef.current = null;
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuPostId(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuPostId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuPostId]);

  useEffect(() => {
    if (activeCommentId && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, [activeCommentId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, image: file }));
  };

  const resetFormState = () => {
    setForm(createInitialForm());
    setEditingId(null);
  };

  const openCreateModal = () => {
    if (!canManagePosts) {
      if (!user) {
        navigate("/login", { state: { from: "/posts" } });
      } else {
        setError("Your account cannot create posts.");
      }
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

    if (!canManagePosts) {
      setError("Your account cannot modify posts.");
      return;
    }

    const formData = new FormData();
    formData.append("caption", form.caption);
    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      if (editingId) {
        await apiClient.put(`/posts/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await apiClient.post("/posts", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      await fetchPosts();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingId(post._id);
    setForm({
      caption: post.caption,
      image: null,
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) {
      return;
    }
    try {
      await apiClient.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((post) => post._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete post");
    }
  };

  const isPostOwner = (post) => {
    if (!user) {
      return false;
    }
    const author = post.author;
    if (author?._id) {
      return author._id === user._id;
    }
    if (typeof author === "string") {
      return author === user._id;
    }
    return post.authorName === user.name;
  };

  const updateInteraction = (postId, updater) => {
    setInteractions((prev) => {
      const current = prev[postId] || createInteractionState();
      const updated = updater(current);
      return { ...prev, [postId]: updated };
    });
  };

  const toggleLike = (postId) => {
    updateInteraction(postId, (entry) => {
      const liked = !entry.liked;
      const likes = Math.max(0, entry.likes + (liked ? 1 : -1));
      return { ...entry, liked, likes };
    });
  };

  const toggleCommentVisibility = (postId) => {
    setActiveCommentId((prev) => (prev === postId ? null : postId));
  };

  const handleCommentChange = (postId, value) => {
    setCommentDrafts((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCommentSubmit = (event, postId) => {
    event.preventDefault();
    const draft = (commentDrafts[postId] || "").trim();
    if (!draft) {
      return;
    }

    updateInteraction(postId, (entry) => ({
      ...entry,
      comments: [
        ...entry.comments,
        {
          id: `${postId}-${Date.now()}`,
          text: draft,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
  };

  const toggleMenu = (postId) => {
    setMenuPostId((prev) => (prev === postId ? null : postId));
  };

  const formatTimestamp = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleString();
  };

  return (
    <section className="page">
      <PageHeader
        title="Pet Posts"
        description="Celebrate every milestone and adorable moment from your community feed."
        actions={
          canManagePosts ? (
            <button
              type="button"
              className="button button--icon"
              onClick={openCreateModal}
            >
              <span aria-hidden="true" className="button__icon">
                +
              </span>
              <span className="button__label">New post</span>
            </button>
          ) : !user ? (
            <Link
              className="button button--icon"
              to="/login"
              state={{ from: "/posts" }}
            >
              <span aria-hidden="true" className="button__icon">
                🔐
              </span>
              <span className="button__label">Log in to post</span>
            </Link>
          ) : (
            <span className="role-note">Posting disabled for this role</span>
          )
        }
      />

      <SectionCard
        title="Community feed"
        description="All the stories that bring tails wagging and whiskers twitching."
      >
        {!posts.length ? (
          <EmptyState
            title="No posts yet"
            description="Start the story by adding your first update."
            action={
              canManagePosts ? (
                <button
                  type="button"
                  className="button"
                  onClick={openCreateModal}
                >
                  Add a post
                </button>
              ) : !user ? (
                <Link className="button" to="/login" state={{ from: "/posts" }}>
                  Log in to post
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="list-grid post-list">
            {posts.map((post) => (
              <article key={post._id} className="card post-card">
                <div className="card-header">
                  <div className="post-author-section">
                    {post.author?._id ? (
                      <Link
                        to="/users"
                        className="post-author-avatar"
                        title={post.author?.name || "View profile"}
                      >
                        {post.author?.avatarUrl ? (
                          <img
                            src={buildMediaUrl(post.author.avatarUrl)}
                            alt={post.author.name}
                          />
                        ) : (
                          <span className="post-author-avatar__placeholder">
                            🐾
                          </span>
                        )}
                      </Link>
                    ) : (
                      <div className="post-author-avatar">
                        <span className="post-author-avatar__placeholder">
                          🐾
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="card-title">
                        {post.author?._id ? (
                          <Link
                            to="/users"
                            className="post-author-name"
                          >
                            {post.author?.name || post.authorName || "Pet lover"}
                          </Link>
                        ) : (
                          <span>
                            {post.author?.name || post.authorName || "Pet lover"}
                          </span>
                        )}
                      </h3>
                      <p className="card-subtitle">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {isPostOwner(post) ? (
                    <div
                      className="card-menu"
                      ref={menuPostId === post._id ? menuRef : undefined}
                    >
                      <button
                        type="button"
                        className="icon-button icon-button--ghost"
                        aria-haspopup="menu"
                        aria-expanded={menuPostId === post._id}
                        onClick={() => toggleMenu(post._id)}
                      >
                        &hellip;
                      </button>
                      {menuPostId === post._id && (
                        <div className="card-menu__list" role="menu">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setMenuPostId(null);
                              handleEdit(post);
                            }}
                          >
                            Edit post
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setMenuPostId(null);
                              handleDelete(post._id);
                            }}
                          >
                            Delete post
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
                <div className="card-body">{post.caption}</div>
                {post.imageUrl && (
                  <div className="card-media post-media">
                    <img
                      src={buildMediaUrl(post.imageUrl)}
                      alt={post.caption}
                    />
                  </div>
                )}
                {(() => {
                  const interaction =
                    interactions[post._id] || createInteractionState();
                  const likeLabel = interaction.likes === 1 ? "Like" : "Likes";
                  const commentCount = interaction.comments.length;
                  const commentLabel =
                    commentCount === 1 ? "Comment" : "Comments";

                  return (
                    <div className="card-footer">
                      <div className="card-footer__actions">
                        <button
                          type="button"
                          className={`button ghost button--sm ${
                            interaction.liked ? "is-active" : ""
                          }`.trim()}
                          onClick={() => toggleLike(post._id)}
                          aria-pressed={interaction.liked}
                        >
                          <span className="button__label">
                            {interaction.liked ? "Liked" : "Like"}
                          </span>
                          <span className="button__count">
                            {interaction.likes} {likeLabel}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="button ghost button--sm"
                          onClick={() => toggleCommentVisibility(post._id)}
                          aria-expanded={activeCommentId === post._id}
                        >
                          <span className="button__label">Comment</span>
                          <span className="button__count">
                            {commentCount} {commentLabel}
                          </span>
                        </button>
                      </div>
                      {commentCount > 0 && (
                        <ul className="comment-list">
                          {interaction.comments.map((comment) => (
                            <li key={comment.id}>
                              <p className="comment-list__text">
                                {comment.text}
                              </p>
                              <span className="comment-list__meta">
                                {formatTimestamp(comment.createdAt)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {activeCommentId === post._id && (
                        <form
                          className="comment-form"
                          onSubmit={(event) =>
                            handleCommentSubmit(event, post._id)
                          }
                        >
                          <input
                            ref={commentInputRef}
                            type="text"
                            className="comment-input"
                            value={commentDrafts[post._id] || ""}
                            onChange={(event) =>
                              handleCommentChange(post._id, event.target.value)
                            }
                            placeholder="Share your thoughts"
                            aria-label="Add a comment"
                          />
                          <button
                            type="submit"
                            className="button button--sm"
                            disabled={!commentDrafts[post._id]?.trim()}
                          >
                            Post
                          </button>
                        </form>
                      )}
                    </div>
                  );
                })()}
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? "Update post" : "Share a new moment"}
        description="Upload a photo and add a caption to keep your pet families connected."
      >
        <form className="form" onSubmit={handleSubmit}>
          <label htmlFor="image">
            Feature image
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>

          <label htmlFor="caption" className="form-row">
            Caption
            <textarea
              id="caption"
              name="caption"
              value={form.caption}
              onChange={handleChange}
              placeholder="Tell everyone what happened."
              data-autofocus
              required
            />
          </label>

          {error && <p className="error">{error}</p>}

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {editingId ? "Save changes" : "Publish post"}
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

export default PostsPage;
