const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Membership = require("../models/Membership");
const Otp = require("../models/Otp");

const generateMembershipNumber = () =>
  "NPP-" + Math.floor(100000 + Math.random() * 900000);

const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

const OTP_VALIDITY_MINUTES = Number(process.env.OTP_VALIDITY_MINUTES) || 10;
const OTP_COOLDOWN_SECONDS = Number(process.env.OTP_COOLDOWN_SECONDS) || 60;

exports.sendOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email required" });
    }

    try {
        const lowerEmail = email.toLowerCase();
        console.log(`Sending OTP for email: ${email} (lowercased: ${lowerEmail})`);
        const existingOtp = await Otp.findOne({ email: lowerEmail });

        // ⏱ Rate limit
        if (existingOtp) {
            const secondsSinceLast =
                (Date.now() - existingOtp.createdAt.getTime()) / 1000;

            if (secondsSinceLast < OTP_COOLDOWN_SECONDS) {
                return res.status(429).json({
                    message: `Please wait ${Math.ceil(
                        OTP_COOLDOWN_SECONDS - secondsSinceLast
                    )} seconds before requesting OTP again`
                });
            }

            // 🔁 RESEND same OTP if still valid
            console.log(
                `🔁 Resending OTP for ${email}: ${existingOtp.otp} (valid for ${OTP_VALIDITY_MINUTES} minutes)`
            );

            // Print OTP to console instead of sending email
            console.log(`📩 OTP for ${email}: ${existingOtp.otp}`);

            return res.status(200).json({
                message: `OTP resent. It is valid for ${OTP_VALIDITY_MINUTES} minutes`
            });
        }

        // 🆕 Generate new OTP
        const otp = generateOTP();

        await Otp.create({ email: lowerEmail, otp });

        console.log(
            `📩 OTP generated for ${email}: ${otp} (valid for ${OTP_VALIDITY_MINUTES} minutes)`
        );

        // Print OTP to console instead of sending email
        console.log(`📩 OTP for ${email}: ${otp}`);

        res.status(200).json({
            message: `OTP sent. It is valid for ${OTP_VALIDITY_MINUTES} minutes`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to send OTP" });
    }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpString = String(otp);
    const trimmedOtp = otpString.trim();
    console.log(`Verifying OTP for ${email}: received '${otp}' (${typeof otp}), trimmed '${trimmedOtp}'`);
    const record = await Otp.findOne({ email: email.toLowerCase(), otp: trimmedOtp });
    if (!record) {
      console.log(`No record found for email: ${email.toLowerCase()}, otp: ${trimmedOtp}`);
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // 🔥 OTP valid → remove all OTPs for email
    await Otp.deleteMany({ email: email.toLowerCase() });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
};

exports.sendAdminOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  // Check if email is admin email (you can have a list or check against DB)
  const adminEmails = ['admin@npp.com', 'admin@example.com']; // Add your admin emails
  if (!adminEmails.includes(email.toLowerCase())) {
    return res.status(403).json({ message: "Unauthorized admin email" });
  }

  try {
    const lowerEmail = email.toLowerCase();
    console.log(`Sending admin OTP for email: ${email}`);
    const existingOtp = await Otp.findOne({ email: lowerEmail });

    // ⏱ Rate limit
    if (existingOtp) {
      const secondsSinceLast =
        (Date.now() - existingOtp.createdAt.getTime()) / 1000;

      if (secondsSinceLast < OTP_COOLDOWN_SECONDS) {
        return res.status(429).json({
          message: `Please wait ${Math.ceil(
            OTP_COOLDOWN_SECONDS - secondsSinceLast
          )} seconds before requesting OTP again`
        });
      }

      // 🔁 RESEND same OTP if still valid
      console.log(
        `🔁 Resending admin OTP for ${email}: ${existingOtp.otp}`
      );

      // Print OTP to console instead of sending email
      console.log(`📩 Admin OTP for ${email}: ${existingOtp.otp}`);

      return res.status(200).json({
        message: `Admin OTP resent. It is valid for ${OTP_VALIDITY_MINUTES} minutes`
      });
    }

    // 🆕 Generate new OTP
    const otp = generateOTP();

    await Otp.create({ email: lowerEmail, otp });

    console.log(
      `📩 Admin OTP generated for ${email}: ${otp}`
    );

    // Print OTP to console instead of sending email
    console.log(`📩 Admin OTP for ${email}: ${otp}`);

    res.status(200).json({
      message: `Admin OTP sent. It is valid for ${OTP_VALIDITY_MINUTES} minutes`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send admin OTP" });
  }
};
