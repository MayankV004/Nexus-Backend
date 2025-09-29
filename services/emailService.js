import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email, firstName, otp) => {
  const { data, error } = await resend.emails.send({
    from: `Nexus <${process.env.FROM_EMAIL}>`,
    to: [email],
    subject: "Verify Your Email Address - Nexus",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh; padding: 60px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #16161a; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);">
                
                <!-- Header with Gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 40px; text-align: center;">
                    <div style="width: 64px; height: 64px; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border-radius: 16px; margin: 0 auto 20px; line-height: 64px;">
                      <span style="font-size: 32px;">✉️</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Verify Your Email</h1>
                    <p style="color: rgba(255, 255, 255, 0.85); margin: 12px 0 0; font-size: 16px;">Complete your registration</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <h2 style="color: #f7f7f8; margin: 0 0 12px; font-size: 22px; font-weight: 600;">Hello ${firstName} 👋</h2>
                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.7; margin: 0 0 32px;">Welcome to Nexus! Enter the verification code below to activate your account and start your journey.</p>
                    
                    <!-- OTP Box -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 32px 0;">
                          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 32px; display: inline-block; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">
                            <div style="color: #ffffff; font-size: 42px; font-weight: 700; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                              ${otp}
                            </div>
                          </div>
                          <p style="color: #64748b; font-size: 14px; margin: 20px 0 0;">Valid for 10 minutes</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Info Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                      <tr>
                        <td style="background: rgba(100, 116, 139, 0.1); border-left: 3px solid #667eea; border-radius: 8px; padding: 20px;">
                          <p style="color: #f7f7f8; font-weight: 600; margin: 0 0 8px; font-size: 14px;">🔒 Security Notice</p>
                          <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.6;">Didn't request this? You can safely ignore this email. Your account remains secure.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: #0f0f12; padding: 32px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 8px;">Need assistance? <a href="mailto:support@nexus.com" style="color: #667eea; text-decoration: none;">Contact Support</a></p>
                    <p style="color: #475569; font-size: 12px; margin: 0;">© 2025 Nexus. All rights reserved.</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }

  return data;
};

export const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

  const { data, error } = await resend.emails.send({
    from: `Nexus <${process.env.FROM_EMAIL}>`,
    to: [email],
    subject: "Reset Your Password - Nexus",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh; padding: 60px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #16161a; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);">
                
                <!-- Header with Gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 40px; text-align: center;">
                    <div style="width: 64px; height: 64px; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border-radius: 16px; margin: 0 auto 20px; line-height: 64px;">
                      <span style="font-size: 32px;">🔐</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Reset Password</h1>
                    <p style="color: rgba(255, 255, 255, 0.85); margin: 12px 0 0; font-size: 16px;">Secure your account</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <h2 style="color: #f7f7f8; margin: 0 0 12px; font-size: 22px; font-weight: 600;">Hello ${firstName} 👋</h2>
                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.7; margin: 0 0 32px;">We received a request to reset your password. Click the button below to create a new secure password.</p>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 16px 0;">
                          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 18px 48px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3); transition: transform 0.2s;">
                            Reset My Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Alternative Link Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 40px;">
                      <tr>
                        <td style="background: rgba(100, 116, 139, 0.1); border-radius: 12px; padding: 24px;">
                          <p style="color: #f7f7f8; font-weight: 600; margin: 0 0 12px; font-size: 14px;">🔗 Alternative Method</p>
                          <p style="color: #94a3b8; font-size: 14px; margin: 0 0 16px; line-height: 1.6;">If the button doesn't work, copy this link:</p>
                          <div style="background: #0f0f12; border-radius: 8px; padding: 16px; word-break: break-all; border: 1px solid rgba(255, 255, 255, 0.05);">
                            <a href="${resetUrl}" style="color: #667eea; font-size: 13px; text-decoration: none; font-family: 'Courier New', monospace;">${resetUrl}</a>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Security Notice -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                      <tr>
                        <td style="background: rgba(100, 116, 139, 0.1); border-left: 3px solid #764ba2; border-radius: 8px; padding: 20px;">
                          <p style="color: #f7f7f8; font-weight: 600; margin: 0 0 8px; font-size: 14px;">⚠️ Security Information</p>
                          <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.6;">This link expires in 1 hour. Didn't request this? Ignore this email and your password won't change.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: #0f0f12; padding: 32px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 8px;">Questions? <a href="mailto:support@nexus.com" style="color: #667eea; text-decoration: none;">Contact Support</a></p>
                    <p style="color: #475569; font-size: 12px; margin: 0;">© 2025 Nexus. All rights reserved.</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }

  return data;
};

