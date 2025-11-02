const SupplierContact = require('../models/SupplierContact');
const Supplier = require('../models/Supplier');

const createSupplierContact = async (req, res) => {
  try {
    const supplierContact = new SupplierContact(req.body);
    let result = await supplierContact.save();
    if (result) {
      res.status(201).json(result);
    } else {
      res.status(500).json({ message: "Failed to create supplier contact" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSupplierContacts = async (req, res) => {
  try {
    let contacts = await SupplierContact.find().populate('supplierId');
    if (contacts) {
      res.status(200).json(contacts);
    } else {
      res.status(404).json({ message: "No supplier contacts found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSupplierContactById = async (req, res) => {
  try {
    const contact = await SupplierContact.findById(req.params.id).populate('supplierId');
    if (contact) {
      res.status(200).json(contact);
    } else {
      res.status(404).json({ message: "Supplier contact not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSupplierContact = async (req, res) => {
  try {
    const contact = await SupplierContact.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('supplierId');
    if (contact) {
      res.status(200).json(contact);
    } else {
      res.status(404).json({ message: "Supplier contact not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteSupplierContact = async (req, res) => {
  try {
    const contact = await SupplierContact.findByIdAndDelete(req.params.id);
    if (contact) {
      res.status(200).json({ message: "Supplier contact deleted successfully" });
    } else {
      res.status(404).json({ message: "Supplier contact not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSupplierDetails = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.supplierId);
    if (supplier) {
      res.status(200).json(supplier);
    } else {
      res.status(404).json({ message: "Supplier not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSupplierContact,
  getSupplierContacts,
  getSupplierContactById,
  updateSupplierContact,
  deleteSupplierContact,
  getSupplierDetails
};
