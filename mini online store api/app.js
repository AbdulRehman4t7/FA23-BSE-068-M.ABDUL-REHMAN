// Mini Online Store API — Express.js Lab Project (MVC + Router + Middleware)
// Restaurant Analogy:
// - app.js is the restaurant entrance and manager coordinating everything.
// - Middleware are the waiters/hosts doing checks (e.g., logging, token check) before the order reaches the kitchen.
// - Routers are separate service stations/sections to keep the dining floor organized.
// - Controllers are the chefs preparing the actual dishes (business logic).
// This separation keeps code Clean & Scalable.

const express = require('express');
const logger = require('./middleware/logger');
const auth = require('./middleware/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');

const app = express();

// Built-in JSON body parser — like the waiter writing down order details from the customer
app.use(express.json());

// Global middleware — Logger as the host noting each guest and their request
app.use(logger);

// Mount routers
// Products routes are public
app.use('/products', productRoutes);

// Users routes are protected with 'auth' to demonstrate router-level protection
// Restaurant Analogy: Think of this as a VIP section — a host checks your reservation (token) before letting you in.
app.use('/users', auth, userRoutes);

// Optional: Root route to help you see the service is running
app.get('/', (req, res) => {
  res.json({
    message: 'Mini Online Store API is running',
    endpoints: {
      products: 'GET /products',
      userById: 'GET /users/:id (requires Authorization: Bearer demo-token)',
      createUser: 'POST /users (requires Authorization: Bearer demo-token)',
    },
  });
});

// 404 handler — runs if no route matched above
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Server listener
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Mini Online Store API running on http://localhost:${PORT}`);
});

