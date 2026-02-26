// Controllers as Chefs: They prepare data responses based on requests.
// Demonstrates reading route params and request body.

exports.getUserById = (req, res) => {
  const { id } = req.params; // Route Parameter usage
  res.json({
    id,
    name: `User-${id}`,
    info: 'Fetched via route params',
  });
};

exports.createUser = (req, res) => {
  const { name, email } = req.body; // Body payload usage
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  // Dummy creation to simulate persistence
  const newUser = { id: Date.now().toString(), name, email };

  res.status(201).json({
    message: 'User created (dummy)',
    user: newUser,
  });
};

