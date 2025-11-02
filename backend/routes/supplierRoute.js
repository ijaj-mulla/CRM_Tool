const express = require('express');
const router = express.Router();
const multer = require('multer');
const { importFromExcel } = require('../services/excelImporter');
const SupplierContact = require('../models/SupplierContact');
const xlsx = require('xlsx');

const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier
} = require('../controllers/SupplierController');
const Supplier = require('../models/Supplier');

// GET /api/suppliers - Get all suppliers
router.get('/', getSuppliers);

// GET /api/suppliers/:id - Get supplier by ID
router.get('/:id', getSupplierById);

// POST /api/suppliers - Create new supplier
router.post('/', createSupplier);

// PUT /api/suppliers/:id - Update supplier
router.put('/:id', updateSupplier);

// DELETE /api/suppliers/:id - Delete supplier
router.delete('/:id', deleteSupplier);

// POST /api/suppliers/import-excel - Import suppliers from Excel
const upload = multer({ storage: multer.memoryStorage() });
router.post('/import-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const allowed = ['name','status','country','city','state','mainContact'];
    // Parse once to gather supplier names from import
    let importedNames = [];
    try {
      const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheet = wb.SheetNames[0];
      const ws = wb.Sheets[sheet];
      const rows = xlsx.utils.sheet_to_json(ws, { defval: '' });
      importedNames = Array.from(new Set(rows.map(r => r.name).filter(Boolean)));
    } catch (_) { /* ignore parse errors */ }

    const summary = await importFromExcel(req.file.buffer, {
      model: Supplier,
      uniqueKey: 'name',
      allowedFields: allowed,
    });

    if (summary.processed === 0) {
      return res.status(400).json({ message: 'No valid rows to import' });
    }

    // Optionally create Supplier Contacts for imported suppliers
    let contactsCreated = 0;
    const createContacts = String(req.query.createContacts || '').toLowerCase() === 'true';
    if (createContacts && importedNames.length) {
      const sups = await Supplier.find({ name: { $in: importedNames } });
      for (const s of sups) {
        if (!s) continue;
        const contactName = s.mainContact;
        if (!contactName) continue;
        const exists = await SupplierContact.findOne({ supplierId: s._id, name: contactName });
        if (exists) continue;
        try {
          const sc = new SupplierContact({
            name: contactName,
            supplierId: s._id,
            city: s.city,
            state: s.state,
            country: s.country,
          });
          await sc.save();
          contactsCreated += 1;
        } catch (_) { /* skip errors per row */ }
      }
    }

    return res.json({ created: summary.created, updated: summary.updated, processed: summary.processed, contactsCreated });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to import suppliers' });
  }
});

module.exports = router;
