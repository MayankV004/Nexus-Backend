import * as jwt from '../../utils/jwt.js';
import mongoose from 'mongoose';

describe('JWT Utility Unit Tests', () => {
  const testUserId = new mongoose.Types.ObjectId();

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = jwt.generateAccessToken({ userId: testUserId });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate different tokens for different user IDs', () => {
      const userId1 = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();

      const token1 = jwt.generateAccessToken({ userId: userId1 });
      const token2 = jwt.generateAccessToken({ userId: userId2 });

      expect(token1).not.toBe(token2);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = jwt.generateRefreshToken({ userId: testUserId });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate different tokens for different user IDs', () => {
      const userId1 = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();

      const token1 = jwt.generateRefreshToken({ userId: userId1 });
      const token2 = jwt.generateRefreshToken({ userId: userId2 });

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = jwt.generateAccessToken({ userId: testUserId });
      const decoded = jwt.verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBeDefined();
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        jwt.verifyAccessToken(invalidToken);
      }).toThrow();
    });

    it('should throw error for tampered token', () => {
      const token = jwt.generateAccessToken({ userId: testUserId });
      const tamperedToken = token.slice(0, -10) + 'tampered123';

      expect(() => {
        jwt.verifyAccessToken(tamperedToken);
      }).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = jwt.generateRefreshToken({ userId: testUserId });
      const decoded = jwt.verifyRefreshToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBeDefined();
    });

    it('should throw error for invalid refresh token', () => {
      const invalidToken = 'invalid.refresh.token';

      expect(() => {
        jwt.verifyRefreshToken(invalidToken);
      }).toThrow();
    });
  });

  describe('Token payload', () => {
    it('should include userId in access token payload', () => {
      const token = jwt.generateAccessToken({ userId: testUserId });
      const decoded = jwt.verifyAccessToken(token);

      expect(decoded.userId).toBeDefined();
    });

    it('should include userId in refresh token payload', () => {
      const token = jwt.generateRefreshToken({ userId: testUserId });
      const decoded = jwt.verifyRefreshToken(token);

      expect(decoded.userId).toBeDefined();
    });
  });
});
