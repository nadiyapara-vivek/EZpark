const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, bookingController.createBooking);
router.get('/my', protect, bookingController.getMyBookings);
router.post('/validate-promo', protect, bookingController.validatePromo);
router.get('/:id', protect, bookingController.getBooking);
router.put('/:id/cancel', protect, bookingController.cancelBooking);
router.delete('/:id', protect, bookingController.deleteBooking);   // only cancelled / completed
router.post('/:id/pay', protect, bookingController.processPayment);
router.put('/:id/extend', protect, bookingController.extendBooking);
router.post('/:id/log', protect, bookingController.logEntryExit);

module.exports = router;