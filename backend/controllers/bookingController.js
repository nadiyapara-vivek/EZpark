const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const Payment = require('../models/Payment');
const Promo = require('../models/Promo');
const calculatePrice = require('../utils/calculatePrice');
const { generateBookingQR } = require('../utils/qrGenerator');
const { getPaymentDeadline, getSecondsRemaining } = require('../utils/timer');

// @desc    Create a booking
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { slotId, vehicleNumber, startTime, endTime, promoCode } = req.body;

    const slot = await ParkingSlot.findById(slotId);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    if (!slot.isAvailable) return res.status(400).json({ success: false, message: 'Slot is not available' });

    const { duration, totalAmount } = calculatePrice(slot.pricePerHour, startTime, endTime);

    // Handle promo code
    let discountAmount = 0;
    let appliedPromo = null;
    if (promoCode) {
      const promo = await Promo.findOne({ code: promoCode.toUpperCase() });
      if (!promo) return res.status(400).json({ success: false, message: 'Invalid promo code' });

      const validity = promo.isValid(req.user._id, totalAmount);
      if (!validity.valid) return res.status(400).json({ success: false, message: validity.message });

      discountAmount = promo.calculateDiscount(totalAmount);
      appliedPromo = promo;
    }

    const finalAmount = totalAmount - discountAmount;
    const paymentDeadline = getPaymentDeadline();

    const booking = await Booking.create({
      user: req.user._id,
      slot: slotId,
      vehicleNumber: vehicleNumber || req.user.vehicleNumber,
      startTime,
      endTime,
      duration,
      totalAmount,
      promoCode: promoCode ? promoCode.toUpperCase() : null,
      discountAmount,
      finalAmount,
      status: 'pending',
      paymentDeadline
    });

    // Generate QR code
    try {
      const qrCode = await generateBookingQR({
        bookingId: booking.bookingId,
        slotNumber: slot.slotNumber,
        vehicleNumber: booking.vehicleNumber,
        startTime: booking.startTime,
        endTime: booking.endTime,
        finalAmount: booking.finalAmount
      });
      booking.qrCode = qrCode;
      await booking.save();
    } catch (qrErr) {
      console.error('QR generation failed (non-fatal):', qrErr.message);
    }

    // Mark slot unavailable
    await ParkingSlot.findByIdAndUpdate(slotId, { isAvailable: false });

    // Update promo usage
    if (appliedPromo) {
      appliedPromo.usedCount += 1;
      appliedPromo.usedBy.push(req.user._id);
      await appliedPromo.save();
    }

    await booking.populate(['slot', 'user']);

    res.status(201).json({
      success: true,
      message: 'Booking created',
      booking,
      paymentDeadline,
      secondsRemaining: getSecondsRemaining(paymentDeadline),
      discount: discountAmount > 0 ? { code: promoCode, amount: discountAmount } : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('slot')
      .sort({ createdAt: -1 });

    // Attach secondsRemaining for pending bookings
    const enriched = bookings.map(b => {
      const obj = b.toObject();
      if (b.status === 'pending' && b.paymentDeadline) {
        obj.secondsRemaining = getSecondsRemaining(b.paymentDeadline);
      }
      return obj;
    });

    res.status(200).json({ success: true, count: enriched.length, bookings: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(['slot', 'user']);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const obj = booking.toObject();
    if (booking.status === 'pending' && booking.paymentDeadline) {
      obj.secondsRemaining = getSecondsRemaining(booking.paymentDeadline);
    }

    res.status(200).json({ success: true, booking: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status} booking` });
    }
    booking.status = 'cancelled';
    await booking.save();
    await ParkingSlot.findByIdAndUpdate(booking.slot, { isAvailable: true });
    res.status(200).json({ success: true, message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a booking (only cancelled or completed)
// @route   DELETE /api/bookings/:id
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only the owner can delete their booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this booking' });
    }

    // Only allow deleting cancelled or completed bookings
    const deletableStatuses = ['cancelled', 'completed'];
    if (!deletableStatuses.includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete a booking with status "${booking.status}". Only cancelled or completed bookings can be deleted.`
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
      deletedId: req.params.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process payment for booking
// @route   POST /api/bookings/:id/pay
exports.processPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This booking has been cancelled (payment deadline may have expired)' });
    }

    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: booking.finalAmount || booking.totalAmount,
      method: req.body.method || 'card',
      transactionId: 'TXN-' + Date.now(),
      status: 'success'
    });

    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paymentDeadline = null;

    // Add entry log when confirmed
    booking.entryExitLogs.push({ type: 'entry', note: 'Payment confirmed' });
    await booking.save();

    res.status(200).json({ success: true, message: 'Payment successful', payment, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Extend booking time
// @route   PUT /api/bookings/:id/extend
exports.extendBooking = async (req, res) => {
  try {
    const { additionalHours } = req.body;
    if (!additionalHours || additionalHours < 1) {
      return res.status(400).json({ success: false, message: 'additionalHours must be at least 1' });
    }

    const booking = await Booking.findById(req.params.id).populate('slot');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!['confirmed', 'active'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Can only extend confirmed or active bookings' });
    }

    const additionalAmount = additionalHours * booking.slot.pricePerHour;
    const previousEndTime = booking.endTime;
    const newEndTime = new Date(new Date(booking.endTime).getTime() + additionalHours * 60 * 60 * 1000);

    booking.extensions.push({
      extendedAt: new Date(),
      previousEndTime,
      newEndTime,
      additionalAmount,
      additionalHours
    });
    booking.endTime = newEndTime;
    booking.duration = booking.duration + additionalHours;
    booking.totalAmount = booking.totalAmount + additionalAmount;
    booking.finalAmount = (booking.finalAmount || booking.totalAmount) + additionalAmount;

    await booking.save();

    // Create an additional payment record
    await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: additionalAmount,
      method: req.body.method || 'card',
      transactionId: 'TXN-EXT-' + Date.now(),
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: `Booking extended by ${additionalHours} hour(s)`,
      booking,
      extension: { additionalHours, additionalAmount, newEndTime }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Log vehicle entry or exit
// @route   POST /api/bookings/:id/log
exports.logEntryExit = async (req, res) => {
  try {
    const { type, note } = req.body;
    if (!['entry', 'exit'].includes(type)) {
      return res.status(400).json({ success: false, message: 'type must be "entry" or "exit"' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.entryExitLogs.push({ type, note: note || '', timestamp: new Date() });

    // Auto-update booking status
    if (type === 'entry' && booking.status === 'confirmed') booking.status = 'active';
    if (type === 'exit' && booking.status === 'active') booking.status = 'completed';

    await booking.save();

    // Free slot on exit
    if (type === 'exit') {
      await ParkingSlot.findByIdAndUpdate(booking.slot, { isAvailable: true });
    }

    res.status(200).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} logged`,
      log: booking.entryExitLogs[booking.entryExitLogs.length - 1],
      booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate promo code
// @route   POST /api/bookings/validate-promo
exports.validatePromo = async (req, res) => {
  try {
    const { code, amount } = req.body;
    const promo = await Promo.findOne({ code: code.toUpperCase() });
    if (!promo) return res.status(404).json({ success: false, message: 'Promo code not found' });

    const validity = promo.isValid(req.user._id, amount || 0);
    if (!validity.valid) return res.status(400).json({ success: false, message: validity.message });

    const discount = promo.calculateDiscount(amount || 0);

    res.status(200).json({
      success: true,
      message: 'Promo code is valid',
      promo: {
        code: promo.code,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discountAmount: discount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};