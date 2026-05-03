const Project = require('../models/Project');
const Task = require('../models/Task');

// GET /api/projects
const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      projects = await Project.find()
        .populate('owner', 'name email')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });
    } else {
      projects = await Project.find({ members: req.user._id })
        .populate('owner', 'name email')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/projects  (Admin only)
const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: members || [],
    });

    const populated = await project.populate([
      { path: 'owner', select: 'name email' },
      { path: 'members', select: 'name email role' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/projects/:id
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email role');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Members can only access their own projects
    if (
      req.user.role !== 'Admin' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/projects/:id  (Admin only)
const updateProject = async (req, res) => {
  try {
    const { name, description, members, status } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (members) project.members = members;
    if (status) project.status = status;

    await project.save();
    const updated = await project.populate([
      { path: 'owner', select: 'name email' },
      { path: 'members', select: 'name email role' },
    ]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/projects/:id  (Admin only)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, createProject, getProject, updateProject, deleteProject };
