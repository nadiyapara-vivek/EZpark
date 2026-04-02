const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  slotNumber: {
    type: String,
    required: [true, 'Slot number is required'],
    unique: true,
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  floor: {
    type: String,
    default: 'Ground'
  },
  type: {
    type: String,
    enum: ['standard', 'compact', 'handicapped', 'ev', 'vip'],
    default: 'standard'
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Price per hour is required'],
    min: [0, 'Price cannot be negative']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  features: [{
    type: String
  }],
  description: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);