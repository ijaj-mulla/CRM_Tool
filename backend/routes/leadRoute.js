const express= require('express');
const router= express.Router();
const {createLead, getLead, updateLead, searchContact, searchAccount}= require('../controllers/LeadController');
const multer = require('multer');
const { importFromExcel } = require('../services/excelImporter');
const Lead = require('../models/Leads');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', createLead);
router.get('/', getLead);
router.put('/:id', updateLead);
router.get('/search/contact', searchContact);
router.get('/search/account', searchAccount);

// POST /api/leads/import-excel - Import leads from Excel
router.post('/import-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Allowed fields in new Lead schema
    const allowed = [
      'name','status','contact','account','address','city','state','country','postalCode',
      'email','department','owner','mobile','qualificationLevel','source','priority',
      'startDate','endDate','category','followUpActivity'
    ];

    // Common aliases from legacy Excel files
    const alias = {
      companyName: 'account',
      contactName: 'contact',
      follow_up_activity: 'followUpActivity',
      'postal code': 'postalCode',
      postcode: 'postalCode',
      zip: 'postalCode',
      phone: 'mobile',
      start: 'startDate',
      end: 'endDate'
    };

    const pick = (row, key) => {
      const direct = row[key];
      if (direct !== undefined && direct !== null && String(direct).trim() !== '') return direct;
      const lower = row[key?.toLowerCase?.()];
      if (lower !== undefined && lower !== null && String(lower).trim() !== '') return lower;
      const nospace = row[String(key).replace(/\s+/g, '')];
      if (nospace !== undefined && nospace !== null && String(nospace).trim() !== '') return nospace;
      // alias mapping
      const a = alias[key] || Object.keys(alias).find(k => k.toLowerCase() === key.toLowerCase() && alias[k]);
      if (a) return pick(row, a);
      return undefined;
    };

    const parseDate = (v) => {
      if (!v) return undefined;
      try {
        const d = new Date(v);
        if (isNaN(d)) return undefined;
        return d;
      } catch {
        return undefined;
      }
    };

    const mapRow = (row) => {
      const doc = {};
      for (const key of allowed) {
        let val = pick(row, key);
        if (val === undefined || val === null || String(val).trim() === '') continue;
        if (key === 'startDate' || key === 'endDate') {
          const d = parseDate(val);
          if (d) doc[key] = d;
        } else {
          doc[key] = val;
        }
      }
      return doc;
    };

    // Precompute next leadId generator for inserts (bulk upsert bypasses pre-save hook)
    const existing = await Lead.find({}, { leadId: 1 }).lean();
    const used = new Set();
    for (const doc of existing) {
      const m = /^L-(\d+)$/.exec(doc.leadId || '');
      if (m) used.add(parseInt(m[1], 10));
    }
    const nextLeadId = () => {
      let n = 1;
      while (used.has(n)) n++;
      used.add(n);
      return n < 10 ? `L-0${n}` : `L-${n}`;
    };

    const summary = await importFromExcel(req.file.buffer, {
      model: Lead,
      uniqueKey: 'name',
      allowedFields: allowed,
      mapRow,
      setOnInsert: () => ({ leadId: nextLeadId() }),
    });

    if (summary.processed === 0) {
      return res.status(400).json({ message: 'No valid rows to import' });
    }

    res.json({ created: summary.created, updated: summary.updated, processed: summary.processed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports= router;