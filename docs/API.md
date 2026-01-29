# Personal Gym Tracker API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000` (development)  
**Content-Type:** `application/json`

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Exercises](#exercise-management)
  - [Workouts](#workout-management)
  - [Statistics](#statistics-api)
- [Data Models](#data-models)
- [Best Practices](#best-practices)
- [Performance Metrics](#performance-metrics)

---

## Overview

The Personal Gym Tracker API provides a comprehensive backend for tracking workouts, exercises, and fitness progress. Built with Hono and Supabase, it offers robust authentication, Row Level Security (RLS), and real-time analytics.

### Key Features

- **JWT-based Authentication** with token refresh
- **Row Level Security (RLS)** for complete data isolation
- **Comprehensive Analytics** (PRs, progress tracking, volume analysis)
- **Transaction Support** for atomic operations
- **Input Validation** using Zod schemas
- **Performance Optimized** queries with proper indexing

---

## Authentication

All protected endpoints require a valid JWT access token in the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

### Token Lifecycle

1. **Obtain tokens** via `/api/auth/signup` or `/api/auth/login`
2. **Use access token** for API requests (expires in 1 hour)
3. **Refresh tokens** via `/api/auth/refresh` before expiration
4. **Invalidate session** via `/api/auth/logout`

---

## Response Format

All API responses follow a standardized JSON format:

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "User-friendly error message"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request succeeded |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid input or malformed request |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Authenticated but not authorized |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Resource already exists |
| `500` | Internal Server Error | Server error |

### Common Error Messages

```json
// Missing authentication
{
  "success": false,
  "error": "Missing authorization header"
}

// Invalid credentials
{
  "success": false,
  "error": "Invalid email or password"
}

// Validation error
{
  "success": false,
  "error": "name: String must contain at least 1 character(s)"
}

// Authorization error
{
  "success": false,
  "error": "Forbidden: You do not have permission to access this resource"
}
```

---

## Endpoints

### Authentication Endpoints

#### POST /api/auth/signup

Register a new user account.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Validation:**

- Email: Valid email format
- Password: 8-64 characters

**Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "created_at": "2026-01-28T20:00:00.000Z"
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "v1.MRjx...",
      "expires_at": 1706476800
    }
  }
}
```

**Errors:**

- `400`: Invalid email format or password length
- `409`: Email already registered

---

#### POST /api/auth/login

Authenticate a user and return session tokens.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):** Same as signup

**Errors:**

- `400`: Missing email or password
- `401`: Invalid credentials

---

#### GET /api/auth/me

Get current user profile.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "authenticated"
  }
}
```

**Errors:**

- `401`: Missing or invalid token

---

#### POST /api/auth/logout

Invalidate current session.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

---

#### POST /api/auth/refresh

Refresh access token using refresh token.

**Request:**

```json
{
  "refreshToken": "v1.MRjx..."
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "v1.NewToken...",
      "expires_at": 1706480400
    }
  }
}
```

**Note:** Token rotation is implemented - a new refresh token is returned.

**Errors:**

- `400`: Missing refresh token
- `401`: Invalid or expired refresh token

---

### Exercise Management

#### GET /api/exercises

Retrieve all exercises for the authenticated user with optional filtering and sorting.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Values |
|-----------|------|-------------|--------|
| `muscle_group` | string | Filter by muscle group | Chest, Back, Legs, Shoulders, Arms, Core, Full Body |
| `equipment_type` | string | Filter by equipment | Barbell, Dumbbell, Machine, Bodyweight, Cable, Resistance Band, Other |
| `sort` | string | Sort order | `name_asc`, `name_desc`, `created_asc`, `created_desc` |

**Example Request:**

```http
GET /api/exercises?muscle_group=Chest&sort=name_asc
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "Bench Press",
      "description": "Classic chest exercise",
      "category": "strength",
      "muscle_group": "Chest",
      "equipment_type": "Barbell",
      "created_at": "2026-01-28T20:00:00.000Z",
      "updated_at": "2026-01-28T20:00:00.000Z"
    }
  ]
}
```

**Performance:** ~98ms for 15 exercises

---

#### POST /api/exercises

Create a new exercise.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Request:**

```json
{
  "name": "Bench Press",
  "muscle_group": "Chest",
  "equipment_type": "Barbell",
  "description": "Classic chest exercise",
  "category": "strength"
}
```

**Validation:**

- `name`: 1-100 characters (required)
- `muscle_group`: Valid muscle group (required)
- `equipment_type`: Valid equipment type (required)
- `description`: Max 500 characters (optional)
- `category`: String (optional)

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Bench Press",
    "description": "Classic chest exercise",
    "category": "strength",
    "muscle_group": "Chest",
    "equipment_type": "Barbell",
    "created_at": "2026-01-28T20:00:00.000Z",
    "updated_at": "2026-01-28T20:00:00.000Z"
  }
}
```

**Errors:**

- `400`: Missing required fields or invalid values
- `401`: Missing authentication

---

#### PUT /api/exercises/:id

Update an existing exercise. Supports partial updates.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Request (all fields optional):**

```json
{
  "name": "Incline Bench Press",
  "description": "Upper chest focus"
}
```

**Response (200):** Same format as POST response

**Errors:**

- `400`: Invalid field values
- `401`: Missing authentication
- `403`: Exercise belongs to another user
- `404`: Exercise not found

---

#### DELETE /api/exercises/:id

Delete an exercise.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Exercise deleted successfully"
  }
}
```

**Errors:**

- `400`: Exercise is referenced in workouts (foreign key constraint)
- `401`: Missing authentication
- `403`: Exercise belongs to another user
- `404`: Exercise not found

---

### Workout Management

#### GET /api/workouts

Retrieve all workouts for the authenticated user with optional filtering and pagination.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `start_date` | ISO 8601 | Filter workouts after this date | - |
| `end_date` | ISO 8601 | Filter workouts before this date | - |
| `limit` | integer | Number of results (max 100) | 50 |
| `offset` | integer | Pagination offset | 0 |

**Example Request:**

```http
GET /api/workouts?start_date=2026-01-01T00:00:00Z&limit=20
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "Workout 01/28/2026",
      "notes": "Great workout!",
      "started_at": "2026-01-28T10:00:00Z",
      "completed_at": "2026-01-28T11:00:00Z",
      "duration_minutes": 60,
      "total_sets": 12,
      "exercises_count": 3,
      "created_at": "2026-01-28T10:00:00.000Z",
      "updated_at": "2026-01-28T10:00:00.000Z"
    }
  ]
}
```

**Performance:** ~680ms for 30 workouts

---

#### POST /api/workouts

Create a new workout with multiple sets. Uses database transactions for atomicity.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Request:**

```json
{
  "workout_date": "2026-01-28T10:00:00Z",
  "duration_minutes": 60,
  "notes": "Great workout!",
  "sets": [
    {
      "exercise_id": "550e8400-e29b-41d4-a716-446655440000",
      "set_number": 1,
      "weight_kg": 100,
      "reps": 10
    },
    {
      "exercise_id": "550e8400-e29b-41d4-a716-446655440000",
      "set_number": 2,
      "weight_kg": 100,
      "reps": 8
    }
  ]
}
```

**Validation:**

- `workout_date`: Valid ISO 8601 date (required)
- `duration_minutes`: Positive integer (required)
- `notes`: String (optional)
- `sets`: Non-empty array (required)
  - `exercise_id`: Valid UUID (required)
  - `set_number`: Positive integer (required)
  - `weight_kg`: Positive number (required)
  - `reps`: Positive integer (required)

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Workout 01/28/2026",
    "notes": "Great workout!",
    "started_at": "2026-01-28T10:00:00Z",
    "completed_at": "2026-01-28T10:00:00Z",
    "duration_minutes": 60,
    "created_at": "2026-01-28T10:00:00.000Z",
    "updated_at": "2026-01-28T10:00:00.000Z",
    "sets": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "exercise_id": "550e8400-e29b-41d4-a716-446655440000",
        "set_number": 1,
        "weight_kg": 100,
        "reps": 10,
        "created_at": "2026-01-28T10:00:00.000Z"
      }
    ]
  }
}
```

**Performance:** ~418ms

**Errors:**

- `400`: Invalid data or empty sets array
- `401`: Missing authentication
- `403`: Attempting to use another user's exercise

**Note:** Transaction rollback occurs on any validation failure.

---

#### GET /api/workouts/:id

Get complete workout details including all sets.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Workout 01/28/2026",
    "notes": "Great workout!",
    "started_at": "2026-01-28T10:00:00Z",
    "completed_at": "2026-01-28T11:00:00Z",
    "duration_minutes": 60,
    "created_at": "2026-01-28T10:00:00.000Z",
    "updated_at": "2026-01-28T10:00:00.000Z",
    "sets": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "exercise_id": "550e8400-e29b-41d4-a716-446655440000",
        "workout_exercise_id": "880e8400-e29b-41d4-a716-446655440000",
        "set_number": 1,
        "weight_kg": 100,
        "reps": 10,
        "created_at": "2026-01-28T10:00:00.000Z"
      }
    ]
  }
}
```

