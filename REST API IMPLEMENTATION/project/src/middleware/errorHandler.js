export function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: {
      message: 'Resource not found',
      code: 'NOT_FOUND',
      details: null,
    },
  });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const payload = {
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR',
      details: err.details || null,
    },
  };
  if (status >= 500) {
    console.error('Unhandled error:', err);
  }
  res.status(status).json(payload);
}
