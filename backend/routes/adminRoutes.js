const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.get('/stats', protect, adminOnly, adminController.getStats);
router.get('/users', protect, adminOnly, adminController.getAllUsers);
router.delete('/users/:id', protect, adminOnly, adminController.deleteUser);
router.get('/bookings', protect, adminOnly, adminController.getAllBookings);
router.put('/bookings/:id', protect, adminOnly, adminController.updateBookingStatus);
router.post('/seed-slots', protect, adminOnly, adminController.seedSlots);

module.exports = router;