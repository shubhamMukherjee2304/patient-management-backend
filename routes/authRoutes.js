// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient'); // import Prisma client
const router = express.Router();

// Middleware to authenticate the token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Get token from headers

    if (!token) return res.sendStatus(401); // Unauthorized if no token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden if token is invalid
        req.user = user; // Save user information to request
        next(); // Proceed to the next middleware/route
    });
};

// Register
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role
            }
        });
        res.json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'User registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(400).send('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send('Invalid credentials');

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get info about the logged-in user
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }, // Get user info by id from token
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        // Exclude password from the response
        const { password, ...userData } = user;
        res.json(userData); // Send user data
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

module.exports = router;
