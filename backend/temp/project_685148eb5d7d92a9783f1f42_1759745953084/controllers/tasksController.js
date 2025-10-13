const mongoose = require('mongoose');
const Tasks = require('../models/Tasks');
const { z } = require('zod');

exports.updateTask = async (req, res) => {
  
  const { z } = require('zod');
  const taskSchema = z.object({
    title: z.string().max(100, 'Title cannot exceed 100 characters').optional(),
    description: z.string().optional(),
    dueDate: z.date().optional(),
    completed: z.boolean().optional()
  });

  try {
    const { taskId } = req.params;
    console.log(req.params)
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ success: false, message: 'Invalid task ID' });
    }

    const validation = taskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: validation.error.errors });
    }

    const updatedTask = await Tasks.findByIdAndUpdate(taskId, validation.data, { new: true });
    if (!updatedTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.status(200).json({ success: true, data: updatedTask, message: 'Task updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'An error occurred while updating the task', error: error.message });
  }
};

exports.createTask = async (req, res) => {
  const { z } = require('zod');
  const taskSchema = z.object({
    userId: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), { message: 'Invalid user ID' }),
    title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
    description: z.string().optional(),
    dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: 'Invalid date format' })
  });

  try {
    const { userId, title, description, dueDate } = taskSchema.parse(req.body);
    const task = await Tasks.create({ userId, title, description, dueDate: new Date(dueDate) });
    return res.status(201).json({ success: true, data: task, message: 'Task created successfully' });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: 'Validation error', error: error.errors });
    }
    return res.status(500).json({ success: false, message: 'An error occurred while creating the task', error: error.message });
  }
};