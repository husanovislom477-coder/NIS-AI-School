const express = require('express');
const { getBranches, getBranch, createBranch, updateBranch, deleteBranch, getBranchCount } = require('../controllers/branchController');
const { authMiddleware } = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/count', authMiddleware, adminMiddleware, getBranchCount);
router.get('/', getBranches);
router.get('/:id', getBranch);
router.post('/', authMiddleware, adminMiddleware, upload.array('images', 6), createBranch);
router.put('/:id', authMiddleware, adminMiddleware, upload.array('images', 6), updateBranch);
router.delete('/:id', authMiddleware, adminMiddleware, deleteBranch);

module.exports = router;
