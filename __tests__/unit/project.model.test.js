import { Project } from '../../models/index.js';
import { User } from '../../models/index.js';
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup/testDb.js';
import mongoose from 'mongoose';

describe('Project Model Unit Tests', () => {
  let testUser;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    // Create a test user for project ownership
    testUser = await User.create({
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      role: 'project_manager',
    });
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe('Project Creation', () => {
    it('should create a valid project', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'This is a test project',
        status: 'Planning',
        priority: 'High',
        owner: testUser._id,
      };

      const project = await Project.create(projectData);

      expect(project.name).toBe(projectData.name);
      expect(project.description).toBe(projectData.description);
      expect(project.status).toBe(projectData.status);
      expect(project.priority).toBe(projectData.priority);
      expect(project.progress).toBe(0); // default value
      expect(project.issues).toBe(0); // default value
      expect(project._id).toBeDefined();
    });

    it('should fail without required name', async () => {
      const projectData = {
        description: 'Project without name',
        owner: testUser._id,
      };

      await expect(Project.create(projectData)).rejects.toThrow();
    });

    it('should set default values correctly', async () => {
      const projectData = {
        name: 'Minimal Project',
        owner: testUser._id,
      };

      const project = await Project.create(projectData);

      expect(project.status).toBe('Planning');
      expect(project.priority).toBe('Medium');
      expect(project.progress).toBe(0);
      expect(project.issues).toBe(0);
      expect(project.description).toBe('');
    });
  });

  describe('Project Validation', () => {
    it('should require name to be at least 2 characters', async () => {
      const projectData = {
        name: 'A', // Too short
        owner: testUser._id,
      };

      await expect(Project.create(projectData)).rejects.toThrow();
    });

    it('should not allow name longer than 100 characters', async () => {
      const projectData = {
        name: 'A'.repeat(101), // Too long
        owner: testUser._id,
      };

      await expect(Project.create(projectData)).rejects.toThrow();
    });

    it('should only allow valid status values', async () => {
      const projectData = {
        name: 'Test Project',
        status: 'Invalid Status',
        owner: testUser._id,
      };

      await expect(Project.create(projectData)).rejects.toThrow();
    });

    it('should only allow valid priority values', async () => {
      const projectData = {
        name: 'Test Project',
        priority: 'Invalid Priority',
        owner: testUser._id,
      };

      await expect(Project.create(projectData)).rejects.toThrow();
    });

    it('should validate progress is between 0 and 100', async () => {
      const projectData = {
        name: 'Test Project',
        progress: 150, // Too high
        owner: testUser._id,
      };

      await expect(Project.create(projectData)).rejects.toThrow();
    });
  });

  describe('Project Members', () => {
    it('should allow adding members with valid data', async () => {
      const projectData = {
        name: 'Team Project',
        owner: testUser._id,
        members: [
          {
            name: 'John Doe',
            email: 'john@example.com',
            role: 'Developer',
          },
        ],
      };

      const project = await Project.create(projectData);

      expect(project.members).toHaveLength(1);
      expect(project.members[0].name).toBe('John Doe');
      expect(project.members[0].email).toBe('john@example.com');
    });

    it('should require valid email for members', async () => {
      const projectData = {
        name: 'Team Project',
        owner: testUser._id,
        members: [
          {
            name: 'John Doe',
            email: 'invalid-email',
            role: 'Developer',
          },
        ],
      };

      await expect(Project.create(projectData)).rejects.toThrow();
    });
  });
});
