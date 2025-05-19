const express = require('express');
const leaveController = require('../../controllers/user_leave/leaveController');
const multer = require('multer');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({storage});

router.get('/', leaveController.getPost);

router.post('/', upload.single('image'), leaveController.createPost)

router.patch('/:id', leaveController.updatePost)

router.delete('/:id', leaveController.deletePost)

module.exports = router;