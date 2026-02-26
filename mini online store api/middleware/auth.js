// Auth Middleware — Reservation Check for the VIP users section
// Restaurant Analogy:
// - The host checks if you have a valid reservation (token).
// - If not, you can't enter the VIP area (users routes).

module.exports = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing Bearer token' });
  }

  const token = header.slice(7);
  // Simulate token validation
  if (token !== 'demo-token') {
    return res.status(403).json({ error: 'Forbidden: invalid token' });
  }

  // Attach a simulated user to the request for downstream handlers
  req.user = { id: '123', role: 'student' };
  next();
};

