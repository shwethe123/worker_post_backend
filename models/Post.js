const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  replies: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
})

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now }
})

postSchema.virtual('timestamp').get(function() {
  return timeSince(this.createdAt)
})

commentSchema.virtual('timestamp').get(function() {
  return timeSince(this.createdAt)
})

function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000)
  
  let interval = Math.floor(seconds / 31536000)
  if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`
  
  interval = Math.floor(seconds / 2592000)
  if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`
  
  interval = Math.floor(seconds / 86400)
  if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`
  
  interval = Math.floor(seconds / 3600)
  if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`
  
  interval = Math.floor(seconds / 60)
  if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`
  
  return 'Just now'
}

module.exports = mongoose.model('Post', postSchema)