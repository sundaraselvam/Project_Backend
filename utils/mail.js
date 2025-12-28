import nodemailer from 'nodemailer';

export const sendResetEmail = async (email, token) => {
  const resetUrl = `http://localhost:3001/reset?token=${token}`;

  let transporter;
  try {
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER || 'your-ethereal-user',
        pass: process.env.ETHEREAL_PASS || 'your-ethereal-pass'
      }
    });
  } catch (error) {
    console.error('Error creating email transporter:', error);
    return;
  }

  const mailOptions = {
    from: 'noreply@jobportal.com',
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset for your JobPortal account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };

  // For development, log the email instead of sending
  console.log('=== PASSWORD RESET EMAIL ===');
  console.log(`To: ${email}`);
  console.log(`Subject: ${mailOptions.subject}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log('=============================');

  // Uncomment below to actually send email (after setting up Ethereal)
  // try {
  //   await transporter.sendMail(mailOptions);
  // } catch (error) {
  //   console.error('Error sending email:', error);
  // }
};