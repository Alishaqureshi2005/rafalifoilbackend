const Report = require('../models/Report');

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const { reportedUser, reportedContentId, contentType, reason } = req.body;
    const report = new Report({
      reporter: req.user._id,
      reportedUser,
      reportedContentId,
      contentType,
      reason
    });
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all reports (admin/moderator)
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('reporter', 'firstName surname').sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update report status
exports.updateReportStatus = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    report.status = req.body.status;
    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
