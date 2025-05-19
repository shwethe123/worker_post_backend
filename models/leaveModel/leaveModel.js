const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  mm_name: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  remark: {
    type: String,
    required: true
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  condition: {
    type: Boolean,
    default: false
  },
  half_day: {
    type: String,
    default: null
  },
   cloudinaryId:{
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 // 🔥 Auto-delete after 24 hours
  }
}, {
  timestamps: true // createdAt & updatedAt auto-managed
});

module.exports = mongoose.model('Leave', leaveSchema);
