const mongoose = require('mongoose');

const entryExitLogSchema = new mongoose.Schema({
  type: { type: String, enum: ['entry', 'exit'], required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String }
});

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot',
    required: true
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    uppercase: true,
    trim: true
  },
  startTime: { type: Date, required: [true, 'Start time is required'] },
  endTime: { type: Date, required: [true, 'End time is required'] },
  duration: { type: Number }, // in hours
  totalAmount: { type: Number, required: true },

  // Promo / discount
  promoCode: { type: String, default: null },
  discountAmount: { type: Number, default: 0 },
  finalAmount: { type: Number }, // totalAmount - discountAmount

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  bookingId: { type: String, unique: true },

  // QR Code (base64 data URL stored here)
  qrCode: { type: String, default: null },

  // Auto-cancel timer — deadline by which payment must be made
  paymentDeadline: { type: Date, default: null },

  // Entry/Exit logs
  entryExitLogs: [entryExitLogSchema],

  // Extension history
  extensions: [{
    extendedAt: { type: Date, default: Date.now },
    previousEndTime: Date,
    newEndTime: Date,
    additionalAmount: Number,
    additionalHours: Number
  }]
}, { timestamps: true });

bookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    this.bookingId = 'EZP-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }
  if (this.startTime && this.endTime) {
    this.duration = Math.ceil((this.endTime - this.startTime) / (1000 * 60 * 60));
  }
  if (this.finalAmount === undefined || this.finalAmount === null) {
    this.finalAmount = this.totalAmount - (this.discountAmount || 0);
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);