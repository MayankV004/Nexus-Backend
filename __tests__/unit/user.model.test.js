import { User } from '../../models/index.js';
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup/testDb.js';

describe('User Model Unit Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe('User Creation', () => {
    it('should create a valid user', async () => {
      const userData = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'developer',
      };

      const user = await User.create(userData);

      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.username).toBe(userData.username);
      expect(user.role).toBe(userData.role);
      expect(user.isEmailVerified).toBe(false);
      expect(user.isActive).toBe(true);
      expect(user._id).toBeDefined();
    });

    it('should hash password before saving', async () => {
      const userData = {
        name: 'Jane Doe',
        username: 'janedoe',
        email: 'jane@example.com',
        password: 'Password123',
        role: 'developer',
      };

      const user = await User.create(userData);
      
      // Password should be hashed and not equal to original
      expect(user.password).not.toBe(userData.password);
      expect(user.password).toBeDefined();
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hashes are long
    });

    it('should fail without required fields', async () => {
      const userData = {
        email: 'test@example.com',
        // Missing name, username, password
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should not allow duplicate emails', async () => {
      const userData = {
        name: 'User One',
        username: 'userone',
        email: 'duplicate@example.com',
        password: 'Password123',
        role: 'developer',
      };

      await User.create(userData);

      const duplicateUser = {
        name: 'User Two',
        username: 'usertwo',
        email: 'duplicate@example.com',
        password: 'Password123',
        role: 'developer',
      };

      await expect(User.create(duplicateUser)).rejects.toThrow();
    });

    it('should set default values correctly', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'testdefaults@example.com',
        password: 'Password123',
      };

      const user = await User.create(userData);

      expect(user.role).toBe('developer'); // default role
      expect(user.isEmailVerified).toBe(false);
      expect(user.isActive).toBe(true);
      expect(user.avatar).toBe('');
    });
  });

  describe('User Methods', () => {
    it('should verify correct password', async () => {
      const password = 'Password123';
      const user = await User.create({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password,
        role: 'developer',
      });

      // Fetch user with password field (it's excluded by default)
      const userWithPassword = await User.findById(user._id).select('+password');
      const isMatch = await userWithPassword.comparePassword(password);
      
      expect(isMatch).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const user = await User.create({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        role: 'developer',
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      const isMatch = await userWithPassword.comparePassword('WrongPassword');
      
      expect(isMatch).toBe(false);
    });
  });

  describe('User Validation', () => {
    it('should require name to be at least 3 characters', async () => {
      const userData = {
        name: 'AB', // Too short
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require password to be at least 6 characters', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: '12345', // Too short
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should only allow valid roles', async () => {
      const userData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        role: 'invalid_role',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });
});
