const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // ⏱ OTP auto-expires after 10 minutes
    }
});

module.exports = mongoose.model("Otp", otpSchema);
