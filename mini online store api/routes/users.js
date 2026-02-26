const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Router-level focus: user routes are grouped here
// Restaurant Analogy:
// - This is the "VIP section" menu for users.
// - The kitchen (controllers) will prepare the dish once the waiter (middleware) verifies access.

router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);

module.exports = router;

