const {
  listLanguages,
  findLanguageByCode,
  createLanguage: dbCreateLanguage,
  updateLanguage: dbUpdateLanguage,
  toggleLanguage: dbToggleLanguage,
  deleteLanguage: dbDeleteLanguage,
} = require('../services/db');

// @desc   Get all languages
// @route  GET /api/languages
// @access Public (all=true requires admin or returns all)
const getLanguages = async (req, res, next) => {
  try {
    const showAll = req.query.all === 'true' || req.query.all === '1';
    const languages = await listLanguages({ all: showAll });
    res.json({
      success: true,
      count: languages.length,
      data: languages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single language by code
// @route  GET /api/languages/:code
// @access Public
const getLanguage = async (req, res, next) => {
  try {
    const lang = await findLanguageByCode(req.params.code);
    if (!lang) {
      return res.status(404).json({ success: false, message: 'Til topilmadi.' });
    }
    res.json({ success: true, data: lang });
  } catch (error) {
    next(error);
  }
};

// @desc   Create new language
// @route  POST /api/languages
// @access Private/Admin
const createLanguage = async (req, res, next) => {
  try {
    const { code, name, nativeName, flag, direction, isEnabled, order } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Til kodi va nomi talab qilinadi.' });
    }

    const created = await dbCreateLanguage({
      code,
      name,
      nativeName: nativeName || name,
      flag: flag || '🌐',
      direction: direction || 'ltr',
      isEnabled: isEnabled !== false,
      order,
    });

    res.status(201).json({
      success: true,
      message: 'Yangi til muvaffaqiyatli qo‘shildi.',
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Update language
// @route  PUT /api/languages/:code
// @access Private/Admin
const updateLanguage = async (req, res, next) => {
  try {
    const updated = await dbUpdateLanguage(req.params.code, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Til topilmadi.' });
    }
    res.json({
      success: true,
      message: 'Til ma‘lumotlari muvaffaqiyatli yangilandi.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Toggle enable/disable language
// @route  PATCH /api/languages/:code/toggle
// @access Private/Admin
const toggleLanguage = async (req, res, next) => {
  try {
    const updated = await dbToggleLanguage(req.params.code);
    res.json({
      success: true,
      message: updated.isEnabled ? 'Til faollashtirildi.' : 'Til o‘chirib qo‘yildi.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete language
// @route  DELETE /api/languages/:code
// @access Private/Admin
const deleteLanguage = async (req, res, next) => {
  try {
    await dbDeleteLanguage(req.params.code);
    res.json({
      success: true,
      message: 'Til muvaffaqiyatli o‘chirildi.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLanguages,
  getLanguage,
  createLanguage,
  updateLanguage,
  toggleLanguage,
  deleteLanguage,
};
