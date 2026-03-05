import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { requireJwt, optionalJwt } from '../../middleware/auth.js';

const router = Router();

// In-memory storage (replace with database in production)
let users = [];
let nextUserId = 1;

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'BAD_REQUEST',
        details: errors.array(),
      },
    });
  }
  next();
}

// Register User (POST /users)
router.post(
  '/',
  [
    body('name').isString().trim().isLength({ min: 1, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 6 }),
    body('department').optional().isString().trim(),
  ],
  handleValidation,
  (req, res) => {
    const { name, email, password, department } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: {
          message: 'User already exists',
          code: 'CONFLICT',
          details: null,
        },
      });
    }

    const user = {
      id: nextUserId++,
      name,
      email,
      password, // In production, hash this with bcrypt
      department: department || 'General',
      createdAt: new Date().toISOString(),
    };
    
    users.push(user);
    
    // Don't send password in response
    const { password: _, ...userResponse } = user;
    res.status(201).json({ data: userResponse });
  }
);

// Login User (POST /users/login)
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString(),
  ],
  handleValidation,
  (req, res) => {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          code: 'UNAUTHORIZED',
          details: null,
        },
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(501).json({
        error: {
          message: 'Auth not configured',
          code: 'AUTH_NOT_CONFIGURED',
          details: null,
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      secret,
      { expiresIn: '24h' }
    );

    const { password: _, ...userResponse } = user;
    res.json({
      data: {
        user: userResponse,
        token,
      },
    });
  }
);

// Get All Users (GET /users) - Protected
router.get('/', optionalJwt, (req, res) => {
  // Remove passwords from response
  const usersResponse = users.map(({ password, ...user }) => user);
  res.json({
    data: usersResponse,
    count: usersResponse.length,
  });
});

// Get Single User (GET /users/:id) - Protected
router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).toInt()],
  handleValidation,
  optionalJwt,
  (req, res) => {
    const id = req.params.id;
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          code: 'NOT_FOUND',
          details: null,
        },
      });
    }

    const { password, ...userResponse } = user;
    res.json({ data: userResponse });
  }
);

// Update User (PUT /users/:id) - Protected
router.put(
  '/:id',
  [
    param('id').isInt({ min: 1 }).toInt(),
    body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('department').optional().isString().trim(),
  ],
  handleValidation,
  requireJwt,
  (req, res) => {
    const id = req.params.id;
    
    // Users can only update their own profile
    if (req.user.id !== id) {
      return res.status(403).json({
        error: {
          message: 'Forbidden: You can only update your own profile',
          code: 'FORBIDDEN',
          details: null,
        },
      });
    }

    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          code: 'NOT_FOUND',
          details: null,
        },
      });
    }

    const current = users[idx];
    const updated = {
      ...current,
      ...req.body,
      id: current.id,
      password: current.password, // Don't allow password update here
      updatedAt: new Date().toISOString(),
    };
    
    users[idx] = updated;
    
    const { password, ...userResponse } = updated;
    res.json({ data: userResponse });
  }
);

// Delete User (DELETE /users/:id) - Protected
router.delete(
  '/:id',
  [param('id').isInt({ min: 1 }).toInt()],
  handleValidation,
  requireJwt,
  (req, res) => {
    const id = req.params.id;
    
    // Users can only delete their own account
    if (req.user.id !== id) {
      return res.status(403).json({
        error: {
          message: 'Forbidden: You can only delete your own account',
          code: 'FORBIDDEN',
          details: null,
        },
      });
    }

    const before = users.length;
    users = users.filter(u => u.id !== id);
    
    if (users.length === before) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          code: 'NOT_FOUND',
          details: null,
        },
      });
    }

    res.status(204).send();
  }
);

export default router;