**Errors:**

- `401`: Missing authentication
- `403`: Workout belongs to another user
- `404`: Workout not found

---

#### DELETE /api/workouts/:id

Delete a workout. Cascade deletion automatically removes all associated sets.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Workout deleted successfully"
  }
}
```

**Errors:**

- `401`: Missing authentication
- `403`: Workout belongs to another user
- `404`: Workout not found

---

### Statistics API

#### GET /api/stats/prs

Get all personal records for the authenticated user.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "exercise_id": "550e8400-e29b-41d4-a716-446655440000",
      "exercise_name": "Bench Press",
      "max_weight": {
        "value": 120,
        "reps": 5,
        "date": "2026-01-08T10:00:00Z"
      },
      "max_reps": {
        "value": 15,
        "weight": 80,
        "date": "2026-01-15T10:00:00Z"
      },
      "max_volume": {
        "value": 1200,
        "date": "2026-01-15T10:00:00Z"
      }
    }
  ]
}
```

**Performance:** ~249ms

**Note:** Returns empty array if no workouts exist.

---

#### GET /api/stats/progress/:exerciseId

Get historical progress data for a specific exercise.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `period` | string | Time period | `12weeks` |

**Valid periods:** `4weeks`, `12weeks`, `6months`, `all`

**Example Request:**

