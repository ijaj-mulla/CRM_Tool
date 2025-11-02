const express = require('express');
const router = express.Router();

const { 
  createAccount, 
  getAccounts, 
  getAccountById, 
  updateAccount, 
  deleteAccount 
} = require('../controllers/AccountController');
const multer = require('multer');
const { importFromExcel } = require('../services/excelImporter');
const Account = require('../models/Account');
const Contact = require('../models/Contact');
const xlsx = require('xlsx');

const upload = multer({ storage: multer.memoryStorage() });

function genAccountId(name) {
  const base = String(name || 'ACC').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 16);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base || 'ACC'}-${rand}`;
}

function slug(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// GET /api/accounts - Get all accounts
router.get('/', getAccounts);

// GET /api/accounts/:id - Get account by ID
router.get('/:id', getAccountById);

// POST /api/accounts - Create new account
router.post('/', createAccount);

// PUT /api/accounts/:id - Update account
router.put('/:id', updateAccount);

// DELETE /api/accounts/:id - Delete account
router.delete('/:id', deleteAccount);

// POST /api/accounts/import-excel - Import accounts from Excel
router.post('/import-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const allowed = [
      'accountId', 'name', 'address', 'city', 'accountType', 'mainContact', 'country', 'state', 
      'role', 'mobile', 'email', 'industryCode', 'buAssignment', 'horizontal', 
      'subVertical', 'vertical', 'valueAddedDepth', 'status'
    ];

    // Parse sheet once to collect accountIds and names present in upload (used later for optional contacts creation)
    let importedAccountIds = [];
    let importedAccountNames = [];
    try {
      const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(ws, { defval: '' });
      const ids = new Set();
      const names = new Set();
      for (const r of rows) {
        const id = r.accountId || r.AccountID || r['Account ID'] || r['account id'] || r['ACCOUNTID'];
        if (id) ids.add(String(id).trim());
        const nm = r.name || r.Name || r['Account Name'] || r['account name'] || r['ACCOUNTNAME'];
        if (nm) names.add(String(nm).trim());
      }
      importedAccountIds = Array.from(ids);
      importedAccountNames = Array.from(names);
    } catch (_) { /* ignore parse errors for id collection */ }

    // Precompute next sequential Account IDs because bulkWrite doesn't trigger pre-save hooks
    const existingAccs = await Account.find({}, { accountId: 1 }).lean();
    const usedAccNums = new Set();
    for (const doc of existingAccs) {
      const m = /^A-(\d+)$/.exec(doc.accountId || '');
      if (m) usedAccNums.add(parseInt(m[1], 10));
    }
    let accCursor = 1;
    const allocatedAccThisBatch = new Set();
    function nextAccountId() {
      while (usedAccNums.has(accCursor) || allocatedAccThisBatch.has(accCursor)) accCursor++;
      const n = accCursor;
      allocatedAccThisBatch.add(n);
      const id = n < 10 ? `A-0${n}` : `A-${n}`;
      accCursor++;
      return id;
    }

    const summary = await importFromExcel(req.file.buffer, {
      model: Account,
      // Use account name as the main unique key for upsert (so sheets without IDs can update existing)
      uniqueKey: 'name',
      allowedFields: allowed,
      // Ensure accountId exists by allocating sequential when missing
      mapRow: (row) => {
        const doc = {};
        for (const key of allowed) {
          const v = row[key] ?? row[key?.toLowerCase?.()] ?? row[String(key).replace(/\s+/g, '')];
          if (v !== undefined && v !== null && String(v).trim() !== '') doc[key] = v;
        }
        if (!doc.accountId) {
          doc.accountId = nextAccountId();
        }
        return doc;
      },
      setOnInsert: (doc) => ({
        status: doc.status || 'Active',
      }),
    });

    // Be lenient: return success with counts even if no valid rows
    // This avoids throwing an error when IDs are missing; now name is used.

    // Backfill accountId for updated records (existing accounts without accountId)
    if (importedAccountNames.length) {
      const toBackfill = await Account.find({
        name: { $in: importedAccountNames },
        $or: [ { accountId: { $exists: false } }, { accountId: '' }, { accountId: null } ]
      });
      if (toBackfill.length) {
        const ops = toBackfill.map(a => ({
          updateOne: {
            filter: { _id: a._id },
            update: { $set: { accountId: genAccountId(a.name) } }
          }
        }));
        try { if (ops.length) await Account.bulkWrite(ops, { ordered: false }); } catch (_) {}
      }
    }

    // Optionally create Contacts for imported Accounts
    let contactsCreated = 0;
    let contactsSkipped = 0;
    const flag = String(req.query.createContacts || '').toLowerCase();
    const createContacts = flag === 'true' || flag === '1' || flag === 'yes';
    if (createContacts) {
      // Fetch accounts that were part of this import either by accountId (if provided) or by name
      let accs = [];
      if (importedAccountIds.length) {
        accs = await Account.find({ accountId: { $in: importedAccountIds } });
      } else if (importedAccountNames.length) {
        accs = await Account.find({ name: { $in: importedAccountNames } });
      }
      for (const a of accs) {
        if (!a) continue;
        const exists = await Contact.findOne({ accountId: a.accountId });
        if (exists) continue; // do not duplicate
        try {
          const mainContact = a.mainContact && String(a.mainContact).trim() ? a.mainContact : (a.name || 'Unknown');
          const email = (a.email && String(a.email).includes('@')) ? a.email : `${slug(a.name || mainContact) || 'contact'}@auto-import.local`;
          const c = new Contact({
            mainContact,
            address: a.address,
            city: a.city,
            country: a.country,
            state: a.state,
            email,
            mobile: a.mobile,
            accountId: a.accountId,
            accountName: a.name,
            status: a.status || 'Active',
          });
          await c.save();
          contactsCreated += 1;
        } catch (_) {
          contactsSkipped += 1; // skip individual failures
        }
      }
    }

    res.json({ created: summary.created, updated: summary.updated, processed: summary.processed, contactsCreated, contactsSkipped });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


