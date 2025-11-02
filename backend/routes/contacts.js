const express = require('express');
const router = express.Router();

const { 
  getContacts, 
  createContact, 
  getContactById, 
  updateContact, 
  deleteContact,
  searchAccounts,
  getContactsByAccount 
} = require('../controllers/contactsControllers');
const multer = require('multer');
const { importFromExcel } = require('../services/excelImporter');
const Contact = require('../models/Contact');

const upload = multer({ storage: multer.memoryStorage() });

function genContactId(mainContact, accountName) {
  const left = String(mainContact || 'CONTACT').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 12);
  const right = String(accountName || '').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 8);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${left}${right ? '-' + right : ''}-${rand}`;
}

// GET /api/contacts - Get all contacts
router.get('/', getContacts);

// GET /api/contacts/search-accounts - Search accounts by name
router.get('/search-accounts', searchAccounts);

// GET /api/contacts/by-account/:accountId - Get contacts for an account
router.get('/by-account/:accountId', getContactsByAccount);

// GET /api/contacts/:id - Get contact by ID
router.get('/:id', getContactById);

// POST /api/contacts - Create a contact
router.post('/', createContact);

// PUT /api/contacts/:id - Update contact
router.put('/:id', updateContact);

// DELETE /api/contacts/:id - Delete contact
router.delete('/:id', deleteContact);

// POST /api/contacts/import-excel - Import contacts from Excel
router.post('/import-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const allowed = [
      'contactId', 'department', 'mainContact', 'country', 'state', 'city', 'address',
      'email', 'mobile', 'accountId', 'accountName', 'status'
    ];

    // Precompute next sequential IDs because bulkWrite doesn't trigger pre-save hooks
    const existing = await Contact.find({}, { contactId: 1 }).lean();
    const usedNumbers = new Set();
    for (const doc of existing) {
      const m = /^C-(\d+)$/.exec(doc.contactId || '');
      if (m) usedNumbers.add(parseInt(m[1], 10));
    }
    let cursor = 1;
    const allocatedThisBatch = new Set();
    function nextContactId() {
      while (usedNumbers.has(cursor) || allocatedThisBatch.has(cursor)) cursor++;
      const n = cursor;
      allocatedThisBatch.add(n);
      const id = n < 10 ? `C-0${n}` : `C-${n}`;
      cursor++;
      return id;
    }

    const summary = await importFromExcel(req.file.buffer, {
      model: Contact,
      uniqueKey: 'contactId',
      allowedFields: allowed,
      // Ensure contactId exists for upsert by deriving from names or allocating sequential when missing
      mapRow: (row) => {
        const doc = {};
        for (const key of allowed) {
          const v = row[key] ?? row[key?.toLowerCase?.()] ?? row[String(key).replace(/\s+/g, '')];
          if (v !== undefined && v !== null && String(v).trim() !== '') doc[key] = v;
        }
        if (!doc.contactId) {
          // Prefer sequential allocation to match UI expectations
          doc.contactId = nextContactId();
        }
        return doc;
      },
      setOnInsert: (doc) => ({
        status: doc.status || 'Active',
      }),
    });

    // Be lenient: return success with counts even if no valid rows
    res.json({ created: summary.created, updated: summary.updated, processed: summary.processed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;