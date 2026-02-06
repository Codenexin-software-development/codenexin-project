const User = require('../models/User');

// Save or update user profile
const saveProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming middleware sets req.user
        const {
            title,
            name,
            email,
            dob,
            address,
            pincode,
            state,
            district,
            ac,
            gender,
            profileImage,
            agreedToUpdates
        } = req.body;

        // Find and update user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update profile fields
        user.title = title || user.title;
        user.name = name || user.name;
        user.email = email || user.email;
        user.dob = dob ? new Date(dob) : user.dob;
        user.address = address || user.address;
        user.pincode = pincode || user.pincode;
        user.state = state || user.state;
        user.district = district || user.district;
        user.ac = ac || user.ac;
        user.gender = gender || user.gender;
        user.profileImage = profileImage || user.profileImage;
        user.agreedToUpdates = agreedToUpdates !== undefined ? agreedToUpdates : user.agreedToUpdates;

        // Mark profile as complete if all required fields are filled
        const requiredFields = ['title', 'name', 'dob', 'address', 'pincode', 'state', 'district', 'ac', 'gender'];
        const isComplete = requiredFields.every(field => user[field]);
        user.profileComplete = isComplete;
        user.profileUpdated = new Date();

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                profileComplete: user.profileComplete,
                profileUpdated: user.profileUpdated
            }
        });
    } catch (error) {
        console.error('Profile save error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save profile'
        });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-__v -createdAt -lastLogin');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile'
        });
    }
};

module.exports = {
    saveProfile,
    getProfile
};
