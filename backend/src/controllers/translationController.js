const translations = require('../data/translations');

// @desc   Get all available translations or query specific language
// @route  GET /api/translations
// @access Public
const getTranslations = (req, res) => {
  const { lang } = req.query;
  if (lang && translations[lang]) {
    return res.json({
      success: true,
      lang,
      translations: translations[lang],
    });
  }
  return res.json({
    success: true,
    languages: Object.keys(translations),
    translations,
  });
};

// @desc   Get translation dictionary for specific language
// @route  GET /api/translations/:lang
// @access Public
const getTranslationByLang = (req, res) => {
  const lang = req.params.lang?.toLowerCase();
  const dict = translations[lang] || translations.en || translations.uz;
  return res.json({
    success: true,
    lang: translations[lang] ? lang : 'en',
    translations: dict,
  });
};

module.exports = {
  getTranslations,
  getTranslationByLang,
};
