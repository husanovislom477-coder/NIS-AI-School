const express = require('express');
const {
  submitApplication,
  getMyApplications,
  getApplicationById,
  getAllApplicationsAdmin,
  updateApplicationStatus,
  deleteApplication,
} = require('../controllers/applicationController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../middleware/upload');

const router = express.Router();

// Public / Semi-authenticated application submission with optional file uploads
router.post('/', optionalAuth, upload.array('documents', 5), submitApplication);

// User's own applications
router.get('/my', authMiddleware, getMyApplications);

// Admin routes (must precede /:id)
router.get('/admin/all', authMiddleware, adminMiddleware, getAllApplicationsAdmin);
router.patch('/admin/:id/status', authMiddleware, adminMiddleware, updateApplicationStatus);

// Single application details & delete
router.get('/:id', authMiddleware, getApplicationById);
router.delete('/:id', authMiddleware, adminMiddleware, deleteApplication);

module.exports = router;
