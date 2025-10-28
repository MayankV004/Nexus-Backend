import request from 'supertest';
import express from 'express';
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup/testDb.js';
import { User, Project } from '../../models/index.js';
import projectRoutes from '../../routes/project-routes.js';
import cookieParser from 'cookie-parser';
import * as jwt from '../../utils/jwt.js';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/projects', projectRoutes);

describe('Project Routes Integration Tests', () => {
  let testUser;
  let authToken;
  let authCookie;

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
      role: 'project_manager',
      isEmailVerified: true,
    });

    // Generate auth token
    authToken = jwt.generateAccessToken({ userId: testUser._id });
    authCookie = `accessToken=${authToken}`;
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe('GET /api/v1/projects', () => {
    beforeEach(async () => {
      // Create some test projects
      await Project.create([
        {
          name: 'Project 1',
          description: 'First project',
          owner: testUser._id,
          status: 'Planning',
        },
        {
          name: 'Project 2',
          description: 'Second project',
          owner: testUser._id,
          status: 'In Progress',
        },
      ]);
    });

    it('should get all projects for authenticated user', async () => {
      const response = await request(app)
        .get('/api/v1/projects')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/projects')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    let testProject;

    beforeEach(async () => {
      testProject = await Project.create({
        name: 'Test Project',
        description: 'Test description',
        owner: testUser._id,
        status: 'Planning',
      });
    });

    it('should get a specific project by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/projects/${testProject._id}`)
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testProject._id.toString());
      expect(response.body.data.name).toBe(testProject.name);
    });

    it('should fail with invalid project ID', async () => {
      const response = await request(app)
        .get('/api/v1/projects/invalid-id')
        .set('Cookie', authCookie)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
