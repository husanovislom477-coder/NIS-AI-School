const express = require('express');
const router = express.Router();
const {
  getTranslations,
  getTranslationByLang,
} = require('../controllers/translationController');

router.get('/', getTranslations);
router.get('/:lang', getTranslationByLang);

module.exports = router;
