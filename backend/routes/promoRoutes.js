const express = require('express');
const router = express.Router();

const promoController = require('../controllers/promoController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// Admin only
router.post('/', protect, adminOnly, promoController.createPromo);
router.get('/', protect, adminOnly, promoController.getAllPromos);
router.put('/:id', protect, adminOnly, promoController.updatePromo);
router.delete('/:id', protect, adminOnly, promoController.deletePromo);
router.put('/:id/toggle', protect, adminOnly, promoController.togglePromo);

module.exports = router;