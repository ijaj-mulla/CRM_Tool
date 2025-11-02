const Product = require('../models/Product');

const createProduct = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.id || !req.body.category || !req.body.unitOfMeasure) {
      return res.status(400).json({ error: "All fields are required: name, id, category, unitOfMeasure" });
    }

    const product = new Product(req.body);
    let result = await product.save();
    if (result) {
      res.status(201).json(result);
    } else {
      res.status(500).json({ message: "Failed to create product" });
    }
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({ error: `Product ${field} already exists` });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

const getProducts = async (req, res) => {
  try {
    let products = await Product.find();
    if (products) {
      res.status(200).json(products);
    } else {
      res.status(404).json({ message: "No products found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({ error: `Product ${field} already exists` });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      res.status(200).json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
