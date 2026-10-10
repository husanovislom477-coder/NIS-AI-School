const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  getActivities,
  getSettings,
  updateSettings,
  getMedia,
  uploadMedia,
  deleteMedia,
} = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../middleware/upload');

const router = express.Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Activity logs
router.get('/activities', getActivities);
router.get('/logs', getActivities);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Media Management
router.get('/media', getMedia);
router.post('/media/upload', upload.single('file'), uploadMedia);
router.delete('/media/:filename', deleteMedia);

module.exports = router;
