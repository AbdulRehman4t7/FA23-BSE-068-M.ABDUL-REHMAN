// Controllers as Chefs: They receive an "order ticket" (req) and prepare the "dish" (res).
// Business logic lives here to keep routes slim and maintainable.

exports.getAllProducts = (req, res) => {
  const items = [
    { id: 1, name: 'Keyboard', price: 49.99 },
    { id: 2, name: 'Mouse', price: 29.99 },
    { id: 3, name: 'Monitor', price: 199.99 },
  ];
  res.json(items);
};

