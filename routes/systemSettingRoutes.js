const express = require('express');
const router = express.Router();
const systemSettingController = require('../controllers/systemSettingController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', protect, authorizeRoles('admin'), systemSettingController.getSettings);
router.post('/', protect, authorizeRoles('admin'), systemSettingController.updateSetting);

module.exports = router;
