const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectCount,
} = require('../controllers/projectController');
const { authMiddleware } = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/count', authMiddleware, adminMiddleware, getProjectCount);
router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', authMiddleware, adminMiddleware, upload.single('projectImage'), createProject);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('projectImage'), updateProject);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProject);

module.exports = router;
