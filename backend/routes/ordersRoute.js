const express = require('express');
const router = express.Router();
const { createOrders, getOrders, getOrderById, updateOrder, deleteOrder, searchAccount, searchContact } = require('../controllers/OrderController');

router.post('/', createOrders);
router.get('/', getOrders);

// Search endpoints
router.get('/search/account', searchAccount);
router.get('/search/contact', searchContact);

// ID-based endpoints
router.get('/:id', getOrderById);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

module.exports = router;