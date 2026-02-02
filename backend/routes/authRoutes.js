const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Register user after OTP verification
router.post('/register', register);

// Login user after OTP verification
router.post('/login', login);

// Logout route
router.post('/logout', (req, res) => {
    // For now, just send a success response
    // In a real app, you might clear sessions or tokens
    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
