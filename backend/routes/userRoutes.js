const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.put('/change-password', protect, userController.changePassword);

module.exports = router;