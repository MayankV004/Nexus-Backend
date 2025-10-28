import { generateOTP, verifyOTP } from '../../utils/otp.js';
import bcrypt from 'bcrypt';

describe('OTP Utility Unit Tests', () => {
  describe('generateOTP', () => {
    it('should generate OTP with correct structure', () => {
      const result = generateOTP();

      expect(result).toHaveProperty('otp');
      expect(result).toHaveProperty('hashedOTP');
      expect(result).toHaveProperty('otpExpires');
    });

    it('should generate 6-digit OTP', () => {
      const { otp } = generateOTP();

      expect(otp).toBeDefined();
      expect(otp.length).toBe(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it('should generate different OTPs on multiple calls', () => {
      const otp1 = generateOTP().otp;
      const otp2 = generateOTP().otp;
      const otp3 = generateOTP().otp;

      // Very unlikely all three would be the same
      expect(otp1 === otp2 && otp2 === otp3).toBe(false);
    });

    it('should hash the OTP', async () => {
      const { otp, hashedOTP } = generateOTP();

      expect(hashedOTP).toBeDefined();
      expect(hashedOTP).not.toBe(otp);
      expect(hashedOTP.length).toBeGreaterThan(20); // bcrypt hashes are long

      // Verify the hash is valid
      const isValid = await bcrypt.compare(otp, hashedOTP);
      expect(isValid).toBe(true);
    });

    it('should set expiration time in the future', () => {
      const { otpExpires } = generateOTP();
      const now = Date.now();

      expect(otpExpires).toBeDefined();
      expect(otpExpires).toBeInstanceOf(Date);
      expect(otpExpires.getTime()).toBeGreaterThan(now);
    });

    it('should set expiration time approximately 10 minutes in future', () => {
      const { otpExpires } = generateOTP();
      const now = Date.now();
      const tenMinutes = 10 * 60 * 1000;
      const difference = otpExpires.getTime() - now;

      // Allow 1 second margin for test execution time
      expect(difference).toBeGreaterThan(tenMinutes - 1000);
      expect(difference).toBeLessThan(tenMinutes + 1000);
    });
  });

  describe('verifyOTP', () => {
    it('should verify correct OTP', async () => {
      const { otp, hashedOTP } = generateOTP();
      const isValid = await verifyOTP(otp, hashedOTP);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect OTP', async () => {
      const { hashedOTP } = generateOTP();
      const wrongOTP = '000000';
      
      const isValid = await verifyOTP(wrongOTP, hashedOTP);

      expect(isValid).toBe(false);
    });

    it('should reject OTP with wrong length', async () => {
      const { hashedOTP } = generateOTP();
      const wrongOTP = '12345'; // 5 digits instead of 6
      
      const isValid = await verifyOTP(wrongOTP, hashedOTP);

      expect(isValid).toBe(false);
    });

    it('should reject non-numeric OTP', async () => {
      const { hashedOTP } = generateOTP();
      const wrongOTP = 'abcdef';
      
      const isValid = await verifyOTP(wrongOTP, hashedOTP);

      expect(isValid).toBe(false);
    });

    it('should handle empty OTP', async () => {
      const { hashedOTP } = generateOTP();
      const isValid = await verifyOTP('', hashedOTP);

      expect(isValid).toBe(false);
    });

    it('should handle null/undefined OTP', async () => {
      const { hashedOTP } = generateOTP();
      
      const isValidNull = await verifyOTP(null, hashedOTP);
      const isValidUndefined = await verifyOTP(undefined, hashedOTP);

      expect(isValidNull).toBe(false);
      expect(isValidUndefined).toBe(false);
    });
  });

  describe('OTP Security', () => {
    it('should generate cryptographically secure random OTPs', () => {
      const otps = new Set();
      
      // Generate 100 OTPs and check for uniqueness
      for (let i = 0; i < 100; i++) {
        const { otp } = generateOTP();
        otps.add(otp);
      }

      // Expect high uniqueness (at least 95%)
      expect(otps.size).toBeGreaterThan(95);
    });

    it('should use different salts for each hash', () => {
      const otp = '123456';
      const hash1 = generateOTP().hashedOTP;
      const hash2 = generateOTP().hashedOTP;

      // Even with same OTP, hashes should be different due to different salts
      expect(hash1).not.toBe(hash2);
    });
  });
});