```http
GET /api/stats/progress/550e8400-e29b-41d4-a716-446655440000?period=4weeks
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "date": "2026-01-01T10:00:00Z",
      "avg_weight": 100,
      "max_weight": 100,
      "total_reps": 18,
      "total_volume": 1800
    }
  ]
}
```

**Errors:**

- `401`: Missing authentication
- `403`: Exercise belongs to another user
- `404`: Exercise not found

---

#### GET /api/stats/volume

Get training volume statistics grouped by time period.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `groupBy` | string | Grouping period | `week` |
| `period` | string | Time range | `12weeks` |

**Valid groupBy:** `week`, `month`  
**Valid period:** `4weeks`, `12weeks`, `6months`, `all`

**Example Request:**

```http
GET /api/stats/volume?groupBy=week&period=12weeks
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "period": "2026-01-13",
      "total_volume": 1200,
      "by_muscle_group": [
        {
          "muscle_group": "Chest",
          "volume": 1200
        }
      ]
    }
  ]
}
```

**Performance:** ~137ms

---

#### GET /api/stats/summary

Get aggregate summary statistics for the authenticated user.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "total_workouts": 50,
    "total_exercises": 15,
    "total_workouts_this_month": 12,
    "total_workouts_this_week": 3,
    "total_sets_this_week": 36,
    "total_sets_this_month": 144,
    "most_trained_muscle_group": "Chest",
    "current_streak": 5,
    "avg_workouts_per_week": 4.2
  }
}
```

**Performance:** ~495ms

**Field Descriptions:**

- `current_streak`: Consecutive days with workouts
- `avg_workouts_per_week`: Average over last 12 weeks
- `most_trained_muscle_group`: By total volume

---

## Data Models

### User

```typescript
{
  id: string;           // UUID
  email: string;        // Valid email
  created_at: string;   // ISO 8601
  role: string;         // "authenticated"
}
```

### Exercise

```typescript
{
  id: string;              // UUID
  user_id: string;         // UUID
  name: string;            // 1-100 characters
  description?: string;    // Max 500 characters
  category?: string;
  muscle_group: string;    // Enum
  equipment_type: string;  // Enum
  created_at: string;      // ISO 8601
  updated_at: string;      // ISO 8601
}
```

**Muscle Groups:** Chest, Back, Legs, Shoulders, Arms, Core, Full Body  
**Equipment Types:** Barbell, Dumbbell, Machine, Bodyweight, Cable, Resistance Band, Other

### Workout

```typescript
{
  id: string;              // UUID
  user_id: string;         // UUID
  name: string;            // Auto-generated
  notes?: string;
  started_at: string;      // ISO 8601
  completed_at?: string;   // ISO 8601
  duration_minutes: number;
  total_sets?: number;     // Calculated
  exercises_count?: number; // Calculated
  created_at: string;      // ISO 8601
  updated_at: string;      // ISO 8601
  sets?: Set[];            // Included in detail view
}
```

### Set

```typescript
{
  id: string;                   // UUID
  exercise_id: string;          // UUID
  workout_exercise_id: string;  // UUID
  set_number: number;           // Positive integer
  weight_kg: number;            // Positive number
  reps: number;                 // Positive integer
  created_at: string;           // ISO 8601
}
```

---

## Best Practices

### Pagination

Always use pagination for list endpoints to improve performance:

```http
GET /api/workouts?limit=20&offset=0
```

**Recommendations:**

- Default limit: 50
- Maximum limit: 100
- Use offset for simple pagination
- Consider date-based filtering for better performance

### Filtering and Sorting

Combine filters for efficient queries:

```http
GET /api/exercises?muscle_group=Chest&sort=name_asc
```

### Error Handling

Always check the `success` field before processing data:

```javascript
const response = await fetch('/api/exercises');
const json = await response.json();

