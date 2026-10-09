const express = require('express');
const { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher, getTeacherCount } = require('../controllers/teacherController');
const { authMiddleware } = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/count', authMiddleware, adminMiddleware, getTeacherCount);
router.get('/', getTeachers);
router.get('/:id', getTeacher);
router.post('/', authMiddleware, adminMiddleware, upload.single('photo'), createTeacher);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('photo'), updateTeacher);
router.delete('/:id', authMiddleware, adminMiddleware, deleteTeacher);

module.exports = router;
