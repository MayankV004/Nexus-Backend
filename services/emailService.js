import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email, firstName, otp) => {
  const mailOptions = {
    from: `"Nexus" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email Address",
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>Welcome to Finora, ${firstName}!</h2>
        <p>Thank you for signing up. Please use the OTP below to verify your email address and complete your registration.</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #007bff; color: white; padding: 20px; 
                      font-size: 24px; font-weight: bold; border-radius: 5px; 
                      display: inline-block; letter-spacing: 2px;">
            ${otp}
          </div>
        </div>
        <p>Enter this OTP in the verification form to complete your registration.</p>
        <p style="color: #666; font-size: 12px;">This OTP will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Nexus" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>Password Reset Request</h2>
        <p>Hi ${firstName},</p>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #dc3545; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p style="color: #666; font-size: 12px;">This link will expire in 1 hour.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email, firstName) => {
  const mailOptions = {
    from: `"Nexus" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to Nexus!",
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2>Welcome aboard, ${firstName}! 🎉</h2>
        <p>Your email has been verified successfully. You're all set to start managing your projects and issues with nexus.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/dashboard"
             style="background-color: #28a745; color: white; padding: 12px 30px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        <p>Feel free to explore the features and start collaborating with your team.</p>
        <p>The Nexus Team - Mayank Verma</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};