const mongoose = require('mongoose');
const Tasks = require('../models/Tasks');
const { z } = require('zod');

exports.updateTask = async (req, res) => {
  const { z } = require('zod');
  const taskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
    description: z.string().optional(),
    dueDate: z.date().optional(),
    completed: z.boolean().optional()
  });

  try {
    const { taskId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ success: false, message: 'Invalid task ID' });
    }

    const parsedData = taskSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: parsedData.error.errors });
    }

    const updatedTask = await Tasks.findByIdAndUpdate(taskId, parsedData.data, { new: true });
    if (!updatedTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.status(200).json({ success: true, data: updatedTask, message: 'Task updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'An error occurred while updating the task', error: error.message });
  }
};