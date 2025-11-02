const express = require('express');
const router = express.Router();
const EmailController = require('../controllers/EmailController');

// Route to fetch all stored emails
router.get('/', EmailController.getAllEmails);

// Route to sync emails from Gmail
router.post('/sync', EmailController.syncEmails);

module.exports = router;