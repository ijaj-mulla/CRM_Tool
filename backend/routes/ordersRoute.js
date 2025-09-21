const express = require('express');
const router = express.Router();
const { createOrders, getOrders } = require('../controllers/OrderController');

router.post('/', createOrders);
router.get('/', getOrders);

module.exports = router;