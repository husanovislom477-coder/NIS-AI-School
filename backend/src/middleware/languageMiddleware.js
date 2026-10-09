/**
 * Language extraction middleware for NIS AI School API
 * Supports:
 * 1. Explicit query parameter: ?language=uz or ?lang=uz
 * 2. Header: Accept-Language (e.g. 'uz', 'en-US,en;q=0.9', 'ru')
 * 3. Authenticated user preference: req.user.language || req.user.languageCode
 * 4. Default fallback: 'en'
 */
const languageMiddleware = (req, res, next) => {
  let selected = '';

  // 1. Query parameter
  if (req.query.language) {
    selected = String(req.query.language).trim();
  } else if (req.query.lang) {
    selected = String(req.query.lang).trim();
  }

  // 2. Accept-Language header
  if (!selected && req.headers['accept-language']) {
    const raw = req.headers['accept-language'];
    // Take the primary tag (e.g. 'en-US,en;q=0.9' -> 'en')
    const primary = raw.split(',')[0].split(';')[0].trim();
    if (primary) {
      selected = primary.split('-')[0].toLowerCase();
    }
  }

  // 3. User account preference if logged in
  if (!selected && req.user) {
    selected = req.user.languageCode || req.user.language;
  }

  // 4. Default requirement is English ('en')
  if (!selected) {
    selected = 'en';
  }

  // Clean and assign
  req.language = selected.toLowerCase();

  // Also set response header for clarity
  res.setHeader('Content-Language', req.language);

  next();
};

module.exports = languageMiddleware;
