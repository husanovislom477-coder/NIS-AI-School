const express = require('express');
const { chatWithAIAgent, checkAIStatus } = require('../controllers/aiController');

const router = express.Router();

// Health and non-sensitive diagnostic endpoint
router.get('/status', checkAIStatus);
router.get('/', checkAIStatus);

// Supported chat endpoints:
// POST /api/ai/chat
// POST /api/chat
router.post('/chat', chatWithAIAgent);
router.post('/', chatWithAIAgent);

module.exports = router;
