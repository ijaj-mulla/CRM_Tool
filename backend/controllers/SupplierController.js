const Supplier = require('../models/Supplier');
const SupplierContact = require('../models/SupplierContact');

const createSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    let result = await supplier.save();
    if (result) {
      try {
        const contactPayload = {
          name: result.mainContact && result.mainContact.trim() ? result.mainContact : result.name,
          supplierId: result._id,
          state: result.state || '',
          city: result.city || '',
          country: result.country || ''
        };
        const contact = new SupplierContact(contactPayload);
        await contact.save();
      } catch (autoErr) {
        // Silently ignore auto-create errors to not block supplier creation
      }
      res.status(201).json(result);
    } else {
      res.status(500).json({ message: "Failed to create supplier" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSuppliers = async (req, res) => {
  try {
    let suppliers = await Supplier.find();
    if (suppliers) {
      res.status(200).json(suppliers);
    } else {
      res.status(404).json({ message: "No suppliers found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (supplier) {
      res.status(200).json(supplier);
    } else {
      res.status(404).json({ message: "Supplier not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (supplier) {
      res.status(200).json(supplier);
    } else {
      res.status(404).json({ message: "Supplier not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (supplier) {
      res.status(200).json({ message: "Supplier deleted successfully" });
    } else {
      res.status(404).json({ message: "Supplier not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier
};
