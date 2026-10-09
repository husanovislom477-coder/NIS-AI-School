const express = require('express');
const { getEvents, getAllEventsAdmin, getEvent, createEvent, updateEvent, deleteEvent, getEventCount } = require('../controllers/eventController');
const { authMiddleware } = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/count', authMiddleware, adminMiddleware, getEventCount);
router.get('/admin/all', authMiddleware, adminMiddleware, getAllEventsAdmin);
router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', authMiddleware, adminMiddleware, upload.single('coverImage'), createEvent);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('coverImage'), updateEvent);
router.delete('/:id', authMiddleware, adminMiddleware, deleteEvent);

module.exports = router;
