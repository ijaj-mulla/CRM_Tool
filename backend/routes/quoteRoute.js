const express= require('express');
const router= express.Router();
const { createQuote, getQuotes } = require('../controllers/QuoteController');

router.post('/', createQuote);
router.get('/', getQuotes);

module.exports= router;