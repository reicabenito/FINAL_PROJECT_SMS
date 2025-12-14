// testEmail.js
require('dotenv').config(); // load .env
const nodemailer = require('nodemailer'); // <- you need this
const sendEmail = require('./utils/email'); // your existing sendEmail function

// Test sending an email
(async () => {
  try {
    await sendEmail({
      to: 'izziegreen68@gmail.com', // replace with your personal email to test
      subject: 'Test Email from PTC SMS',
      text: 'Hello! This is a test email from your PTC SMS system.',
    });
    console.log('Test email sent successfully!');
  } catch (err) {
    console.error('Error sending test email:', err);
  }
})();
