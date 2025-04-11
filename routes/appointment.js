const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const auth = require('../routes/auth');

// Schedule an appointment
router.post('/', async (req, res) => {
    try {
        const { doctor, specialty, date, time, purpose ,userId } = req.body;

        // Validate input
        if (!doctor || !specialty || !date || !time || !purpose) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create appointment
        const appointment = new Appointment({
            userId: userId,
            doctor,
            specialty,
            date,
            time,
            purpose
        });

        await appointment.save();

        res.status(201).json({ message: 'Appointment scheduled successfully', appointment });
    } catch (error) {
        console.error('Error scheduling appointment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all appointments for the user
router.get('/', async (req, res) => {
    const userId = req.params.userId;
    try {
        const appointments = await Appointment.find({ user: userId });
        res.json({ appointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel an appointment
router.post('/delete', auth, async (req, res) => {
    try {
        
        const { id } = req.body;
        console.log("id", id)

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        await Appointment.findByIdAndDelete(id);
        await appointment.save();

        res.json({ message: 'Appointment cancelled successfully', appointment });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
