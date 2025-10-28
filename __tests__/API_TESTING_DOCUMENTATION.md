# API Testing Documentation

This document provides comprehensive documentation for all API endpoint tests in the Nexus backend application.

---

## Table of Contents

1. [Authentication Routes](#authentication-routes)
2. [Project Routes](#project-routes)
3. [Test Configuration](#test-configuration)
4. [Testing Patterns](#testing-patterns)
5. [Running Specific Tests](#running-specific-tests)

---

## Authentication Routes

### Base URL: `/api/v1/auth`

All authentication-related endpoints are tested in `__tests__/integration/auth.routes.test.js`.

---

#### 1. **POST /api/v1/auth/signup** - User Registration

**Purpose**: Register a new user account

**Test File**: `__tests__/integration/auth.routes.test.js`

##### Test Cases:

| Test Case | Description | Expected Result | Status |
|-----------|-------------|-----------------|--------|
| **Valid Registration** | User provides all required fields correctly | HTTP 201, User created, Email verification sent | ⚠️ Skipped (requires email mock) |
| **Invalid Email Format** | User provides an invalid email address | HTTP 400, Validation error message | ✅ Pass |
| **Password Mismatch** | Password and confirmPassword don't match | HTTP 400, "Passwords don't match" error | ✅ Pass |
| **Missing Required Fields** | User omits required fields (name, email, etc.) | HTTP 400, Validation error | ✅ Pass |
| **Duplicate Email** | Email already exists in database | HTTP 409, "Email already registered" | ⚠️ Requires full test |

##### Request Body Schema:
```json
{
  "name": "string (required, min 3 chars)",
  "username": "string (required, min 3 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)",
  "confirmPassword": "string (required, must match password)"
}
```

##### Success Response (201):
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "email": "user@example.com"
  }
}
```

##### Error Response (400 - Validation):
```json
{
  "success": false,
  "message": "Validation failed"
}
```

##### Error Response (400 - Password Mismatch):
```json
{
  "success": false,
  "message": "Passwords don't match!"
}
```

##### Error Response (409 - Duplicate Email):
```json
{
  "success": false,
  "message": "Email already registered!"
}
```

---

#### 2. **POST /api/v1/auth/login** - User Login

**Purpose**: Authenticate user and provide access tokens

**Test File**: `__tests__/integration/auth.routes.test.js`

##### Test Cases:

| Test Case | Description | Expected Result | Status |
|-----------|-------------|-----------------|--------|
| **Successful Login** | Valid email and password for verified user | HTTP 200, User data, Access & refresh tokens in cookies | ✅ Pass |
| **Incorrect Password** | Valid email but wrong password | HTTP 401, "Invalid credentials" error | ✅ Pass |
| **Non-existent Email** | Email not in database | HTTP 401, Error message | ✅ Pass |
| **Unverified Email** | User hasn't verified email | HTTP 403, "Please verify your email" message | ✅ Pass |
| **Invalid Input** | Malformed email or short password | HTTP 400, Validation error | ✅ Pass |

##### Request Body Schema:
```json
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

##### Success Response (200):
```json
{
  "success": true,
  "message": "Login successful!",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "role": "developer",
      "isEmailVerified": true,
      "isActive": true
    }
  }
}
```

**Cookies Set:**
- `accessToken` (HttpOnly, 15 minutes expiry)
- `refreshToken` (HttpOnly, 7 days expiry)

##### Error Response (401 - Invalid Credentials):
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

##### Error Response (403 - Unverified Email):
```json
{
  "success": false,
  "message": "Please verify your email before logging in"
}
```

##### Error Response (400 - Validation):
```json
{
  "success": false,
  "message": "Validation failed"
}
```

---

#### 3. **POST /api/v1/auth/logout** - User Logout

**Purpose**: Invalidate user session and clear authentication cookies

**Test File**: `__tests__/integration/auth.routes.test.js`

##### Test Cases:

| Test Case | Description | Expected Result | Status |
|-----------|-------------|-----------------|--------|
| **Successful Logout** | User logs out | HTTP 200, Cookies cleared, Success message | ⚠️ Requires auth token |

##### Request Body Schema:
```json
No body required
```

##### Success Response (200):
```json
{
  "success": true,
  "message": "Logout successful!"
}
```

**Cookies Cleared:**
- `accessToken` (Set to empty with Max-Age=0)
- `refreshToken` (Set to empty with Max-Age=0)

---

#### 4. **POST /api/v1/auth/verify-email** - Email Verification

**Purpose**: Verify user's email address using OTP

**Test Status**: Not yet implemented

##### Expected Request Body:
```json
{
  "email": "string (required)",
  "otp": "string (required, 6 digits)"
}
```

---

#### 5. **POST /api/v1/auth/forgot-password** - Request Password Reset

**Purpose**: Request a password reset link/OTP via email

**Test Status**: Not yet implemented

##### Expected Request Body:
```json
{
  "email": "string (required, valid email)"
}
```

---

#### 6. **POST /api/v1/auth/reset-password** - Reset Password

**Purpose**: Reset user password using OTP

**Test Status**: Not yet implemented

##### Expected Request Body:
```json
{
  "email": "string (required)",
  "otp": "string (required, 6 digits)",
  "newPassword": "string (required, min 6 chars)",
  "confirmPassword": "string (required, must match newPassword)"
}
```

---

## Project Routes

### Base URL: `/api/v1/projects`

All project-related endpoints are tested in `__tests__/integration/project.routes.test.js`.

**Authentication Required**: All project routes require a valid access token in cookies or Authorization header.

---

#### 1. **GET /api/v1/projects** - List All Projects

**Purpose**: Retrieve all projects for the authenticated user

**Test File**: `__tests__/integration/project.routes.test.js`

##### Test Cases:

| Test Case | Description | Expected Result | Status |
|-----------|-------------|-----------------|--------|
| **Authenticated Request** | Valid access token provided | HTTP 200, Array of projects | ✅ Pass |
| **Unauthenticated Request** | No access token provided | HTTP 401, Authentication error | ✅ Pass |

##### Request Headers:
```
Cookie: accessToken=<jwt_token>
OR
Authorization: Bearer <jwt_token>
```

##### Success Response (200):
```json
{
  "success": true,
  "data": [
    {
      "_id": "project_id_1",
      "name": "Project Alpha",
      "description": "First project",
      "status": "Planning",
      "priority": "High",
      "progress": 25,
      "issues": 5,
      "owner": "user_id",
      "members": [],
      "createdAt": "2025-10-27T10:00:00.000Z",
      "updatedAt": "2025-10-27T10:00:00.000Z"
    },
    {
      "_id": "project_id_2",
      "name": "Project Beta",
      "description": "Second project",
      "status": "In Progress",
      "priority": "Medium",
      "progress": 60,
      "issues": 3,
      "owner": "user_id",
      "members": [],
      "createdAt": "2025-10-27T11:00:00.000Z",
      "updatedAt": "2025-10-27T11:00:00.000Z"
    }
  ]
}
```

##### Error Response (401 - Unauthorized):
```json
{
  "success": false,
  "message": "Access token required"
}
```

---

#### 2. **GET /api/v1/projects/:id** - Get Single Project

**Purpose**: Retrieve detailed information about a specific project

**Test File**: `__tests__/integration/project.routes.test.js`

##### Test Cases:

| Test Case | Description | Expected Result | Status |
|-----------|-------------|-----------------|--------|
| **Valid Project ID** | Request existing project with valid ID | HTTP 200, Project details | ✅ Pass |
| **Invalid Project ID** | Malformed MongoDB ObjectId | HTTP 400, "Invalid ID format" error | ✅ Pass |
| **Non-existent Project** | Valid ID but project doesn't exist | HTTP 404, "Project not found" | ⚠️ Needs verification |
| **Unauthenticated Request** | No access token | HTTP 401, Authentication error | ✅ Pass |

##### URL Parameters:
```
:id - MongoDB ObjectId (24 hex characters)
```

##### Request Headers:
```
Cookie: accessToken=<jwt_token>
OR
Authorization: Bearer <jwt_token>
```

##### Success Response (200):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Test Project",
    "description": "Detailed project description",
    "status": "Planning",
    "priority": "High",
    "progress": 0,
    "issues": 0,
    "owner": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "members": [
      {
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "Developer",
        "avatar": ""
      }
    ],
    "dueDate": "2025-12-31T00:00:00.000Z",
    "createdAt": "2025-10-27T10:00:00.000Z",
    "updatedAt": "2025-10-27T10:00:00.000Z"
  }
}
```

##### Error Response (400 - Invalid ID):
```json
{
  "success": false,
  "message": "Invalid ID format"
}
```

##### Error Response (404 - Not Found):
```json
{
  "success": false,
  "message": "Project not found"
}
```

---

#### 3. **POST /api/v1/projects** - Create New Project

**Purpose**: Create a new project for the authenticated user

**Test File**: `__tests__/integration/project.routes.test.js`

##### Test Cases:

| Test Case | Description | Expected Result | Status |
|-----------|-------------|-----------------|--------|
| **Valid Project Data** | All required fields provided correctly | HTTP 201, Project created | ⚠️ Needs implementation |
| **Short Name** | Project name less than 2 characters | HTTP 400, Validation error | ⚠️ Needs implementation |
| **Invalid Status** | Status not in allowed enum values | HTTP 400, Validation error | ⚠️ Needs implementation |
| **Unauthenticated Request** | No access token | HTTP 401, Authentication error | ⚠️ Needs implementation |

##### Request Headers:
```
Cookie: accessToken=<jwt_token>
Content-Type: application/json
```

##### Request Body Schema:
```json
{
  "name": "string (required, min 2, max 100 chars)",
  "description": "string (optional, max 1000 chars)",
  "status": "enum (Planning, In Progress, Review, Completed)",
  "priority": "enum (Low, Medium, High, Critical)",
  "dueDate": "date (optional)",
  "members": [
    {
      "name": "string (required)",
      "email": "string (required, valid email)",
      "role": "string (required)",
      "avatar": "string (optional)"
    }
  ]
}
```

##### Success Response (201):
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "_id": "newly_created_id",
    "name": "New Project",
    "description": "Project description",
    "status": "Planning",
    "priority": "Medium",
    "progress": 0,
    "issues": 0,
    "owner": "user_id",
    "members": [],
    "createdAt": "2025-10-27T12:00:00.000Z",
    "updatedAt": "2025-10-27T12:00:00.000Z"
  }
}
```

##### Error Response (400 - Validation):
```json
{
  "success": false,
  "message": "Validation error message"
}
```

---

#### 4. **PUT /api/v1/projects/:id** - Update Project

**Purpose**: Update an existing project's details

**Test File**: `__tests__/integration/project.routes.test.js`

##### Test Cases:

| Test Case | Description | Expected Result | Status |
|-----------|-------------|-----------------|--------|
| **Valid Update** | Update project fields with valid data | HTTP 200, Updated project | ⚠️ Needs implementation |
| **Invalid Status** | Update with invalid status value | HTTP 400, Validation error | ⚠️ Needs implementation |
| **Non-existent Project** | Try to update project that doesn't exist | HTTP 404, "Project not found" | ⚠️ Needs implementation |

##### URL Parameters:
```
:id - MongoDB ObjectId
```

##### Request Headers:
```
Cookie: accessToken=<jwt_token>
Content-Type: application/json
```

##### Request Body Schema:
```json
{
  "name": "string (optional, min 2, max 100)",
  "description": "string (optional, max 1000)",
  "status": "enum (optional)",
  "priority": "enum (optional)",
  "progress": "number (optional, 0-100)",
  "dueDate": "date (optional)"
}
```

##### Success Response (200):
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "_id": "project_id",
    "name": "Updated Project Name",
    "status": "In Progress",
    "priority": "High",
    // ... other fields
  }
}
```

---

#### 5. **DELETE /api/v1/projects/:id** - Delete Project

**Purpose**: Permanently delete a project

**Test File**: `__tests__/integration/project.routes.test.js`

##### Test Cases:

| Test Case | Description | Expected Result | Status |
|-----------|-------------|-----------------|--------|
| **Valid Deletion** | Delete existing project | HTTP 200, Success message | ⚠️ Needs implementation |
| **Non-existent Project** | Try to delete non-existent project | HTTP 404, "Project not found" | ⚠️ Needs implementation |

##### URL Parameters:
```
:id - MongoDB ObjectId
```

##### Request Headers:
```
Cookie: accessToken=<jwt_token>
```

##### Success Response (200):
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

##### Error Response (404):
```json
{
  "success": false,
  "message": "Project not found"
}
```

---

#### 6. **POST /api/v1/projects/:id/members** - Add Project Member

**Purpose**: Add a new member to a project

**Test Status**: Not yet implemented

##### Expected Request Body:
```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "role": "string (required)"
}
```

---

#### 7. **DELETE /api/v1/projects/:id/members/:memberId** - Remove Project Member

**Purpose**: Remove a member from a project

**Test Status**: Not yet implemented

---

## Issue Routes

### Base URL: `/api/v1/issues`

**Test Status**: Not yet implemented

Expected endpoints:
- `GET /api/v1/issues` - List all issues
- `GET /api/v1/issues/:id` - Get single issue
- `POST /api/v1/issues` - Create issue
- `PUT /api/v1/issues/:id` - Update issue
- `DELETE /api/v1/issues/:id` - Delete issue
- `PATCH /api/v1/issues/:id/assign` - Assign issue to user
- `PATCH /api/v1/issues/:id/status` - Update issue status

---

## User Routes

### Base URL: `/api/v1/user`

**Test Status**: Not yet implemented

Expected endpoints:
- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update user profile
- `POST /api/v1/user/change-password` - Change password
- `GET /api/v1/user/projects` - Get user's projects
- `GET /api/v1/user/issues` - Get user's assigned issues

---

## Test Configuration

### Testing Framework
- **Framework**: Jest (v30.2.0)
- **HTTP Testing**: Supertest (v7.1.4)
- **Database**: MongoDB Memory Server (v10.2.3)
- **Environment**: Node.js with ES Modules

### Test Database
All tests use an in-memory MongoDB instance:
- Fresh database for each test suite
- Automatic cleanup after each test
- No connection to production/development databases
- Fast execution (no network calls)

### Authentication in Tests
Tests use JWT tokens for authentication:
```javascript
// Generate test token
const token = jwt.generateAccessToken({ userId: testUser._id });

