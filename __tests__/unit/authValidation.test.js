import {
  signUpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../../validation/authValidation.js';

describe('Auth Validation Schemas Unit Tests', () => {
  describe('signUpSchema', () => {
    it('should validate correct signup data', () => {
      const validData = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'invalid-email',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('email');
      }
    });

    it('should fail with short password', () => {
      const invalidData = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: '12345',
        confirmPassword: '12345',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('password');
      }
    });

    it('should fail with missing required fields', () => {
      const invalidData = {
        email: 'john@example.com',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'john@example.com',
        password: 'Password@123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'Password@123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail with missing password', () => {
      const invalidData = {
        email: 'john@example.com',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate correct email', () => {
      const validData = {
        email: 'john@example.com',
      };

      const result = forgotPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
      };

      const result = forgotPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail with missing email', () => {
      const invalidData = {};

      const result = forgotPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      const result = signUpSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should handle undefined values', () => {
      const result = loginSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('should handle empty objects', () => {
      const result = signUpSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should handle extra fields gracefully', () => {
      const dataWithExtra = {
        email: 'john@example.com',
        password: 'Password@123',
        extraField: 'should be ignored',
      };

      const result = loginSchema.safeParse(dataWithExtra);
      // Depending on schema settings, extra fields might be stripped
      expect(result.success).toBe(true);
    });
  });
});
