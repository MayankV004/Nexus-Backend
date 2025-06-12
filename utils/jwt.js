import jwt from 'jsonwebtoken';
import crypto from 'crypto';

//Token Generation
export const generateAccessToken = (data)=>{
    return jwt.sign(data , process.env.JWT_SECRET,{
        expiresIn:'15m',
    });
};
export const generateRefreshToken = (data)=>{
    return jwt.sign(data , process.env.JWT_REFRESH_SECRET,{
        expiresIn:'7d',
    });
};

export const generatePasswordResetToken = (data) => {
  return jwt.sign(data, process.env.PASSWORD_RESET_SECRET, {
    expiresIn: '1h'
  });
};

//Token Veification
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

export const verifyPasswordResetToken = (token) => {
  return jwt.verify(token, process.env.PASSWORD_RESET_SECRET);
};

export const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};