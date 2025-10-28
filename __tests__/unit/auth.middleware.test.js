import { protectRoute } from '../../middleware/auth.js';
import * as jwt from '../../utils/jwt.js';
import { User } from '../../models/index.js';
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup/testDb.js';

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = vi.fn ? vi.fn().mockReturnValue(res) : function(code) { this.statusCode = code; return this; };
  res.json = vi.fn ? vi.fn().mockReturnValue(res) : function(data) { this.body = data; return this; };
  return res;
};

// Mock next function  
let mockNextCalls = 0;
const mockNext = () => { mockNextCalls++; };
const resetMockNext = () => { mockNextCalls = 0; };

describe('Auth Middleware Unit Tests', () => {
  let testUser;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password@123',
      isEmailVerified: true,
    });

    // Clear mock function calls
    resetMockNext();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe('protectRoute middleware', () => {
    it('should authenticate user with valid token in cookies', async () => {
      const token = jwt.generateAccessToken({ userId: testUser._id });
      const req = {
        cookies: {
          accessToken: token,
        },
        headers: {},
      };
      const res = mockResponse();
      const initialCalls = mockNextCalls;

      await protectRoute(req, res, mockNext);

      expect(mockNextCalls).toBe(initialCalls + 1);
      expect(req.user).toBeDefined();
      expect(req.user._id.toString()).toBe(testUser._id.toString());
    });

    it('should authenticate user with valid token in Authorization header', async () => {
      const token = jwt.generateAccessToken({ userId: testUser._id });
      const req = {
        cookies: {},
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = mockResponse();
      const initialCalls = mockNextCalls;

      await protectRoute(req, res, mockNext);

      expect(mockNextCalls).toBe(initialCalls + 1);
      expect(req.user).toBeDefined();
      expect(req.user._id.toString()).toBe(testUser._id.toString());
    });

    it('should reject request with no token', async () => {
      const req = {
        cookies: {},
        headers: {},
      };
      const res = mockResponse();
      const initialCalls = mockNextCalls;

      await protectRoute(req, res, mockNext);

      expect(mockNextCalls).toBe(initialCalls);
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access token required');
    });

    it('should reject request with invalid token', async () => {
      const req = {
        cookies: {
          accessToken: 'invalid.token.here',
        },
        headers: {},
      };
      const res = mockResponse();
      const initialCalls = mockNextCalls;

      await protectRoute(req, res, mockNext);

      expect(mockNextCalls).toBe(initialCalls);
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid token');
    });

    it('should reject request with token for non-existent user', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';
      const token = jwt.generateAccessToken({ userId: fakeUserId });
      
      const req = {
        cookies: {
          accessToken: token,
        },
        headers: {},
      };
      const res = mockResponse();
      const initialCalls = mockNextCalls;

      await protectRoute(req, res, mockNext);

      expect(mockNextCalls).toBe(initialCalls);
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('User not found');
    });

    it('should reject request for unverified email', async () => {
      // Create unverified user
      const unverifiedUser = await User.create({
        name: 'Unverified User',
        username: 'unverified',
        email: 'unverified@example.com',
        password: 'Password@123',
        isEmailVerified: false,
      });

      const token = jwt.generateAccessToken({ userId: unverifiedUser._id });
      
      const req = {
        cookies: {
          accessToken: token,
        },
        headers: {},
      };
      const res = mockResponse();
      const initialCalls = mockNextCalls;

      await protectRoute(req, res, mockNext);

      expect(mockNextCalls).toBe(initialCalls);
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Email not verified');
    });

    it('should prefer cookie token over header token', async () => {
      const cookieToken = jwt.generateAccessToken({ userId: testUser._id });
      const headerToken = jwt.generateAccessToken({ userId: testUser._id });
      
      const req = {
        cookies: {
          accessToken: cookieToken,
        },
        headers: {
          authorization: `Bearer ${headerToken}`,
        },
      };
      const res = mockResponse();
      const initialCalls = mockNextCalls;

      await protectRoute(req, res, mockNext);

      expect(mockNextCalls).toBe(initialCalls + 1);
      expect(req.user).toBeDefined();
    });
  });
});
