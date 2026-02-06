const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');

// Register user after OTP verification
const register = async (req, res) => {
    try {
        const { mobile, email, name } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ mobile });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this mobile number'
            });
        }

        // Create new user
        const user = new User({
            mobile,
            email,
            name,
            isActive: true
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });

        // Generate membership number (you can customize this logic)
        const membershipNumber = `NPP-M${Date.now()}`;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                mobile: user.mobile,
                email,
                name,
                membershipNumber,
                isRegistered: true,
                registrationDate: user.createdAt
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
};

// Login user after OTP verification
const login = async (req, res) => {
    try {
        const { mobile } = req.body;

        // Find user by mobile
        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please register first.'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate membership number if not exists (you can customize this)
        const membershipNumber = `NPP-M${user._id.toString().slice(-6).toUpperCase()}`;

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                mobile: user.mobile,
                membershipNumber,
                isRegistered: true,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

module.exports = {
    register,
    login
};
