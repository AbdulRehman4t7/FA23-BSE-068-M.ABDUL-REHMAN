import jwt from 'jsonwebtoken';

export function optionalJwt(req, res, next) {
  const secret = process.env.JWT_SECRET;
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!secret) {
    req.user = null;
    return next();
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (e) {
    req.user = null;
    next();
  }
}

export function requireJwt(req, res, next) {
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
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({
      error: { message: 'Missing token', code: 'UNAUTHORIZED', details: null },
    });
  }
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({
      error: { message: 'Invalid token', code: 'UNAUTHORIZED', details: null },
    });
  }
}

