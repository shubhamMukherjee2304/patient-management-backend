// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated and has the correct role
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.status(401).send('Access denied. No token provided.');

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid token');
        req.user = user; // Store user data from token (e.g., id, role)
        next();
    });
}

function authorizeRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).send('Access denied. You do not have permission to perform this action.');
        }
        next();
    };
}

module.exports = { authenticateToken, authorizeRole };
