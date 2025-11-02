const Opportunity = require('../models/Opportunity');
const { ensureQuoteForOpportunityPhase } = require('../automation/watchers');
const Contact = require('../models/Contact');
const Account = require('../models/Account');

const createOpportunity = async (req, res) => {
  try {
    const opportunity = new Opportunity(req.body);
    const result = await opportunity.save();
    // Direct automation on create if phase is already quotation
    if (String(result?.salesPhase || '').toLowerCase() === 'quotation') {
      try { await ensureQuoteForOpportunityPhase(result.toObject ? result.toObject() : result); } catch (_) {}
    }
    if (result) return res.status(201).json(result);
    return res.status(400).json('Cannot Create Opportunity');
  } catch (err) {
    console.log(err);
    return res.status(500).json('Server Error');
  }
};

const getOpportunity = async (req, res) => {
  try {
    const data = await Opportunity.find();
    if (data) return res.status(200).json(data);
    return res.status(400).json('No Opportunity found');
  } catch (err) {
    console.log('Server Error');
    return res.status(500).json('Server Error');
  }
};

const updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const prev = await Opportunity.findById(id).lean();
    const updated = await Opportunity.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json('Opportunity not found');
    // Direct automation trigger: if salesPhase moved to quotation, ensure quote exists
    const newPhase = String(updated.salesPhase || '').toLowerCase();
    const prevPhase = String(prev?.salesPhase || '').toLowerCase();
    if (newPhase === 'quotation' && prevPhase !== 'quotation') {
      try { await ensureQuoteForOpportunityPhase(updated.toObject ? updated.toObject() : updated); } catch (_) {}
    }
    return res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(500).json('Server Error');
  }
};

// GET /api/opportunity/search/contact?q=
const searchContact = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const regex = new RegExp(q, 'i');
    const results = await Contact.find({ name: regex }).limit(10).select('name email mobile department');
    return res.json(results);
  } catch (err) {
    console.log(err);
    return res.status(500).json('Server Error');
  }
};

// GET /api/opportunity/search/account?q=
const searchAccount = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const regex = new RegExp(q, 'i');
    const results = await Account.find({ accountName: regex }).limit(10).select('accountName city state country postalCode street');
    const mapped = results.map(a => ({ name: a.accountName, city: a.city, state: a.state, country: a.country, postalCode: a.postalCode, address: a.street || '' }));
    return res.json(mapped);
  } catch (err) {
    console.log(err);
    return res.status(500).json('Server Error');
  }
};

module.exports = { 
  createOpportunity, 
  getOpportunity, 
  updateOpportunity, 
  searchContact, 
  searchAccount 
};