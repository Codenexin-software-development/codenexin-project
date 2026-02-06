const express = require('express');
const router = express.Router();

const {
    sendOTP,
    verifyOTP,
    sendAdminOTP
} = require('../controllers/otpController');

router.post('/send', sendOTP);
router.post('/verify', verifyOTP);
router.post('/send-admin', sendAdminOTP);

module.exports = router;
