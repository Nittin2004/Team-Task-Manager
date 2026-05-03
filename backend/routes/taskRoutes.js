const express = require('express');
const router = express.Router();
const {
  getMyTasks,
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getMyTasks);
router.get('/project/:projectId', protect, getProjectTasks);
router.post('/project/:projectId', protect, adminOnly, createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, adminOnly, deleteTask);

module.exports = router;
