/**
 * QR Code Generator Utility
 * Generates a QR code data URL for a booking
 * Uses the qrcode npm package: npm install qrcode
 */
const QRCode = require('qrcode');

/**
 * Generate a QR code data URL for a booking
 * @param {Object} bookingData - Booking information to encode
 * @returns {Promise<string>} - Base64 data URL of the QR code image
 */
const generateBookingQR = async (bookingData) => {
  const payload = JSON.stringify({
    bookingId: bookingData.bookingId,
    slotNumber: bookingData.slotNumber,
    vehicleNumber: bookingData.vehicleNumber,
    startTime: bookingData.startTime,
    endTime: bookingData.endTime,
    amount: bookingData.finalAmount || bookingData.totalAmount
  });

  try {
    const qrDataURL = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      width: 256
    });
    return qrDataURL;
  } catch (error) {
    console.error('QR generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

module.exports = { generateBookingQR };