export const sendWelcomeEmail = async (email, firstName) => {
  const { data, error } = await resend.emails.send({
    from: `Nexus <${process.env.FROM_EMAIL}>`,
    to: [email],
    subject: "Welcome to Nexus - You're All Set!",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Nexus</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh; padding: 60px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #16161a; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);">
                
                <!-- Header with Gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 40px; text-align: center;">
                    <div style="width: 80px; height: 80px; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border-radius: 20px; margin: 0 auto 20px; line-height: 80px;">
                      <span style="font-size: 40px;">🎉</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: -0.5px;">Welcome to Nexus</h1>
                    <p style="color: rgba(255, 255, 255, 0.85); margin: 12px 0 0; font-size: 18px;">You're all set to get started</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <h2 style="color: #f7f7f8; margin: 0 0 12px; font-size: 22px; font-weight: 600;">Hello ${firstName} 👋</h2>
                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.7; margin: 0 0 32px;">Your email has been verified successfully! You're now ready to experience the power of Nexus and transform how you manage projects.</p>
                    
                    <!-- Features Grid -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                      <tr>
                        <td style="background: rgba(102, 126, 234, 0.1); border-radius: 16px; padding: 32px; border: 1px solid rgba(102, 126, 234, 0.2);">
                          <h3 style="color: #f7f7f8; margin: 0 0 20px; font-size: 18px; font-weight: 600;">✨ What You Can Do</h3>
                          
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 12px 0; vertical-align: top;">
                                <table cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="vertical-align: top; padding-right: 12px;">
                                      <div style="width: 8px; height: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin-top: 6px;"></div>
                                    </td>
                                    <td>
                                      <p style="color: #94a3b8; font-size: 15px; margin: 0; line-height: 1.6;"><strong style="color: #f7f7f8;">Create Projects:</strong> Organize work efficiently</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; vertical-align: top;">
                                <table cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="vertical-align: top; padding-right: 12px;">
                                      <div style="width: 8px; height: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin-top: 6px;"></div>
                                    </td>
                                    <td>
                                      <p style="color: #94a3b8; font-size: 15px; margin: 0; line-height: 1.6;"><strong style="color: #f7f7f8;">Track Issues:</strong> Stay on top of every detail</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; vertical-align: top;">
                                <table cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="vertical-align: top; padding-right: 12px;">
                                      <div style="width: 8px; height: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin-top: 6px;"></div>
                                    </td>
                                    <td>
                                      <p style="color: #94a3b8; font-size: 15px; margin: 0; line-height: 1.6;"><strong style="color: #f7f7f8;">Collaborate:</strong> Work seamlessly with your team</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; vertical-align: top;">
                                <table cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="vertical-align: top; padding-right: 12px;">
                                      <div style="width: 8px; height: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin-top: 6px;"></div>
                                    </td>
                                    <td>
                                      <p style="color: #94a3b8; font-size: 15px; margin: 0; line-height: 1.6;"><strong style="color: #f7f7f8;">Boost Productivity:</strong> Achieve more together</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 24px 0;">
                          <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 18px 48px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">
                            Open Dashboard →
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Help Section -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                      <tr>
                        <td style="background: rgba(100, 116, 139, 0.1); border-left: 3px solid #667eea; border-radius: 8px; padding: 20px;">
                          <p style="color: #f7f7f8; font-weight: 600; margin: 0 0 8px; font-size: 14px;">💡 Need Help Getting Started?</p>
                          <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.6;">Explore our features or reach out to support anytime. We're here to help you succeed!</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: #0f0f12; padding: 40px 40px 32px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                    <p style="color: #f7f7f8; font-size: 16px; margin: 0 0 16px; font-weight: 600;">Welcome to the future of project management 🚀</p>
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 8px;">Have questions? <a href="mailto:support@nexus.com" style="color: #667eea; text-decoration: none;">Contact Support</a></p>
                    <p style="color: #475569; font-size: 12px; margin: 0;">© 2025 Nexus. All rights reserved.</p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }

  return data;
};