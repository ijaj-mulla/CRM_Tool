const express = require('express');
const router = express.Router();

const {
  createCompetitor,
  getCompetitors,
  getCompetitorById,
  updateCompetitor,
  deleteCompetitor
} = require('../controllers/CompetitorController');

// GET /api/competitors - Get all competitors
router.get('/', getCompetitors);

// GET /api/competitors/:id - Get competitor by ID
router.get('/:id', getCompetitorById);

// POST /api/competitors - Create new competitor
router.post('/', createCompetitor);

// PUT /api/competitors/:id - Update competitor
router.put('/:id', updateCompetitor);

// DELETE /api/competitors/:id - Delete competitor
router.delete('/:id', deleteCompetitor);

module.exports = router;
