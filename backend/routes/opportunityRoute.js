const express= require('express');
const router= express.Router();
const {createOpportunity, getOpportunity, updateOpportunity, searchContact, searchAccount}= require('../controllers/OpportunityController');

router.post('/', createOpportunity);
router.get('/', getOpportunity);
router.put('/:id', updateOpportunity);
router.get('/search/contact', searchContact);
router.get('/search/account', searchAccount);

module.exports= router;