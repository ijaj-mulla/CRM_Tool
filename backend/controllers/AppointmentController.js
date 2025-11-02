const Appointment = require('../models/Appointment');

const createAppointment = async (req, res) => {
  try {
    const appt = new Appointment(req.body);
    const saved = await appt.save();
    return res.status(201).json(saved);
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Cannot create appointment' });
  }
};

const getAppointments = async (_req, res) => {
  try {
    const appts = await Appointment.find().sort({ createdAt: -1 });
    return res.status(200).json(appts);
  } catch (err) {
    return res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createAppointment, getAppointments };


