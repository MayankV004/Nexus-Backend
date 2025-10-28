# Nexus Backend Testing Documentation

This directory contains comprehensive unit and integration tests for the Nexus backend API.

## Test Structure

```
__tests__/
├── setup/              # Test setup and configuration
│   └── testDb.js      # MongoDB in-memory database setup
├── helpers/           # Test helper functions
│   └── testHelpers.js # Utility functions for tests
├── unit/              # Unit tests
│   ├── user.model.test.js
│   ├── project.model.test.js
│   ├── jwt.utils.test.js
│   ├── otp.utils.test.js
│   └── auth.middleware.test.js
└── integration/       # Integration tests
    ├── auth.routes.test.js
    └── project.routes.test.js
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- __tests__/unit/user.model.test.js
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="User Creation"
```

## Test Types

### Unit Tests
Unit tests focus on testing individual components in isolation:
- **Models**: Testing schema validation, methods, and hooks
- **Utils**: Testing utility functions like JWT and OTP generation
- **Middleware**: Testing authentication and authorization logic

### Integration Tests
Integration tests verify that different parts of the application work together:
- **Routes**: Testing API endpoints end-to-end
- **Controllers**: Testing request/response handling
- **Database**: Testing actual database operations

## Test Database

Tests use MongoDB Memory Server, which provides an in-memory MongoDB instance:
- No need for a real MongoDB connection
- Each test suite gets a fresh database
- Tests are isolated and don't affect production data
- Fast test execution

## Writing New Tests

### Basic Test Structure

```javascript
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup/testDb.js';

describe('Feature Name', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  it('should do something', async () => {
    // Arrange
    const testData = { /* ... */ };

    // Act
    const result = await someFunction(testData);

    // Assert
    expect(result).toBeDefined();
  });
});
```

### Integration Test with Authentication

```javascript
import request from 'supertest';
import * as jwt from '../../utils/jwt.js';

const token = jwt.generateAccessToken(userId);

const response = await request(app)
  .get('/api/v1/protected-route')
  .set('Cookie', `accessToken=${token}`)
  .expect(200);
```

## Mocking

### Email Service
Email services are mocked to avoid sending real emails during tests:

```javascript
jest.mock('../../services/emailService.js', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));
```

## Coverage

Coverage reports show which parts of the code are tested:
- **Statements**: Individual statements executed
- **Branches**: If/else branches tested
- **Functions**: Functions called
- **Lines**: Lines of code executed

Aim for:
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clear Descriptions**: Use descriptive test names
3. **AAA Pattern**: Arrange, Act, Assert
4. **Clean Up**: Always clean up test data
5. **Mock External Services**: Don't make real API calls or send emails
6. **Test Edge Cases**: Include error scenarios and boundary conditions
7. **Keep Tests Fast**: Unit tests should run in milliseconds

## Common Test Scenarios

### Testing Success Cases
```javascript
it('should create user successfully', async () => {
  const user = await User.create(validUserData);
  expect(user).toBeDefined();
  expect(user.email).toBe(validUserData.email);
});
```

### Testing Validation Errors
```javascript
it('should fail with invalid email', async () => {
  await expect(User.create(invalidData)).rejects.toThrow();
});
```

### Testing API Endpoints
```javascript
it('should return 401 without authentication', async () => {
  const response = await request(app)
    .get('/api/v1/protected')
    .expect(401);
  
  expect(response.body.success).toBe(false);
});
```

## Troubleshooting

### Tests Hanging
- Ensure all async operations complete
- Use `--detectOpenHandles` flag
- Check for unclosed database connections

### Tests Failing Intermittently
- Check for test isolation issues
- Ensure proper cleanup in afterEach
- Check for race conditions with async code

### Coverage Not Updating
- Delete `coverage/` directory
- Run `npm run test:coverage` again

## CI/CD Integration

Tests are designed to run in CI/CD pipelines:
- No external dependencies required
- Fast execution time
- Clear pass/fail indicators
- Coverage reports for tracking

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
