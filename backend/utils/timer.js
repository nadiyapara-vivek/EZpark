/**
 * Booking Timer Utility
 * Handles auto-cancellation of unpaid bookings after 10 minutes
 * Uses node-cron: npm install node-cron
 */
const cron = require('node-cron');

let Booking;
let ParkingSlot;

/**
 * Initialize the timer module with models (call after mongoose connects)
 */
const initTimer = () => {
  Booking = require('../models/Booking');
  ParkingSlot = require('../models/ParkingSlot');

  // Run every minute to check for expired payment deadlines
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // Find bookings that are pending, unpaid, and past their payment deadline
      const expiredBookings = await Booking.find({
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentDeadline: { $lt: now, $ne: null }
      });

      for (const booking of expiredBookings) {
        booking.status = 'cancelled';
        await booking.save();

        // Free the parking slot
        await ParkingSlot.findByIdAndUpdate(booking.slot, { isAvailable: true });

        console.log(`⏰ Auto-cancelled booking ${booking.bookingId} (payment deadline expired)`);
      }

      if (expiredBookings.length > 0) {
        console.log(`✅ Auto-cancelled ${expiredBookings.length} expired booking(s)`);
      }
    } catch (error) {
      console.error('Timer cron error:', error.message);
    }
  });

  console.log('⏱️  Booking auto-cancel timer initialized (runs every minute)');
};

/**
 * Get payment deadline (10 minutes from now)
 */
const getPaymentDeadline = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

/**
 * Get seconds remaining until deadline
 */
const getSecondsRemaining = (deadline) => {
  if (!deadline) return 0;
  const diff = new Date(deadline) - new Date();
  return Math.max(0, Math.floor(diff / 1000));
};

module.exports = { initTimer, getPaymentDeadline, getSecondsRemaining };