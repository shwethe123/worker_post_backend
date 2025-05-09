const orderTasks = require('../../models/usertasks/userTask');

const mongoose  = require("mongoose");

const tacksController = {
    createPost: async (req, res) => {
        try {
            const {postId, content, task, state, user_time} = req.body;
            if (!postId, !content, !task, !state, !user_time) {
                return res.status(400).json({msg: 'All fields are required'});
            }
            const newTask = await orderTasks.create({
                postId, content, task, state, user_time
            });
            return res.status(201).json(newTask);
        } catch (error) {
            return res.status(500).json({msg: 'Error', error: error.message})
        }
    },

    getPost: async (req, res) => {
        try {
            const taskAll = await orderTasks.find().sort({ createdAt: -1});
            return res.json(taskAll);
        } catch (error) {
            return res.status(500).json({msg: 'Error', error: error.message})
        }
    },

    updatePost: async (req, res) => {
        try {
            const id = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ msg: 'Invalid ID format' });
            }
            const taskUpdate = await orderTasks.findByIdAndUpdate(id, {...req.body}, {new: true});
            return res.json(taskUpdate);
        } catch (error) {
            return res.status(500).json({msg: 'Error', error: error.message})
        }
    },

    deletePost: async (req, res) => {
        try {
            const id = req.params.id;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({msg: 'Invalid ID format'});
            }
            const taskDelete = await orderTasks.findByIdAndDelete(id, {...req.body}, {new: true});
            return res.json(taskDelete);
        } catch (error) {
            return res.status(500).json({msg: 'Error', error: error.message})
        }
    }
}

module.exports = tacksController;