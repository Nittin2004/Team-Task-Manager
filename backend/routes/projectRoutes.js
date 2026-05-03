const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getProjects);
router.post('/', protect, adminOnly, createProject);
router.get('/:id', protect, getProject);
router.put('/:id', protect, adminOnly, updateProject);
router.delete('/:id', protect, adminOnly, deleteProject);

module.exports = router;
