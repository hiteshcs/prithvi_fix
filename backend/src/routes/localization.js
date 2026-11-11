const express = require('express');
const router = express.Router();
const {
  getSupportedLanguages,
  getLanguageDictionary,
  translateText,
} = require('../controllers/localizationController');

router.get('/languages', getSupportedLanguages);
router.get('/translate', translateText);
router.get('/:lang', getLanguageDictionary);

module.exports = router;
