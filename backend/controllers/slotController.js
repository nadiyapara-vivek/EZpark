const ParkingSlot = require('../models/ParkingSlot');

// @desc    Get all slots
// @route   GET /api/slots
exports.getAllSlots = async (req, res) => {
  try {
    const { type, isAvailable, location } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    if (location) filter.location = new RegExp(location, 'i');
    const slots = await ParkingSlot.find(filter).sort({ slotNumber: 1 });
    res.status(200).json({ success: true, count: slots.length, slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single slot
// @route   GET /api/slots/:id
exports.getSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    res.status(200).json({ success: true, slot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create slot (Admin)
// @route   POST /api/slots
exports.createSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.create(req.body);
    res.status(201).json({ success: true, message: 'Slot created', slot });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update slot (Admin)
// @route   PUT /api/slots/:id
exports.updateSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    res.status(200).json({ success: true, message: 'Slot updated', slot });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete slot (Admin)
// @route   DELETE /api/slots/:id
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    res.status(200).json({ success: true, message: 'Slot deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};