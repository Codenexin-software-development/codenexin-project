const User = require('../models/User');
const Membership = require('../models/Membership');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalMembers = await User.countDocuments();
    const activeMembers = await Membership.countDocuments({ status: 'ACTIVE' });
    const pendingMembers = await Membership.countDocuments({ status: 'PENDING' });
    const inactiveMembers = await Membership.countDocuments({ status: 'INACTIVE' });

    // Calculate expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringSoon = await Membership.countDocuments({
      validTill: { $lte: thirtyDaysFromNow },
      status: 'ACTIVE'
    });

    res.json({
      total: totalMembers,
      active: activeMembers,
      pending: pendingMembers,
      inactive: inactiveMembers,
      expiring: expiringSoon
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

exports.getAllMembers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const membersData = await Promise.all(users.map(async (user) => {
      const membership = await Membership.findOne({ userId: user._id });

      return {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email || '',
        status: membership ? membership.status : 'NO_MEMBERSHIP',
        validTill: membership ? membership.validTill : null,
        joinedDate: membership ? membership.joinedDate : null,
        membershipNumber: membership ? membership.membershipNumber : null,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        profileComplete: user.profileComplete
      };
    }));

    res.json(membersData);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Failed to fetch members' });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    await Membership.findByIdAndDelete(id);
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ message: 'Failed to delete member' });
  }
};

exports.updateMemberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // action: 'approve', 'reject', 'deactivate', 'extend', 'reactivate'

    const member = await Membership.findById(id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    let updateData = {};
    let newValidTill = null;

    switch (action) {
      case 'approve':
        updateData.status = 'ACTIVE';
        newValidTill = new Date();
        newValidTill.setFullYear(newValidTill.getFullYear() + 1);
        updateData.validTill = newValidTill;
        break;
      case 'reject':
        updateData.status = 'REJECTED';
        updateData.validTill = null;
        break;
      case 'deactivate':
        updateData.status = 'INACTIVE';
        updateData.validTill = null;
        break;
      case 'extend':
        if (member.status === 'ACTIVE') {
          newValidTill = new Date(member.validTill);
          newValidTill.setFullYear(newValidTill.getFullYear() + 1);
          updateData.validTill = newValidTill;
        } else {
          return res.status(400).json({ message: 'Can only extend active members' });
        }
        break;
      case 'reactivate':
        updateData.status = 'ACTIVE';
        newValidTill = new Date();
        newValidTill.setFullYear(newValidTill.getFullYear() + 1);
        updateData.validTill = newValidTill;
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    const updatedMember = await Membership.findByIdAndUpdate(id, updateData, { new: true })
      .populate('userId', 'name mobile isActive lastLogin');

    res.json({
      id: updatedMember._id,
      name: updatedMember.userId.name,
      mobile: updatedMember.userId.mobile,
      status: updatedMember.status,
      validTill: updatedMember.validTill,
      joinedDate: updatedMember.joinedDate,
      membershipNumber: updatedMember.membershipNumber,
      isActive: updatedMember.userId.isActive,
      lastLogin: updatedMember.userId.lastLogin
    });
  } catch (error) {
    console.error('Error updating member status:', error);
    res.status(500).json({ message: 'Failed to update member status' });
  }
};

exports.createMember = async (req, res) => {
  try {
    const { name, mobile } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({ message: 'Name and mobile are required' });
    }

    // Check if user exists
    let user = await User.findOne({ mobile });
    if (!user) {
      user = new User({ name, mobile });
      await user.save();
    }

    // Check if membership already exists
    const existingMembership = await Membership.findOne({ userId: user._id });
    if (existingMembership) {
      return res.status(400).json({ message: 'Membership already exists for this user' });
    }

    // Create membership
    const membership = new Membership({
      userId: user._id,
      status: 'PENDING',
      validTill: null,
      membershipNumber: `MEM${Date.now()}`
    });

    await membership.save();

    const populatedMembership = await Membership.findById(membership._id)
      .populate('userId', 'name mobile isActive lastLogin');

    res.status(201).json({
      id: populatedMembership._id,
      name: populatedMembership.userId.name,
      mobile: populatedMembership.userId.mobile,
      status: populatedMembership.status,
      validTill: populatedMembership.validTill,
      joinedDate: populatedMembership.joinedDate,
      membershipNumber: populatedMembership.membershipNumber,
      isActive: populatedMembership.userId.isActive,
      lastLogin: populatedMembership.userId.lastLogin
    });
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({ message: 'Failed to create member' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // First, delete the membership if it exists
    await Membership.findOneAndDelete({ userId: id });

    // Then delete the user
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};
