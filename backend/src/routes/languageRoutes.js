const express = require('express');
const router = express.Router();
const {
  getLanguages,
  getLanguage,
  createLanguage,
  updateLanguage,
  toggleLanguage,
  deleteLanguage,
} = require('../controllers/languageController');
const { authMiddleware } = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Public route to get enabled languages (or all if admin)
router.get('/', getLanguages);
router.get('/:code', getLanguage);

// Admin-only management routes
router.post('/', authMiddleware, adminMiddleware, createLanguage);
router.put('/:code', authMiddleware, adminMiddleware, updateLanguage);
router.patch('/:code/toggle', authMiddleware, adminMiddleware, toggleLanguage);
router.delete('/:code', authMiddleware, adminMiddleware, deleteLanguage);

module.exports = router;
