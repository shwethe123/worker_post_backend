const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const auth = require('../middlewares/auth')

// Register a new user
router.post('/register', userController.register)

// Login user
router.post('/login', userController.login)

// Get user profile
router.get('/profile', auth, userController.getProfile)

module.exports = router