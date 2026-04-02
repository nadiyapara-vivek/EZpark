const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Promo code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount cannot be negative']
  },
  minBookingAmount: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: null // null = no cap
  },
  usageLimit: {
    type: Number,
    default: null // null = unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Instance method to check if promo is valid
promoSchema.methods.isValid = function (userId, bookingAmount) {
  if (!this.isActive) return { valid: false, message: 'Promo code is inactive' };
  if (this.expiresAt && new Date() > this.expiresAt) return { valid: false, message: 'Promo code has expired' };
  if (this.usageLimit && this.usedCount >= this.usageLimit) return { valid: false, message: 'Promo code usage limit reached' };
  if (this.usedBy.map(id => id.toString()).includes(userId.toString())) return { valid: false, message: 'You have already used this promo code' };
  if (bookingAmount < this.minBookingAmount) return { valid: false, message: `Minimum booking amount of ₹${this.minBookingAmount} required` };
  return { valid: true };
};

// Instance method to calculate discount
promoSchema.methods.calculateDiscount = function (amount) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (amount * this.discountValue) / 100;
    if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
  } else {
    discount = Math.min(this.discountValue, amount);
  }
  return Math.round(discount * 100) / 100;
};

module.exports = mongoose.model('Promo', promoSchema);