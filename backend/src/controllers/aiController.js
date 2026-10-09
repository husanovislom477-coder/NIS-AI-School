const { processChatMessage, getAIStatus } = require('../services/aiService');

// In-memory rate limiting map for AI requests: per IP / per user
const rateLimitMap = new Map();

/**
 * @desc  Send a message to NIS AI AGENT (powered by Google Gemini)
 * @route POST /api/ai/chat OR POST /api/chat
 * @access Public
 */
const chatWithAIAgent = async (req, res, next) => {
  try {
    const { message, language = 'en', history = [] } = req.body;
    const clientIdentifier = req.user?.id || req.ip || 'anonymous';

    // 1. Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a valid text string.',
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.',
      });
    }

    if (trimmedMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message is too long. Please keep your question under 1000 characters.',
      });
    }

    // 2. Rate limiting (30 requests per minute per IP / client)
    const now = Date.now();
    const clientWindow = rateLimitMap.get(clientIdentifier) || [];
    const validRequests = clientWindow.filter((ts) => now - ts < 60000);

    if (validRequests.length >= 30) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait a moment before sending another message.',
      });
    }

    validRequests.push(now);
    rateLimitMap.set(clientIdentifier, validRequests);

    // 3. Process message with Google Gemini
    const lang = language || req.language || 'en';
    const result = await processChatMessage({
      message: trimmedMessage,
      language: lang,
      history: Array.isArray(history) ? history.slice(-8) : [],
    });

    if (!result.success) {
      const statusCode =
        result.error === 'MISSING_API_KEY'
          ? 503
          : result.error === 'INVALID_API_KEY'
          ? 401
          : result.error === 'MODEL_NOT_FOUND'
          ? 404
          : result.error === 'API_RESTRICTION'
          ? 403
          : result.error === 'CONTENT_FILTER'
          ? 400
          : result.error === 'RATE_LIMIT'
          ? 429
          : 502;

      return res.status(statusCode).json({
        success: false,
        error: result.error,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: result.message,
      actions: result.actions || [],
      model: result.model || 'gemini-2.5-flash',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI Controller Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'NIS AI Assistant is temporarily unavailable. Please try again shortly.',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * @desc  Diagnostic health check for AI environment configuration (no secrets exposed)
 * @route GET /api/ai/status OR GET /api/chat/status
 * @access Public
 */
const checkAIStatus = async (req, res) => {
  try {
    const status = getAIStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

module.exports = {
  chatWithAIAgent,
  checkAIStatus,
};
