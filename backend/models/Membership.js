// models/Membership.js
const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true
  },
  membershipNumber: String,
  status: {
    type: String,
    default: "ACTIVE"
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },
  validTill: Date
});

module.exports = mongoose.model("Membership", membershipSchema);
