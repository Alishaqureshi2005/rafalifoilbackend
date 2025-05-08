const SystemSetting = require('../models/SystemSetting');

// Get all system settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.find();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update or create a system setting
exports.updateSetting = async (req, res) => {
  try {
    const { key, value, description } = req.body;
    let setting = await SystemSetting.findOne({ key });
    if (setting) {
      setting.value = value;
      if (description) setting.description = description;
      await setting.save();
    } else {
      setting = new SystemSetting({ key, value, description });
      await setting.save();
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
