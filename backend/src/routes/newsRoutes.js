const express = require('express');
const { getNews, getAllNewsAdmin, getNewsItem, createNews, updateNews, deleteNews, getNewsCount } = require('../controllers/newsController');
const { authMiddleware } = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/count', authMiddleware, adminMiddleware, getNewsCount);
router.get('/admin/all', authMiddleware, adminMiddleware, getAllNewsAdmin);
router.get('/', getNews);
router.get('/:id', getNewsItem);
router.post('/', authMiddleware, adminMiddleware, upload.single('coverImage'), createNews);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('coverImage'), updateNews);
router.delete('/:id', authMiddleware, adminMiddleware, deleteNews);

module.exports = router;
