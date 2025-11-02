const express= require('express');
const router= express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createQuote, getQuotes, updateQuote, getQuoteById, deleteQuote, searchAccount, searchContact, searchProduct } = require('../controllers/QuoteController');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/quotes_pdfs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'quote-' + uniqueSuffix + '.pdf');
  }
});

const fileFilter = (req, file, cb) => {
  // Only accept PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/', upload.single('pdf_file'), createQuote);
router.get('/', getQuotes);
// Search endpoints
router.get('/search/account', searchAccount);
router.get('/search/contact', searchContact);
router.get('/search/product', searchProduct);

// ID-based operations (keep after specific routes like /search/*)
router.get('/:id', getQuoteById);
router.put('/:id', upload.single('pdf_file'), updateQuote);
router.delete('/:id', deleteQuote);

module.exports= router;