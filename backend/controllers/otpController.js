const redis = require('../config/redis');
const sendSMS = require('../utils/sendSMS');

const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOTP = async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ message: 'Phone number required' });
    }

    const otp = generateOTP();
    const otpKey = `otp:${phone}`;

    try {
        await redis.set(otpKey, otp, { ex: 300 });

        // 👇 THIS is where the error was happening
        await sendSMS(phone, otp);

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
};

exports.verifyOTP = async (req, res) => {
    const { phone, otp } = req.body;
    const otpKey = `otp:${phone}`;

    try {
        const storedOtp = await redis.get(otpKey);

        if (!storedOtp) {
            return res.status(400).json({ message: 'OTP expired or not found' });
        }

        if (storedOtp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        await redis.del(otpKey);

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Verification failed' });
    }
};
