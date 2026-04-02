const express = require('express');
const router = express.Router();

const slotController = require('../controllers/slotController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.get('/', slotController.getAllSlots);
router.get('/:id', slotController.getSlot);
router.post('/', protect, adminOnly, slotController.createSlot);
router.put('/:id', protect, adminOnly, slotController.updateSlot);
router.delete('/:id', protect, adminOnly, slotController.deleteSlot);

module.exports = router;