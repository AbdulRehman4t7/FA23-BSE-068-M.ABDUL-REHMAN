const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Why express.Router?
// - Clean & Scalable Code: By grouping related routes into modules, we keep app.js lean.
// - Each feature area (like a restaurant section) has its own "mini menu" and policies.
// - This makes large applications easier to maintain and extend.

router.get('/', productController.getAllProducts);

module.exports = router;

