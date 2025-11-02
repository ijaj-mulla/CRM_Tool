const express = require('express');
const router = express.Router();
const multer = require('multer');
const { importFromExcel } = require('../services/excelImporter');

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/ProductController');
const Product = require('../models/Product');

// GET /api/products - Get all products
router.get('/', getProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', getProductById);

// POST /api/products - Create new product
router.post('/', createProduct);

// PUT /api/products/:id - Update product
router.put('/:id', updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', deleteProduct);

// POST /api/products/import-excel - Import products from Excel
const upload = multer({ storage: multer.memoryStorage() });
router.post('/import-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const allowed = ['name', 'id', 'category', 'unitOfMeasure'];
    const summary = await importFromExcel(req.file.buffer, {
      model: Product,
      uniqueKey: 'id',
      allowedFields: allowed,
    });

    if (summary.processed === 0) {
      return res.status(400).json({ message: 'No valid rows to import' });
    }

    return res.json({ created: summary.created, updated: summary.updated, processed: summary.processed });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to import products' });
  }
});

module.exports = router;
