import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { optionalJwt, requireJwt } from '../../middleware/auth.js';

const router = Router();

// In-memory storage (replace with database in production)
let books = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin', price: 500, isbn: '978-0132350884' },
  { id: 2, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', price: 450, isbn: '978-0201616224' },
];
let nextBookId = 3;

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

// Get All Books (GET /books) with pagination and filtering
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('author').optional().isString().trim(),
  ],
  handleValidation,
  optionalJwt,
  (req, res) => {
    let filteredBooks = books;

    // Filter by author if provided
    if (req.query.author) {
      filteredBooks = books.filter(b => 
        b.author.toLowerCase().includes(req.query.author.toLowerCase())
      );
    }

    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = filteredBooks.slice(start, end);

    res.json({
      data,
      pagination: {
        page,
        pageSize,
        total: filteredBooks.length,
        totalPages: Math.ceil(filteredBooks.length / pageSize),
      },
    });
  }
);

// Add Book (POST /books) - Protected
router.post(
  '/',
  [
    body('title').isString().trim().isLength({ min: 1, max: 200 }),
    body('author').isString().trim().isLength({ min: 1, max: 100 }),
    body('price').isFloat({ min: 0 }).toFloat(),
    body('isbn').optional().isString().trim(),
  ],
  handleValidation,
  requireJwt,
  (req, res) => {
    const { title, author, price, isbn } = req.body;
    
    const book = {
      id: nextBookId++,
      title,
      author,
      price,
      isbn: isbn || null,
      createdAt: new Date().toISOString(),
    };
    
    books.push(book);
    res.status(201).json({ data: book });
  }
);

// Get Book by ID (GET /books/:id)
router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).toInt()],
  handleValidation,
  optionalJwt,
  (req, res) => {
    const id = req.params.id;
    const book = books.find(b => b.id === id);
    
    if (!book) {
      return res.status(404).json({
        error: {
          message: 'Book not found',
          code: 'NOT_FOUND',
          details: null,
        },
      });
    }

    res.json({ data: book });
  }
);

// Update Book (PUT /books/:id) - Protected
router.put(
  '/:id',
  [
    param('id').isInt({ min: 1 }).toInt(),
    body('title').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('author').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('price').optional().isFloat({ min: 0 }).toFloat(),
    body('isbn').optional().isString().trim(),
  ],
  handleValidation,
  requireJwt,
  (req, res) => {
    const id = req.params.id;
    const idx = books.findIndex(b => b.id === id);
    
    if (idx === -1) {
      return res.status(404).json({
        error: {
          message: 'Book not found',
          code: 'NOT_FOUND',
          details: null,
        },
      });
    }

    const current = books[idx];
    const updated = {
      ...current,
      ...req.body,
      id: current.id,
      updatedAt: new Date().toISOString(),
    };
    
    books[idx] = updated;
    res.json({ data: updated });
  }
);

// Delete Book (DELETE /books/:id) - Protected
router.delete(
  '/:id',
  [param('id').isInt({ min: 1 }).toInt()],
  handleValidation,
  requireJwt,
  (req, res) => {
    const id = req.params.id;
    const before = books.length;
    books = books.filter(b => b.id !== id);
    
    if (books.length === before) {
      return res.status(404).json({
        error: {
          message: 'Book not found',
          code: 'NOT_FOUND',
          details: null,
        },
      });
    }

    res.status(204).send();
  }
);

export default router;
