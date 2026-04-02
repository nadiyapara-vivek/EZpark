/**
 * Calculate total parking price
 * @param {Number} pricePerHour - Price per hour
 * @param {Date} startTime - Parking start time
 * @param {Date} endTime - Parking end time
 * @returns {Object} - { duration, totalAmount }
 */
const calculatePrice = (pricePerHour, startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;
  const diffHours = diffMs / (1000 * 60 * 60);
  const duration = Math.ceil(diffHours); // Round up to nearest hour
  const totalAmount = parseFloat((duration * pricePerHour).toFixed(2));
  return { duration, totalAmount };
};

module.exports = calculatePrice;