
const mongoose = require('mongoose');

const orderTaskSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    task: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true,
        enum: ['pending', 'in progress', 'completed'], // You can customize this
    },
    user_time: {
        type: Date,
        required: true
    }
}, { timestamps: true });

const orderTasks = mongoose.model('orderTasks', orderTaskSchema);

module.exports = orderTasks;
