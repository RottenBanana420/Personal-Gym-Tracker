# Testing Guide - Personal Gym Tracker

This guide explains our testing philosophy, strategies, and best practices.

## Testing Philosophy

We follow **Test-Driven Development (TDD)** principles:

1. ✅ **Write tests FIRST**, before implementation
2. ✅ **Tests are IMMUTABLE** - never modify tests to pass code
3. ✅ **Modify code to pass tests**, not the other way around
4. ✅ **High coverage thresholds** (80%+) are enforced
5. ✅ **Parallel execution** for maximum speed
6. ✅ **Strict type checking** catches errors early

## Testing Framework: Vitest

We use **Vitest** for both backend and frontend testing because:

- ⚡ **100x faster** incremental builds than Jest
- 🔄 **Parallel test execution** by default
- 🎯 **Jest-compatible API** (easy migration)
- 🔥 **Hot Module Replacement** in watch mode
- 📊 **Built-in coverage** with v8
- 🎨 **Native ESM support**

## ⚠️ Important: Running Tests Correctly

### Frontend Tests

**❌ WRONG** (uses Bun's native test runner, no jsdom support):

```bash
bun test
```

**✅ CORRECT** (uses Vitest with jsdom):

```bash
bun run test
```

### Backend Tests

**✅ Both work** (backend doesn't need jsdom):

```bash
bun test          # Uses Bun's native runner
bun run test      # Uses Vitest
```

For consistency, **always use `bun run test`** for both backend and frontend.

### Why This Matters

When you type `bun test`, Bun uses its **native test runner** which:

- ✅ Works for Node.js/Bun code (backend)
- ❌ Doesn't support jsdom (needed for React components)
- ❌ Can't render React components in tests

When you type `bun run test`, it runs the **npm script** which calls Vitest:

- ✅ Supports jsdom environment
- ✅ Works with React Testing Library
- ✅ Proper test isolation and parallel execution

## Test Structure

### Backend Tests

Located in `backend/tests/`

```typescript
import { describe, it, expect } from 'vitest';
import app from '../src/index';

describe('Feature Name', () => {
  it('should do something specific', async () => {
    // Arrange
    const req = new Request('http://localhost:3000/endpoint');
    
    // Act
    const res = await app.fetch(req);
    
    // Assert
    expect(res.status).toBe(200);
  });
});
```

### Frontend Tests

Located in `frontend/tests/`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Component from '../src/components/Component';

describe('Component Name', () => {
  it('should render correctly', () => {
    // Arrange & Act
    render(<Component />);
    
    // Assert
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Running Tests

### Basic Commands

```bash
# Run all tests
bun run test

# Watch mode (re-runs on file changes)
bun run test:watch

# Coverage report
bun run test:coverage

# Verbose output
bun run test -- --reporter=verbose

# Run specific test file
bun run test tests/health.test.ts
```

### Parallel Execution

Vitest runs tests in parallel by default. Configuration in `vitest.config.ts`:

```typescript
test: {
  pool: 'threads',
  poolOptions: {
    threads: {
      singleThread: false,  // Enable parallel execution
      isolate: true,        // Isolate test environments
    },
  },
}
```

### Watch Mode

Watch mode is optimized for speed:

```bash
bun run test:watch
```

Features:

- Only re-runs affected tests
- Smart dependency tracking
- Instant feedback
- Press `a` to run all tests
- Press `f` to run only failed tests

## Coverage Requirements

We enforce **80% coverage** on:

- Lines
- Functions
- Branches
- Statements

Configuration in `vitest.config.ts`:

```typescript
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
}
```

### Viewing Coverage

```bash
# Generate coverage report
bun run test:coverage

# Open HTML report
open coverage/index.html
```

## Writing Good Tests

### 1. Arrange-Act-Assert Pattern

```typescript
it('should calculate total correctly', () => {
  // Arrange - Set up test data
  const items = [10, 20, 30];
  
  // Act - Execute the function
  const result = calculateTotal(items);
  
  // Assert - Verify the result
  expect(result).toBe(60);
});
```

### 2. Test One Thing at a Time

❌ **Bad:**

```typescript
it('should handle user creation and login', () => {
  // Testing two things
});
```

✅ **Good:**

```typescript
it('should create user successfully', () => {
  // Test user creation
});

it('should login user successfully', () => {
  // Test user login
});
```

### 3. Use Descriptive Test Names

❌ **Bad:**

```typescript
it('works', () => { ... });
```

✅ **Good:**

```typescript
it('should return 404 when user is not found', () => { ... });
```

### 4. Test Edge Cases

```typescript
describe('calculateDiscount', () => {
  it('should handle zero price', () => {
    expect(calculateDiscount(0, 10)).toBe(0);
  });
  
  it('should handle 100% discount', () => {
    expect(calculateDiscount(100, 100)).toBe(0);
  });
  
  it('should handle negative prices', () => {
    expect(() => calculateDiscount(-10, 10)).toThrow();
  });
});
```

## Test Optimization Techniques

### 1. Parallel Execution

Tests run in parallel by default. Ensure tests are independent:

```typescript
// ✅ Good - Independent test
it('should create user', async () => {
  const user = await createUser({ name: 'Test' });
  expect(user.name).toBe('Test');
});

// ❌ Bad - Depends on previous test
let userId: string;
it('should create user', async () => {
  const user = await createUser({ name: 'Test' });
  userId = user.id;  // Shared state!
});
```

### 2. Mock External Dependencies

```typescript
import { vi } from 'vitest';

// Mock Supabase client
vi.mock('../src/config/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [] })),
    })),
  },
}));
```

### 3. Use Test Fixtures

```typescript
// tests/fixtures/users.ts
export const mockUser = {
  id: '123',
  name: 'Test User',
  email: 'test@example.com',
};

// tests/user.test.ts
import { mockUser } from './fixtures/users';

it('should display user name', () => {
  render(<UserProfile user={mockUser} />);
  expect(screen.getByText('Test User')).toBeInTheDocument();
});
```

## TDD Workflow

### 1. Write Failing Test

```typescript
it('should add two numbers', () => {
  expect(add(2, 3)).toBe(5);
});
```

Run test: ❌ **FAILS** (function doesn't exist)

### 2. Write Minimal Implementation

```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

Run test: ✅ **PASSES**

### 3. Refactor

```typescript
// Add type safety, validation, etc.
function add(a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new Error('Invalid input');
  }
  return a + b;
}
```

Run test: ✅ **STILL PASSES**

### 4. Add More Tests

```typescript
it('should throw on invalid input', () => {
  expect(() => add(NaN, 5)).toThrow('Invalid input');
});
```

## Continuous Integration

Tests run automatically on:

- Every commit
- Pull requests
- Before deployment

Example GitHub Actions workflow:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test:coverage
```

## Best Practices

1. ✅ **Run tests before committing**
2. ✅ **Keep tests fast** (< 1s per test)
3. ✅ **Test behavior, not implementation**
4. ✅ **Use meaningful assertions**
5. ✅ **Clean up after tests** (mocks, timers, etc.)
6. ✅ **Don't skip tests** (fix or remove them)
7. ✅ **Review test coverage regularly**
8. ✅ **Write tests for bug fixes**

## Common Patterns

### Testing API Endpoints

```typescript
describe('POST /api/workouts', () => {
  it('should create workout', async () => {
    const req = new Request('http://localhost:3000/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bench Press' }),
    });
    
    const res = await app.fetch(req);
    expect(res.status).toBe(201);
  });
});
```

### Testing React Components

```typescript
describe('WorkoutCard', () => {
  it('should display workout name', () => {
    render(<WorkoutCard name="Squats" reps={10} />);
    expect(screen.getByText('Squats')).toBeInTheDocument();
  });
  
  it('should call onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    render(<WorkoutCard name="Squats" onDelete={onDelete} />);
    
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledOnce();
  });
});
```

## Resources

- [Vitest Documentation](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://testingjavascript.com)
