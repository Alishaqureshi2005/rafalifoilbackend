const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', protect, authorizeRoles('admin', 'moderator'), analyticsController.getAnalytics);

module.exports = router;
