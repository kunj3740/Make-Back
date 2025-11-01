const express = require('express');
const { updateTask } = require('../controllers/tasksController');
const router = express.Router();

router.put('/tasks/:taskId', updateTask);

module.exports = router;