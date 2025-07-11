import { verifyAccessToken } from '../utils/jwt.js';
import {User} from '../models/index.js';

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken|| req.body.accessToken || req.headers.authorization?.split(' ')[1];
    // console.log(token)
    
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email not verified' 
      });
    }
    // console.log("Check : ", user)
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};