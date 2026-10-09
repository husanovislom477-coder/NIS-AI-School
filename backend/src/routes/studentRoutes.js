const express = require('express');
const { getStudents, getStudent, createStudent, updateStudent, deleteStudent, getStudentCount } = require('../controllers/studentController');
const { authMiddleware } = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/count', authMiddleware, adminMiddleware, getStudentCount);
router.get('/', getStudents);
router.get('/:id', getStudent);
router.post('/', authMiddleware, adminMiddleware, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'certificatePhoto', maxCount: 1 }]), createStudent);
router.put('/:id', authMiddleware, adminMiddleware, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'certificatePhoto', maxCount: 1 }]), updateStudent);
router.delete('/:id', authMiddleware, adminMiddleware, deleteStudent);

module.exports = router;
