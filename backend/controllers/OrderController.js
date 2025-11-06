const orderSchema = require('../models/SalesOrder');
const { propagateOrderStatus } = require('../automation/watchers');
const Account = require('../models/Account');
const Contact = require('../models/Contact');

const createOrders = async (req, res) => {
  try {
    const body = req.body || {};
    const payload = {
      document_type: body.document_type,
      primaryContact: body.primaryContact,
      account: body.account,
      creationDate: body.creationDate ? new Date(body.creationDate) : undefined,
      amount: body.amount !== undefined && body.amount !== '' ? Number(body.amount) : undefined,
      deliveryStatus: body.deliveryStatus || undefined,
      status: body.status || undefined,
    };
    const order = new orderSchema(payload);
    const result = await order.save();
    if (result) return res.status(201).json(result);
    return res.status(400).json('Cannot create Order');
  } catch (err) {
    console.log(err);
    return res.status(500).json('Server Error');
  }
};

const getOrders = async (req, res) => {
  try {
    const data = await orderSchema.find();
    if (data) return res.status(200).json(data);
    return res.status(400).json('No Orders found');
  } catch (err) {
    console.log(err);
    return res.status(500).json('Server Error');
  }
};

const getOrderById = async (req, res) => {
  try {
    const data = await orderSchema.findById(req.params.id);
    if (!data) return res.status(404).json('Order not found');
    return res.json(data);
  } catch (err) {
    return res.status(500).json('Server Error');
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const update = { ...body };

    if (update.amount !== undefined && update.amount !== '') update.amount = Number(update.amount);
    if (update.creationDate) update.creationDate = new Date(update.creationDate);

    // Cascade: if deliveryStatus changes to Finished -> status = Completed; if set back to In Process -> status = Active
    if (typeof update.deliveryStatus === 'string') {
      if (update.deliveryStatus === 'Finished') update.status = 'Completed';
      else if (update.deliveryStatus === 'In Process' && !update.status) update.status = 'Active';
    }

    const prev = await orderSchema.findById(id).lean();
    const updated = await orderSchema.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return res.status(404).json('Order not found');
    return res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(500).json('Server Error');
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await orderSchema.findByIdAndDelete(id);
    if (!result) return res.status(404).json('Order not found');
    return res.json('Order deleted successfully');
  } catch (err) {
    return res.status(500).json('Server Error');
  }
};

// Search: account by name
const searchAccount = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const regex = new RegExp(q, 'i');
    const results = await Account.find({ name: regex }).limit(10).select('name city state country');
    return res.json(results.map(a => ({ name: a.name, city: a.city, state: a.state, country: a.country })));
  } catch (err) {
    return res.status(500).json('Server Error');
  }
};

// Search: contact by mainContact
const searchContact = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const regex = new RegExp(q, 'i');
    const results = await Contact.find({ mainContact: regex }).limit(10).select('mainContact email mobile accountName');
    return res.json(results.map(c => ({ name: c.mainContact, email: c.email, mobile: c.mobile, accountName: c.accountName })));
  } catch (err) {
    return res.status(500).json('Server Error');
  }
};

module.exports = { createOrders, getOrders, getOrderById, updateOrder, deleteOrder, searchAccount, searchContact };
