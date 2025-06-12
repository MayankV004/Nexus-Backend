import bcrypt from 'bcrypt';

export const generateOTP = (length = 6) => {
  // Generate random OTP
  const otp = Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');

  // Hash OTP 
  const salt = bcrypt.genSaltSync(10);
  const hashedOTP = bcrypt.hashSync(otp, salt);

  
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  return {
    otp, 
    hashedOTP, 
    otpExpires 
  };
};

export const verifyOTP = async (plainOTP, hashedOTP) => {
  try {
    return await bcrypt.compare(plainOTP, hashedOTP);
  } catch (error) {
    return false;
  }
};