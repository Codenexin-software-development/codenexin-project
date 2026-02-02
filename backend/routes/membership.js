// routes/membership.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const Membership = require("../models/Membership");

router.get("/me", auth, async (req, res) => {
  const membership = await Membership.findOne({ userId: req.userId });
  res.json(membership);
});

module.exports = router;
