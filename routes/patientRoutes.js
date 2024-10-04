// routes/patients.js
const express = require('express');
const prisma = require('../prismaClient'); // Import Prisma client
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // Import middleware
const router = express.Router();

// Create patient (only receptionist)
router.post('/', authenticateToken, authorizeRole('receptionist'), async (req, res) => {
    const { name, age} = req.body; 
    try {
        const newPatient = await prisma.patient.create({
            data: {
                name,
                age,       
            }
        });
        res.json(newPatient);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all patients (accessible by both doctors and receptionists)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const patients = await prisma.patient.findMany({
            orderBy: { dateRegistered: 'desc' },
            // include: { user: true } // Include user data (optional)
        });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
});

// Update patient (only receptionist)
router.put('/:id', authenticateToken, authorizeRole('receptionist'), async (req, res) => {
    const { name, age } = req.body;
    try {
        const updatedPatient = await prisma.patient.update({
            where: { id: Number(req.params.id) },
            data: { name, age }
        });
        res.json(updatedPatient);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update patient' });
    }
});

// Delete patient (only receptionist)
router.delete('/:id', authenticateToken, authorizeRole('receptionist'), async (req, res) => {
    try {
        await prisma.patient.delete({ where: { id: Number(req.params.id) } });
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete patient' });
    }
});

module.exports = router;
