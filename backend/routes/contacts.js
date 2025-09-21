const express = require('express');
const router = express.Router();

const { getContacts, createContact } = require('../controllers/contactsControllers');
// GET /api/contacts - Get all contacts
router.get('/', getContacts);

// POST /api/contacts - Create a contact
router.post('/', createContact);

module.exports = router;