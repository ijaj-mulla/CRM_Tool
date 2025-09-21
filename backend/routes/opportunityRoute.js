const express= require('express');
const router= express.Router();
const {createOpportunity, getOpportunity}= require('../controllers/OpportunityController');

router.post('/', createOpportunity);
router.get('/', getOpportunity);

module.exports= router;