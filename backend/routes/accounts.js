const express = require('express');
const router = express.Router();

const { createAccount, getAccounts } = require('../controllers/AccountController');
const { route } = require('./contacts');

//GET /api/accounts - Get all accounts
router.get('/', getAccounts);

router.post('/', createAccount);

module.exports = router;

