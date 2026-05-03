const Task = require('../models/Task');
const Project = require('../models/Project');

// GET /api/tasks  - dashboard: tasks assigned to current user
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id })
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .populate('createdBy', 'name')
      .sort({ dueDate: 1, createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/tasks/project/:projectId
const getProjectTasks = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Access check
    if (
      req.user.role !== 'Admin' &&
      !project.members.some((m) => m.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/tasks/project/:projectId  (Admin only)
const createTask = async (req, res) => {
  try {
    const { title, description, assignee, status, priority, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Task title is required' });

    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const task = await Task.create({
      title,
      description,
      project: req.params.projectId,
      assignee: assignee || null,
      createdBy: req.user._id,
      status: status || 'To Do',
      priority: priority || 'Medium',
      dueDate: dueDate || null,
    });

    const populated = await task.populate([
      { path: 'assignee', select: 'name email' },
      { path: 'createdBy', select: 'name' },
      { path: 'project', select: 'name' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isAdmin = req.user.role === 'Admin';
    const isAssignee =
      task.assignee && task.assignee.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Members can only update status
    if (!isAdmin) {
      if (req.body.status) task.status = req.body.status;
    } else {
      const { title, description, assignee, status, priority, dueDate } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignee !== undefined) task.assignee = assignee || null;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
    }

    await task.save();
    const updated = await task.populate([
      { path: 'assignee', select: 'name email' },
      { path: 'createdBy', select: 'name' },
      { path: 'project', select: 'name' },
    ]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/tasks/:id  (Admin only)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyTasks, getProjectTasks, createTask, updateTask, deleteTask };
