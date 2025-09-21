const express= require('express');
const router= express.Router();
const {createLead, getLead}= require('../controllers/LeadController');

router.post('/', createLead);
router.get('/', getLead);

module.exports= router;