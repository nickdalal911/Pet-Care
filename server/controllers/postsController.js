import Post from "../models/Post.js";

const normalizePath = (file) => (file ? `/uploads/${file.filename}` : "");

export const getPosts = async (_req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "name email avatarUrl");

    res.json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch posts",
      error: error.message,
    });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name email avatarUrl"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch post",
      error: error.message,
    });
  }
};

export const createPost = async (req, res) => {
  const { caption } = req.body;

  try {
    const post = await Post.create({
      author: req.user._id,
      authorName: req.user.name,
      caption,
      imageUrl: normalizePath(req.file),
    });

    const populated = await post.populate(
      "author",
      "name email avatarUrl"
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create post",
      error: error.message,
    });
  }
};

export const updatePost = async (req, res) => {
  const { caption } = req.body;

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.author.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to update post" });
    }

    post.authorName = req.user.name;
    post.caption = caption ?? post.caption;

    if (req.file) {
      post.imageUrl = normalizePath(req.file);
    }

    const updated = await post.save();
    const populated = await updated.populate(
      "author",
      "name email avatarUrl"
    );

    res.json(populated);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update post",
      error: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.author.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete post" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete post",
      error: error.message,
    });
  }
};

export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .populate("author", "name email avatarUrl");

    res.json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch posts",
      error: error.message,
    });
  }
};

export const likePost = async (postId, userId) => {
  const post = await Post.findById(postId);

  if (!post) throw new Error("Post not found");

  if (!post.likes.includes(userId)) {
    post.likes.push(userId);
  }

  await post.save();
  return post;
};

export const commentOnPost = async (postId, userId, text) => {
  const post = await Post.findById(postId);

  if (!post) throw new Error("Post not found");

  post.comments.push({
    user: userId,
    text,
  });

  await post.save();
  return post;
};