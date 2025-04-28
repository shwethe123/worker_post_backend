const express = require('express')
const router = express.Router()
const postController = require('../controllers/postController')
const auth = require('../middlewares/auth')

// Create a post
router.post('/', auth, postController.createPost)

// Get all posts
router.get('/', auth, postController.getPosts)

// Like/unlike a post
router.put('/:id/like', auth, postController.toggleLike)

// Add comment to a post
router.post('/:id/comments', auth, postController.addComment)

// Add reply to a comment
router.post('/:postId/comments/:commentId/replies', auth, postController.addReply)

// Delete a post
router.delete('/:id', auth, postController.deletePost)

module.exports = router