const express = require('express');
const { updateTask, createTask } = require('../controllers/tasksController');
const router = express.Router();

router.put('/tasks/:taskId', updateTask);
router.post('/tasks', createTask);

module.exports = router;