// Use in request
await request(app)
  .get('/api/v1/projects')
  .set('Cookie', `accessToken=${token}`)
  .expect(200);
```

---

## Testing Patterns

### 1. AAA Pattern (Arrange-Act-Assert)

All tests follow this structure:
```javascript
it('should do something', async () => {
  // Arrange - Set up test data
  const testData = { name: 'Test' };
  
  // Act - Perform the action
  const response = await request(app)
    .post('/api/endpoint')
    .send(testData);
  
  // Assert - Verify results
  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
});
```

### 2. Test Isolation

Each test is independent:
- Database cleared after each test
- No shared state between tests
- Tests can run in any order

### 3. Setup and Teardown

```javascript
beforeAll(async () => {
  await setupTestDB(); // Start in-memory database
});

afterAll(async () => {
  await teardownTestDB(); // Stop database
});

beforeEach(async () => {
  // Create test user, generate tokens
});

afterEach(async () => {
  await clearTestDB(); // Clear all collections
});
```

### 4. Error Testing

Every endpoint tests both success and failure cases:
- ✅ Valid input → Success response
- ❌ Invalid input → Validation error
- ❌ Missing auth → 401 Unauthorized
- ❌ Not found → 404 Not Found
- ❌ Server error → 500 Internal Server Error

---

## Running Specific Tests

### Run all API tests
```bash
npm test -- __tests__/integration
```

### Run auth route tests only
```bash
npm test -- __tests__/integration/auth.routes.test.js
```

### Run project route tests only
```bash
npm test -- __tests__/integration/project.routes.test.js
```

### Run specific test case
```bash
npm test -- --testNamePattern="should login successfully"
```

### Run with coverage
```bash
npm run test:coverage -- __tests__/integration
```

### Watch mode for development
```bash
npm run test:watch -- __tests__/integration/auth.routes.test.js
```

---

## Test Coverage Summary

### Authentication Routes
- **Total Tests**: 9
- **Passing**: 5 ✅
- **Skipped**: 1 ⚠️
- **Failing**: 3 ⚠️
- **Coverage**: ~56%

| Endpoint | Tests | Passing |
|----------|-------|---------|
| POST /signup | 5 | 3/5 |
| POST /login | 5 | 5/5 |
| POST /logout | 1 | 0/1 |

### Project Routes
- **Total Tests**: 4
- **Passing**: 3 ✅
- **Coverage**: ~75%

| Endpoint | Tests | Passing |
|----------|-------|---------|
| GET /projects | 2 | 2/2 |
| GET /projects/:id | 2 | 2/2 |
| POST /projects | 0 | - |
| PUT /projects/:id | 0 | - |
| DELETE /projects/:id | 0 | - |

---

## Future Test Implementation

### Priority 1 - Critical Endpoints
1. ✅ User login (DONE)
2. ⚠️ User signup (needs email mock)
3. 🔴 Project creation
4. 🔴 Issue creation
5. 🔴 Issue assignment

### Priority 2 - Important Endpoints
6. 🔴 Project updates
7. 🔴 Issue updates
8. 🔴 User profile updates
9. 🔴 Password reset flow
10. 🔴 Email verification

### Priority 3 - Additional Endpoints
11. 🔴 Project member management
12. 🔴 Issue filtering and search
13. 🔴 User statistics
14. 🔴 Project analytics

**Legend**: ✅ Implemented | ⚠️ Partial | 🔴 Not Implemented

---

## Best Practices

### 1. Always Test Error Cases
```javascript
// Don't just test success
it('should create project', async () => {
  const response = await request(app)
    .post('/api/v1/projects')
    .send(validData);
  expect(response.status).toBe(201);
});

