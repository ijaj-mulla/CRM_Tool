const Task = require('../models/Task');

const createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    const saved = await task.save();
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Cannot create task' });
  }
};

const getTasks = async (_req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    return res.status(200).json(tasks);
  } catch (err) {
    return res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createTask, getTasks };


