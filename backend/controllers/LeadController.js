const Lead = require('../models/Leads');
const Contact = require('../models/Contact');
const Account = require('../models/Account');
const Opportunity = require('../models/Opportunity');
const { emitAutomation } = require('../utils/realtime');

const createLead = async (req, res) => {
  try {
    const lead = new Lead(req.body);
    const result = await lead.save();
    if (result) return res.status(201).json(result);
    return res.status(400).json('Cannot Create Lead');
  } catch (err) {
    console.log(err);
    return res.status(500).json('Server Error');
  }
};

const getLead = async (req, res) => {
  try {
    const data = await Lead.find();
    if (data) return res.status(200).json(data);
    return res.status(400).json('No lead found');
  } catch (err) {
    console.log('Server Error');
    return res.status(500).json('Server Error');
  }
};

const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Lead.findById(id);
    if (!existing) return res.status(404).json('Lead not found');

    const prevStatus = (existing.status || '').toLowerCase();
    const bodyStatus = (req.body.status || existing.status || '').toLowerCase();

    const updated = await Lead.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json('Lead not found');
    // Note: Opportunity creation for qualified leads is handled centrally
    // by automation/watchers (change streams or Mongoose post hooks fallback).
    // This prevents duplicate creations from concurrent controller + watcher paths.
    return res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(500).json('Server Error');
  }
};

// GET /api/leads/search/contact?q=&account=
const searchContact = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const regex = new RegExp(q, 'i');
    const filter = { mainContact: regex };
    if (req.query.account) {
      filter.accountName = { $regex: new RegExp(req.query.account, 'i') };
    }
    const results = await Contact.find(filter)
      .limit(10)
      .select('mainContact email mobile department address city state country accountName');
    return res.json(results.map(c => ({
      name: c.mainContact,
      email: c.email,
      mobile: c.mobile,
      department: c.department,
      address: c.address || '',
      city: c.city || '',
      state: c.state || '',
      country: c.country || '',
      accountName: c.accountName || ''
    })));
  } catch (err) {
    console.log(err);
    return res.status(500).json('Server Error');
  }
};

// GET /api/leads/search/account?q=
const searchAccount = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const regex = new RegExp(q, 'i');
    // Use correct field names from Account model
    const results = await Account.find({ name: regex })
      .limit(10)
      .select('name address city state country mainContact email mobile');
    // Map to a consistent shape for autofill
    const mapped = results.map(a => ({
      name: a.name,
      city: a.city,
      state: a.state,
      country: a.country,
      postalCode: '',
      address: a.address || '',
      mainContact: a.mainContact || '',
      email: a.email || '',
      mobile: a.mobile || ''
    }));
    return res.json(mapped);
  } catch (err) {
    console.log(err);
    return res.status(500).json('Server Error');
  }
};

module.exports = { createLead, getLead, updateLead, searchContact, searchAccount };
