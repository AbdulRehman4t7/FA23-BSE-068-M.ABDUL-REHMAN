# Mini Online Store API (Express.js Lab Project)
## 📌 Project Outputs

### 🟢 Output 1
<p align="center">
  <img src="https://github.com/user-attachments/assets/3e91cf6b-591a-4e1b-8f96-6ecbc367d850" width="900">
</p>

---

### 🟢 Output 2
<p align="center">
  <img src="https://github.com/user-attachments/assets/c3256ff5-72e1-49e5-88c9-3d37ccae4d64" width="700">
</p>

---

### 🟢 Output 3
<p align="center">
  <img src="https://github.com/user-attachments/assets/5f4d9df7-b890-4c3b-b159-8b4549e06d96" width="400">
</p>




Yeh project Express.js par based ek chhota “Mini Online Store API” hai jo MVC (Model–View–Controller) style ki clean & scalable architecture dikhata hai. Iska primary maksad middleware, routing, express.Router aur proper folder structure ko demonstrate karna hai.

## Key Concepts (Restaurant Analogy)
- app.js = Restaurant ka entrance/manager jo sab coordinate karta hai.
- Middleware = Waiter/Host jo request aane par checks karta hai (e.g., logging, token).
- Routers = Alag-alag restaurant sections/menus (products/users) for organization.
- Controllers = Chefs jo actual “dish” (response) tayyar karte hain (business logic).

## Folder Structure
```
project-folder/
├─ app.js                      // Entry point + server listener
├─ routes/
│  ├─ products.js             // express.Router for products
│  └─ users.js                // express.Router for users
├─ controllers/
│  ├─ productController.js    // Business logic for products
│  └─ userController.js       // Business logic for users
└─ middleware/
   ├─ logger.js               // Global logger middleware
   └─ auth.js                 // Router-level auth for /users
```

## How It Works (Request Flow)
1. Request app.js me aati hai.
2. `express.json()` body ko parse karta hai.
3. Global `logger` middleware har request ka method + URL console me log karta hai.
4. Path ke mutabiq request sahi router tak jati hai:
   - `/products` → products router → `productController.getAllProducts`
   - `/users` → pehle `auth` middleware (Bearer token check), phir users router → `userController`
5. Agar koi route match na ho to 404 JSON error return hota hai.

## Why express.Router?
- Clean & Scalable Code: app.js lean rehta hai; har domain (products/users) ka apna module.
- Feature-wise isolation: maintenance, testing aur team collaboration asaan hoti hai.

## Middleware
- `middleware/logger.js`:
  - Har request ka timestamp + method + URL log karta hai.
- `middleware/auth.js` (sirf `/users` par):
  - `Authorization: Bearer demo-token` expect karta hai.
  - Token missing → 401, galat token → 403.

## Endpoints
- GET `/`  
  Service status + available endpoints.

- GET `/products` (Public)  
  Dummy products array return karta hai.

- GET `/users/:id` (Protected)  
  Header: `Authorization: Bearer demo-token`  
  `req.params.id` se user info return.

- POST `/users` (Protected)  
  Headers: `Content-Type: application/json`, `Authorization: Bearer demo-token`  
  Body: `{ "name": "Ada", "email": "ada@example.com" }`  
  Dummy user create karke `201` return.

## Run Locally
Prerequisites: Node.js 16+

1. Dependencies install karein (agar zarurat ho):
   ```bash
   npm install
   # ya agar express missing ho:
   npm install express
   ```
2. Server start karein:
   ```bash
   node app.js
   ```
3. Default port: `4000`  
   URL: http://localhost:4000

> Note: Port 3000 par agar koi doosri app chal rahi ho to 404 aa sakta hai. Is project ko humne 4000 par set kiya hai.

## Quick Tests (curl)

Products (public):
```bash
curl http://localhost:4000/products
```

Users (protected):
```bash
# GET by id
curl -H "Authorization: Bearer demo-token" http://localhost:4000/users/42

# POST create user
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo-token" \
  -d "{\"name\":\"Ada\",\"email\":\"ada@example.com\"}"
```

404 check:
```bash
curl http://localhost:4000/unknown
```

## Common Issues
- 404 on every route: Aap galat port hit kar rahe hon (3000 vs 4000). Sahi URL use karein.
- 401/403 on `/users`: `Authorization: Bearer demo-token` header missing/galat.

## Technologies Used
- Node.js
- Express.js
- MVC structure with express.Router and custom middleware

## Files Overview
- Entry/server: `app.js`
- Routers: `routes/products.js`, `routes/users.js`
- Controllers: `controllers/productController.js`, `controllers/userController.js`
- Middleware: `middleware/logger.js`, `middleware/auth.js`

Happy Learning! ✨

