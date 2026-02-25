---
name: backend-api-routes
description: Build REST API routes with request/response handling and database connections. Use for backend development.
---

# Backend API Routes & Database Integration

## Instructions

1. **Route structure**
   - RESTful endpoint design
   - HTTP method handling (GET, POST, PUT, DELETE)
   - Route parameter validation
   - Middleware integration

2. **Request/Response handling**
   - Parse request bodies and query parameters
   - Validate input data
   - Format JSON responses
   - Handle errors gracefully
   - Set appropriate status codes

3. **Database operations**
   - Establish connection pools
   - Execute queries with parameterization
   - Handle transactions
   - Implement error recovery

## Best Practices

- Use environment variables for DB credentials
- Implement proper error middleware
- Validate and sanitize all inputs
- Use async/await for DB operations
- Return consistent response formats
- Log errors without exposing sensitive data
- Use connection pooling for performance
- Implement request rate limiting

## Example Structure
```javascript
// Express.js example
const express = require('express');
const router = express.Router();
const db = require('./database');

// GET route with DB query
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST route with validation
router.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email required' });
    }
    
    const result = await db.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );
    
    res.status(201).json({ 
      message: 'User created',
      data: { id: result.insertId, name, email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

## Common Patterns

- **CRUD operations**: Create, Read, Update, Delete endpoints
- **Error middleware**: Centralized error handling
- **Authentication middleware**: Verify tokens/sessions
- **Pagination**: Limit and offset for large datasets
- **Filtering**: Query parameters for data filtering

## Database Connection Example
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```