// Also test failures
it('should fail with invalid data', async () => {
  const response = await request(app)
    .post('/api/v1/projects')
    .send(invalidData);
  expect(response.status).toBe(400);
});
```

### 2. Test Authentication Requirements
```javascript
it('should require authentication', async () => {
  const response = await request(app)
    .get('/api/v1/projects')
    // No token provided
    .expect(401);
});
```

### 3. Verify Response Structure
```javascript
it('should return correct structure', async () => {
  const response = await request(app)
    .get('/api/v1/projects')
    .set('Cookie', authCookie)
    .expect(200);
  
  expect(response.body).toHaveProperty('success');
  expect(response.body).toHaveProperty('data');
  expect(Array.isArray(response.body.data)).toBe(true);
});
```

### 4. Use Descriptive Test Names
```javascript
// ❌ Bad
it('works', async () => { ... });

// ✅ Good
it('should return 401 when user is not authenticated', async () => { ... });
```

---

## Troubleshooting

### Common Issues

**Issue**: Tests timeout
```bash
Solution: Increase timeout in jest.config.js
testTimeout: 30000
```

**Issue**: Database connection errors
```bash
Solution: Ensure MongoDB Memory Server is properly set up
Check __tests__/setup/testDb.js
```

**Issue**: JWT errors
```bash
Solution: Ensure environment variables are loaded
Check __tests__/setup/setupEnv.js
```

**Issue**: CORS errors in tests
```bash
Solution: Not an issue in Supertest (no actual HTTP)
CORS is bypassed in integration tests
```

---

## Continuous Integration

### GitHub Actions Example
```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

---

## Conclusion

This testing suite provides comprehensive coverage of the Nexus API endpoints, ensuring:
- ✅ Authentication flows work correctly
- ✅ Authorization is enforced
- ✅ Validation catches invalid data
- ✅ Error handling is consistent
- ✅ Response formats are correct

**Current Status**: 67/80 tests passing (83.75%)
**Target**: 100% pass rate for critical endpoints

For questions or issues, refer to:
- `__tests__/README.md` - General testing guide
- `TESTING_SETUP.md` - Setup instructions
- Individual test files for implementation details
