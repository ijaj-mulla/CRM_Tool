const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments } = require('../controllers/AppointmentController');

router.post('/', createAppointment);
router.get('/', getAppointments);

module.exports = router;