if (!json.success) {
  console.error(json.error);
  return;
}

// Process json.data
```

### Token Management

Implement automatic token refresh:

```javascript
// Check token expiration before requests
if (isTokenExpired(accessToken)) {
  const newSession = await refreshToken(refreshToken);
  accessToken = newSession.access_token;
  refreshToken = newSession.refresh_token;
}
```

### Performance Optimization

1. **Batch operations** when creating multiple resources
2. **Use date filters** to limit data ranges
3. **Cache frequently accessed data** (exercises, user profile)
4. **Implement debouncing** for search/filter inputs

---

## Performance Metrics

Based on integration tests with realistic datasets:

| Endpoint | Dataset | Response Time |
|----------|---------|---------------|
| `GET /api/exercises` | 15 exercises | ~98ms |
| `GET /api/workouts` | 30 workouts | ~680ms |
| `POST /api/workouts` | 2 sets | ~418ms |
| `GET /api/stats/prs` | 30 workouts | ~249ms |
| `GET /api/stats/volume` | 30 workouts | ~137ms |
| `GET /api/stats/summary` | 30 workouts | ~495ms |

**Note:** Times measured on local development environment. Production performance may vary.

### Known Limitations

1. **Maximum pagination limit:** 100 items per request
2. **Token expiration:** Access tokens expire after 1 hour
3. **Concurrent writes:** Database handles concurrent operations but very high concurrency may experience slight delays
4. **Large datasets:** Queries with 200+ workouts may take 1-2 seconds for complex statistics

---

## Security

### Row Level Security (RLS)

All database tables enforce RLS policies:

- Users can only access their own data
- Unauthorized access returns `403 Forbidden` or `404 Not Found`
- Multi-user isolation is verified by integration tests

### Input Validation

All inputs are validated using Zod schemas:

- Type checking
- Length constraints
- Format validation
- SQL injection prevention (via parameterized queries)

### Authentication

- JWT tokens with 1-hour expiration
- Refresh token rotation on refresh
- Secure password hashing (Supabase Auth)
- HTTPS recommended for production

---

## Support

For issues or questions:

- Review this documentation
- Check integration tests for usage examples
- Refer to the codebase for implementation details

**API Version:** 1.0.0  
**Last Updated:** January 28, 2026
