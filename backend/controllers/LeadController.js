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

    const becameQualified = prevStatus !== 'qualified' && bodyStatus === 'qualified';
    const notLinked = !updated.linkedOpportunityId;

    if (becameQualified && notLinked) {
      try {
        const missing = ['account','contact','owner'].filter(f => !updated[f]);
        if (missing.length > 0) {
          return res.json(updated);
        }

        const allowedCategories = ['Brochure request','Prospect for Consulting','Prospect for Product Sales','Prospect for Service','Prospect for Training','Value Chain'];
        const oppPayload = {
          name: updated.name,
          account: updated.account,
          contact: updated.contact,
          owner: updated.owner,
          salesOrganization: 'test',
          salesPhase: 'qualification',
          startDate: updated.startDate,
          closeDate: updated.endDate,
          source: updated.source
        };
        if (allowedCategories.includes(updated.category)) {
          oppPayload.category = updated.category;
        }

        const opp = new Opportunity(oppPayload);
        const createdOpp = await opp.save();

        if (createdOpp && createdOpp.opportunityId) {
          updated.linkedOpportunityId = createdOpp.opportunityId;
          await updated.save();
          emitAutomation('success', '✅ Lead converted to Opportunity successfully', {
            leadId: updated.leadId,
            opportunityId: createdOpp.opportunityId,
          });
        }
      } catch (createErr) {
        console.log('Opportunity creation from Lead failed:', createErr);
      }
    }

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