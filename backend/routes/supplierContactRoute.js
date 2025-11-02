const express = require('express');
const router = express.Router();

const {
  createSupplierContact,
  getSupplierContacts,
  getSupplierContactById,
  updateSupplierContact,
  deleteSupplierContact,
  getSupplierDetails
} = require('../controllers/SupplierContactController');

// GET /api/supplier-contacts - Get all supplier contacts
router.get('/', getSupplierContacts);

// GET /api/supplier-contacts/:id - Get supplier contact by ID
router.get('/:id', getSupplierContactById);

// GET /api/supplier-contacts/supplier/:supplierId - Get supplier details
router.get('/supplier/:supplierId', getSupplierDetails);

// POST /api/supplier-contacts - Create new supplier contact
router.post('/', createSupplierContact);

// PUT /api/supplier-contacts/:id - Update supplier contact
router.put('/:id', updateSupplierContact);

// DELETE /api/supplier-contacts/:id - Delete supplier contact
router.delete('/:id', deleteSupplierContact);

module.exports = router;
