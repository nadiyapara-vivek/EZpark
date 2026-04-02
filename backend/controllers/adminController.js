const User = require('../models/User');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const Payment = require('../models/Payment');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalSlots = await ParkingSlot.countDocuments();
    const availableSlots = await ParkingSlot.countDocuments({ isAvailable: true });
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'confirmed' });
    const revenue = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenue.length > 0 ? revenue[0].total : 0;

    res.status(200).json({
      success: true,
      stats: { totalUsers, totalSlots, availableSlots, totalBookings, activeBookings, totalRevenue }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('slot', 'slotNumber location')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/admin/bookings/:id
exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate(['user', 'slot']);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.status(200).json({ success: true, message: 'Booking updated', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seed demo slots
// @route   POST /api/admin/seed-slots
exports.seedSlots = async (req, res) => {
  try {
    await ParkingSlot.deleteMany({});
    const slots = [];
    const types = ['standard', 'compact', 'ev', 'vip', 'handicapped'];
    const floors = ['Ground', 'Floor 1', 'Floor 2'];
    for (let i = 1; i <= 30; i++) {
      slots.push({
        slotNumber: `P${String(i).padStart(3, '0')}`,
        location: 'Main Parking Complex',
        floor: floors[Math.floor(i / 11)],
        type: types[i % 5],
        pricePerHour: [20, 15, 30, 50, 10][i % 5],
        isAvailable: Math.random() > 0.3,
        features: i % 5 === 2 ? ['EV Charging'] : i % 5 === 3 ? ['CCTV', 'Valet'] : ['CCTV'],
        description: `Parking slot ${i}`
      });
    }
    await ParkingSlot.insertMany(slots);
    res.status(201).json({ success: true, message: '30 parking slots seeded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};