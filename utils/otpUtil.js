const nodemailer = require('nodemailer');
const crypto = require('crypto');

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendEmail = async (to, subject, text) => {
  // Create transporter using environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"No Reply" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  generateOTP,
  sendEmail
};
