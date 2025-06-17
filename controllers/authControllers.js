import { User } from "../models/index.js";
import * as jwt from "../utils/jwt.js";
import * as emailService from "../services/emailService.js";
import { setCookies, removeCookies } from "../utils/cookies.js";
import {
  signUpSchema,
  loginSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
  changePasswordSchema,
} from "../validation/authValidation.js";
import { generateOTP, verifyOTP } from "../utils/otp.js";

export const signUp = async (req, res) => {
  try {
    const body = req.body;
    const result = signUpSchema.safeParse(body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.errors[0]?.message || "Validation failed",
      });
    }
    const { name, username, email, password, confirmPassword } = result.data;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords don't match!",
      });
    }

    const isExist = await User.findOne({ email });
    if (isExist) {
      return res.status(409).json({
        success: false,
        message: "Email already registered!",
      });
    }

    const { otp, hashedOTP, otpExpires } = generateOTP();

    // creating new user
    const user = new User({
      name,
      username,
      email,
      password,
      role: "developer",
      verificationToken: hashedOTP,
      verificationTokenExpires: otpExpires,
    });

    await user.save();
    
    // send verification email
    await emailService.sendVerificationEmail(email, name, otp);

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("SignUp error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register. Please try again later.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const body = req.body;
    const result = loginSchema.safeParse(body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.errors[0]?.message || "Validation failed",
      });
    }
    
    const { email, password } = result.data;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    
    // if (!user.isEmailVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Please verify your email first",
    //   });
    // }

    // removing old/expired refresh tokens
    user.refreshToken = user.refreshToken.filter(
      (token) => token.expiresAt > new Date()
    );

    // generate tokens
    const accessToken = jwt.generateAccessToken({
      userId: user._id,
      email: user.email,
    });
    const refreshToken = jwt.generateRefreshToken({
      userId: user._id,
      email: user.email,
    });

    user.refreshToken.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    user.lastLogin = new Date();
    await user.save();
    
    setCookies(res, accessToken, refreshToken);
    
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          role: user.role,
          avatar: user.avatar,
          preferences: user.preferences,
          lastLogin: user.lastLogin,
        },
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    removeCookies(res);
    return res.status(500).json({
      success: false,
      message: "Failed to login. Please try again later.",
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or verification token expired",
      });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // verify OTP
    const isValidOTP = await verifyOTP(otp, user.verificationToken);
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // verify email
    user.isEmailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;

    // Setting Tokens
    const accessToken = jwt.generateAccessToken({
      userId: user._id,
      email: user.email,
    });
    const refreshToken = jwt.generateRefreshToken({
      userId: user._id,
      email: user.email,
    });

    user.refreshToken.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    user.lastLogin = new Date();
    await user.save();
    
    setCookies(res, accessToken, refreshToken);

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          role: user.role,
          avatar: user.avatar,
          preferences: user.preferences,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify email. Please try again later.",
    });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    const { otp, hashedOTP, otpExpires } = generateOTP();

    user.verificationToken = hashedOTP;
    user.verificationTokenExpires = otpExpires;
    await user.save();

    // send verification email
    await emailService.sendVerificationEmail(user.email, user.name, otp);
    
    res.status(200).json({
      success: true,
      message: "OTP sent on email successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification email. Please try again later.",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    let decoded;
    try {
      decoded = jwt.verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the refresh token exists in the user's tokens
    const tokenExists = user.refreshToken.some(
      (token) => token.token === refreshToken && token.expiresAt > new Date()
    );
    
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found or expired",
      });
    }

    // Generate new tokens
    const newAccessToken = jwt.generateAccessToken({
      userId: user._id,
      email: user.email,
    });
    const newRefreshToken = jwt.generateRefreshToken({
      userId: user._id,
      email: user.email,
    });

    // Remove old refresh token and add new one
    user.refreshToken = user.refreshToken.filter(
      (token) => token.token !== refreshToken
    );
    user.refreshToken.push({
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await user.save();
    
    setCookies(res, newAccessToken, newRefreshToken);
    
    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refresh token. Please try again later.",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const body = req.body;
    const result = forgotPasswordSchema.safeParse(body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.errors[0]?.message || "Validation failed",
      });
    }
    
    const { email } = result.data;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // creating reset password token
    const resetToken = jwt.generatePasswordResetToken({
      userId: user._id,
      email: user.email,
    });
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // send reset password email
    await emailService.sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken
    );
    
    res.status(200).json({
      success: true,
      message: "Reset password email sent successfully",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reset password email. Please try again later.",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const body = req.body;
    const result = resetPasswordSchema.safeParse(body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.errors[0]?.message || "Validation failed",
      });
    }
    
    const { token, newPassword } = result.data;

    let decoded;
    try {
      decoded = jwt.verifyPasswordResetToken(token);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset password token",
      });
    }

    const user = await User.findById(decoded.userId);
    if (
      !user ||
      user.resetPasswordToken !== token ||
      user.resetPasswordTokenExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset password token",
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpires = null;

    // clearing refresh tokens for security
    user.refreshToken = [];

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again later.",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const body = req.body;
    const result = changePasswordSchema.safeParse(body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.errors[0]?.message || "Validation failed",
      });
    }
    
    const { currentPassword, newPassword } = result.data;

    const user = await User.findById(req.user.userId).select("+password");
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;

    // clear all refresh tokens except the current one for security
    const currentRefreshToken = req.cookies.refreshToken;
    if (currentRefreshToken) {
      user.refreshToken = user.refreshToken.filter(
        (token) => token.token === currentRefreshToken
      );
    } else {
      user.refreshToken = [];
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password. Please try again later.",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const userId = req.user?.userId;
    
    if (refreshToken && userId) {
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshToken: { token: refreshToken } },
      });
    }
    
    removeCookies(res);
    
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    removeCookies(res);
    res.status(500).json({
      success: false,
      message: "Failed to logout. Please try again later.",
    });
  }
};