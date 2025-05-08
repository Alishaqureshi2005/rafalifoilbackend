const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/', protect, reportController.createReport);
router.get('/', protect, authorizeRoles('admin', 'moderator'), reportController.getReports);
router.put('/:id/status', protect, authorizeRoles('admin', 'moderator'), reportController.updateReportStatus);

module.exports = router;
