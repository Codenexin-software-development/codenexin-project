const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllMembers, createMember, updateMemberStatus, deleteMember, deleteUser } = require('../controllers/adminController');

// Middleware to check admin authentication (you can implement JWT or session-based auth)
const adminAuth = (req, res, next) => {
  // For now, simple check - in production, use proper JWT verification
  const isAdmin = req.headers.authorization === 'Bearer admin-token'; // Replace with real auth
  if (!isAdmin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

router.get('/stats', adminAuth, getDashboardStats);
router.get('/members', adminAuth, getAllMembers);
router.post('/members', adminAuth, createMember);
router.put('/members/:id/status', adminAuth, updateMemberStatus);
router.delete('/members/:id', adminAuth, deleteMember);
router.delete('/users/:id', adminAuth, deleteUser);

module.exports = router;
