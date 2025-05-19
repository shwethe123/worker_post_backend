const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const morgan = require('morgan');

// Load environment variables
dotenv.config()

// Import routes
const postRoutes = require('./routes/postRoutes')
const userRoutes = require('./routes/userRoutes')
const userTask = require('./routes/usertasks/ordertask')
const user_leave = require('./routes/user_leave/user_leave')

// Initialize Express app
const app = express();
app.use(morgan('dev'));

// Middleware
app.use(cors())
app.use(express.json())
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:5173'],
    credentials: true
  }))

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err))

// Routes
app.use('/api/posts', postRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tasks', userTask)
app.use('/api/leave', user_leave)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})