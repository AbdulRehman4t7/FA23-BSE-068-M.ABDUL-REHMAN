import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { optionalJwt } from '../../middleware/auth.js';

const router = Router();

let items = [];
let nextId = 1;

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

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  handleValidation,
  optionalJwt,
  (req, res) => {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = items.slice(start, end);
    res.json({
      data,
      pagination: { page, pageSize, total: items.length },
    });
  }
);

router.post(
  '/',
  [body('name').isString().trim().isLength({ min: 1, max: 120 }), body('price').isFloat({ min: 0 }).toFloat()],
  handleValidation,
  optionalJwt,
  (req, res) => {
    const { name, price } = req.body;
    const item = { id: nextId++, name, price };
    items.push(item);
    res.status(201).json({ data: item });
  }
);

router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).toInt()],
  handleValidation,
  optionalJwt,
  (req, res) => {
    const id = req.params.id;
    const item = items.find((i) => i.id === id);
    if (!item) {
      return res.status(404).json({
        error: { message: 'Item not found', code: 'NOT_FOUND', details: null },
      });
    }
    res.json({ data: item });
  }
);

router.put(
  '/:id',
  [
    param('id').isInt({ min: 1 }).toInt(),
    body('name').optional().isString().trim().isLength({ min: 1, max: 120 }),
    body('price').optional().isFloat({ min: 0 }).toFloat(),
  ],
  handleValidation,
  optionalJwt,
  (req, res) => {
    const id = req.params.id;
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) {
      return res.status(404).json({
        error: { message: 'Item not found', code: 'NOT_FOUND', details: null },
      });
    }
    const current = items[idx];
    const updated = { ...current, ...req.body, id: current.id };
    items[idx] = updated;
    res.json({ data: updated });
  }
);

router.delete('/:id', [param('id').isInt({ min: 1 }).toInt()], handleValidation, optionalJwt, (req, res) => {
  const id = req.params.id;
  const before = items.length;
  items = items.filter((i) => i.id !== id);
  if (items.length === before) {
    return res.status(404).json({
      error: { message: 'Item not found', code: 'NOT_FOUND', details: null },
    });
  }
  res.status(204).send();
});

export default router;
