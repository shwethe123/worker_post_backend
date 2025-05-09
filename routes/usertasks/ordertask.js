const express = require('express');
const orderTask_controller = require('../../controllers/usertasks/tacksController');

const router = express.Router();

router.post('/', orderTask_controller.createPost)

router.get('/', orderTask_controller.getPost)

router.patch('/:id', orderTask_controller.updatePost)

router.delete('/:id', orderTask_controller.deletePost)

module.exports = router;

