const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middlewares/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

exports.createPost = [
  auth,
  async (req, res) => {
    try {
      const { content } = req.body;
      const userId = req.user.id;

      if (!content && !req.file) {
        return res.status(400).json({ message: 'Content or image is required' });
      }

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      let imageUrl = null;
      if (req.file) {
        try {
          // Convert buffer to base64
          const b64 = Buffer.from(req.file.buffer).toString('base64');
          const dataURI = `data:${req.file.mimetype};base64,${b64}`;
          
          const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'posts',
            resource_type: 'auto'
          });
          imageUrl = result.secure_url;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(500).json({ message: 'Image upload failed' });
        }
      }

      const newPost = new Post({
        user: userId,
        content,
        image: imageUrl
      });

      const savedPost = await newPost.save();
      
      const populatedPost = await Post.findById(savedPost._id)
        .populate('user', 'username avatar')
        .populate('likes', 'username avatar')
        .populate('comments.user', 'username avatar');

      res.status(201).json(populatedPost);
    } catch (error) {
      console.error('Post creation error:', error);
      res.status(500).json({ message: error.message });
    }
  }
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