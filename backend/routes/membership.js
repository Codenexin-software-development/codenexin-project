// routes/membership.js
const router = require("express").Router();
const auth = require("../middleware/auth.js");
const Membership = require("../models/Membership");

router.get("/me", auth, async (req, res) => {
  try {
    const membership = await Membership.findOne({ userId: req.user.id });
    if (!membership) {
      return res.json({ success: false, message: "Membership not found" });
    }
    res.json({ success: true, data: membership });
  } catch (error) {
    console.error("Error fetching membership:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/accept-terms", auth, async (req, res) => {
  try {
    const { accepted, acceptedDate } = req.body;

    if (!accepted) {
      return res.status(400).json({ success: false, message: "Terms must be accepted" });
    }

    const membershipNumber = `NPP-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const membership = await Membership.findOneAndUpdate(
      { userId: req.user.id },
      {
        membershipNumber,
        status: "ACTIVE",
        joinedDate: new Date(),
        validTill: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        termsAccepted: true,
        acceptedAt: acceptedDate ? new Date(acceptedDate) : new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: membership });
  } catch (error) {
    console.error("Error accepting terms:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
