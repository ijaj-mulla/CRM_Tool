const Competitor = require('../models/Competitor');

const createCompetitor = async (req, res) => {
  try {
    const competitor = new Competitor(req.body);
    let result = await competitor.save();
    if (result) {
      res.status(201).json(result);
    } else {
      res.status(500).json({ message: "Failed to create competitor" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCompetitors = async (req, res) => {
  try {
    let competitors = await Competitor.find();
    if (competitors) {
      res.status(200).json(competitors);
    } else {
      res.status(404).json({ message: "No competitors found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCompetitorById = async (req, res) => {
  try {
    const competitor = await Competitor.findById(req.params.id);
    if (competitor) {
      res.status(200).json(competitor);
    } else {
      res.status(404).json({ message: "Competitor not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCompetitor = async (req, res) => {
  try {
    const competitor = await Competitor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (competitor) {
      res.status(200).json(competitor);
    } else {
      res.status(404).json({ message: "Competitor not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteCompetitor = async (req, res) => {
  try {
    const competitor = await Competitor.findByIdAndDelete(req.params.id);
    if (competitor) {
      res.status(200).json({ message: "Competitor deleted successfully" });
    } else {
      res.status(404).json({ message: "Competitor not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCompetitor,
  getCompetitors,
  getCompetitorById,
  updateCompetitor,
  deleteCompetitor
};
