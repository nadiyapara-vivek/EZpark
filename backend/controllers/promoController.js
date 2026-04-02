const Promo = require('../models/Promo');

// @desc    Create promo code (Admin)
// @route   POST /api/promos
exports.createPromo = async (req, res) => {
  try {
    const promo = await Promo.create(req.body);
    res.status(201).json({ success: true, message: 'Promo code created', promo });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all promo codes (Admin)
// @route   GET /api/promos
exports.getAllPromos = async (req, res) => {
  try {
    const promos = await Promo.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: promos.length, promos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update promo code (Admin)
// @route   PUT /api/promos/:id
exports.updatePromo = async (req, res) => {
  try {
    const promo = await Promo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!promo) return res.status(404).json({ success: false, message: 'Promo not found' });
    res.status(200).json({ success: true, message: 'Promo updated', promo });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete promo code (Admin)
// @route   DELETE /api/promos/:id
exports.deletePromo = async (req, res) => {
  try {
    const promo = await Promo.findByIdAndDelete(req.params.id);
    if (!promo) return res.status(404).json({ success: false, message: 'Promo not found' });
    res.status(200).json({ success: true, message: 'Promo deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle promo active status (Admin)
// @route   PUT /api/promos/:id/toggle
exports.togglePromo = async (req, res) => {
  try {
    const promo = await Promo.findById(req.params.id);
    if (!promo) return res.status(404).json({ success: false, message: 'Promo not found' });
    promo.isActive = !promo.isActive;
    await promo.save();
    res.status(200).json({ success: true, message: `Promo ${promo.isActive ? 'activated' : 'deactivated'}`, promo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};