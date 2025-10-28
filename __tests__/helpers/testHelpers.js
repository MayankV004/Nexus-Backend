import jwt from 'jsonwebtoken';

export const createTestUser = (overrides = {}) => {
  return {
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    password: 'Test@123456',
    confirmPassword: 'Test@123456',
    role: 'developer',
    ...overrides,
  };
};

export const createTestProject = (userId, overrides = {}) => {
  return {
    name: 'Test Project',
    description: 'This is a test project',
    status: 'Planning',
    priority: 'Medium',
    owner: userId,
    members: [],
    ...overrides,
  };
};

export const createTestIssue = (projectId, userId, overrides = {}) => {
  return {
    title: 'Test Issue',
    description: 'This is a test issue',
    status: 'To Do',
    priority: 'Medium',
    project: projectId,
    reporter: userId,
    ...overrides,
  };
};

export const generateTestToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
};

export const mockEmailService = () => {
  return {
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  };
};
