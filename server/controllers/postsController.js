const Post = require("../models/Post");

const normalizePath = (file) => (file ? `/uploads/${file.filename}` : "");

exports.getPosts = async (_req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "name email avatarUrl");
    res.json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch posts", error: error.message });
  }
};

exports.getPostById = async (req, res) => {
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
    res
      .status(500)
      .json({ message: "Failed to fetch post", error: error.message });
  }
};

exports.createPost = async (req, res) => {
  const { caption } = req.body;

  try {
    const post = await Post.create({
      author: req.user._id,
      authorName: req.user.name,
      caption,
      imageUrl: normalizePath(req.file),
    });
    const populated = await post.populate("author", "name email avatarUrl");
    res.status(201).json(populated);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create post", error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  const { caption } = req.body;

  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to update post" });
    }

    post.authorName = req.user.name;
    post.caption = caption ?? post.caption;
    if (req.file) {
      post.imageUrl = normalizePath(req.file);
    }

    const updated = await post.save();
    const populated = await updated.populate("author", "name email avatarUrl");
    res.json(populated);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update post", error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to delete post" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete post", error: error.message });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .populate("author", "name email avatarUrl");
    res.json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch posts", error: error.message });
  }
};
