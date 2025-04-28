const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middlewares/auth'); // သင်၏ authentication middleware

// Create a new post
exports.createPost = [
  auth,
  async (req, res) => {
    try {
      const { content } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const newPost = new Post({
        user: userId,
        content,
      });

      await newPost.save();

      // Populate user info for the response
      const populatedPost = await Post.findById(newPost._id)
        .populate('user', 'username avatar')
        .populate('likes', 'username avatar') // Populate likes array with user info
        .populate('comments.user', 'username avatar')
        .populate('comments.replies.user', 'username avatar');

      res.status(201).json(populatedPost);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
];

// Get all posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar')
      .populate('likes', 'username avatar') // Populate likes array with user info
      .populate('comments.user', 'username avatar')
      .populate('comments.replies.user', 'username avatar');

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like/unlike a post
exports.toggleLike = [
  auth,
  async (req, res) => {
    try {
      const postId = req.params.id; // ✅ ဒီလိုပြင်
      const userId = req.user.id;

      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      const likeIndex = post.likes.findIndex(like => like.toString() === userId);

      if (likeIndex === -1) {
        post.likes.push(userId);
      } else {
        post.likes.splice(likeIndex, 1);
      }

      await post.save();

      const populatedPost = await Post.findById(postId)
        .populate('user', 'username avatar')
        .populate('comments.user', 'username avatar')
        .populate('comments.replies.user', 'username avatar');

      const responsePost = {
        ...populatedPost.toObject(),
        likes: populatedPost.likes.map(like => like.toString())
      };

      res.json(responsePost);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
];



// Add comment to a post
exports.addComment = [
  auth,
  async (req, res) => {
    try {
      const postId = req.params.id;
      const { text } = req.body;
      const userId = req.user.id;

      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      post.comments.push({
        user: userId,
        text,
        timestamp: new Date(), // Add timestamp to the comment
      });

      await post.save();

      // Populate the new comment
      const populatedPost = await Post.findById(postId)
        .populate('user', 'username avatar')
        .populate('likes', 'username avatar')
        .populate('comments.user', 'username avatar')
        .populate('comments.replies.user', 'username avatar');

      const newComment = populatedPost.comments[post.comments.length - 1];
      res.json(newComment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
];

// Add reply to a comment
exports.addReply = [
  auth,
  async (req, res) => {
    try {
      const { postId, commentId } = req.params;
      const { text } = req.body;
      const userId = req.user.id;

      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      const comment = post.comments.id(commentId);
      if (!comment) return res.status(404).json({ message: 'Comment not found' });

      comment.replies.push({
        user: userId,
        text,
        timestamp: new Date(), // Add timestamp to the reply
      });

      await post.save();

      // Populate the new reply
      const populatedPost = await Post.findById(postId)
        .populate('user', 'username avatar')
        .populate('likes', 'username avatar')
        .populate('comments.user', 'username avatar')
        .populate('comments.replies.user', 'username avatar');

      const updatedComment = populatedPost.comments.id(commentId);
      const newReply = updatedComment.replies[updatedComment.replies.length - 1];

      res.json(newReply);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
];

// Delete a post
exports.deletePost = [
  auth,
  async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.user.id;

      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      // Check if the user is the owner of the post
      if (post.user.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized to delete this post' });
      }

      await Post.findByIdAndDelete(postId);

      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
];