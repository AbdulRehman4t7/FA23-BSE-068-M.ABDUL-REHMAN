// Logger Middleware — Waiter/Host writing the visit into the ledger before the order proceeds
module.exports = (req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.originalUrl}`);
  next(); // Pass control to the next waiter/chef
};

