# 🚀 REST API Implementation - Complete Guide

Yeh project PDFs ke requirements ke according complete REST API implementation hai jo design, implementation, aur security best practices follow karta hai.
<p align="center">
  <img src="https://github.com/user-attachments/assets/403add84-eb25-4017-85a4-90f3eaad1efb" width="400"/>
  <img src="https://github.com/user-attachments/assets/373b3624-0e59-4510-b04a-d5fc563eec48" width="400"/>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/43f8adfc-17b7-4b43-b9b6-65ce9b73c9ab" width="400"/>
  <img src="https://github.com/user-attachments/assets/8d4d50e3-0944-4ab3-9fcc-c425af4c7034" width="400"/>
</p>






## 📚 Based on PDF Lectures

Is implementation mein teen comprehensive lectures ke concepts follow kiye gaye hain:
1. **Designing REST API** - REST principles, endpoint design, HTTP methods
2. **Implementing REST API** - Step-by-step practical implementation  
3. **REST API Security** - CORS, XSS, DDoS protection, Authentication & Authorization

## ✨ Features

### 🔐 Security (PDF Requirements ke mutabiq)
- **CORS** - Cross-Origin Resource Sharing configured
- **Helmet** - Security headers (CSP, HSTS, X-Frame-Options)
- **Rate Limiting** - DDoS protection (500 requests per 15 minutes)
- **JWT Authentication** - Token-based authentication
- **Input Validation** - Express-validator for XSS prevention
- **HTTPOnly Cookies** - Secure session handling

### 📦 Implemented Resources (PDF Case Studies)
1. **Users API** - Complete user management with authentication
   - Register, Login, CRUD operations
   - JWT token generation
   - Authorization (users can only modify their own data)

2. **Books API** - Online Bookstore (PDF Case Study)
   - CRUD operations for books
   - Pagination and filtering by author
   - Protected endpoints

3. **Items API** - Generic resource management
   - Full CRUD operations
   - Pagination support

### 🎯 REST Best Practices (PDF Guidelines)
- ✅ Resource-based URLs (nouns, not verbs)
- ✅ Proper HTTP methods (GET, POST, PUT, DELETE)
- ✅ Appropriate HTTP status codes (200, 201, 400, 404, 500)
- ✅ JSON request/response format
- ✅ Stateless architecture
- ✅ Pagination for list endpoints
- ✅ Consistent error handling

## 🚀 Quick Start

### Installation

1. **Dependencies install karein:**
```bash
npm install
```

2. **Environment file setup:**
```bash
cp .env.example .env
```

3. **`.env` file mein JWT secret set karein:**
```env
JWT_SECRET=your-secure-secret-key-here
```

Generate secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. **Server start karein:**
```bash
npm run start:api
```

Server running at: `http://localhost:3000`

## 📖 API Documentation

### Interactive Documentation
Browser mein kholen:
```
http://localhost:3000/api-docs.html
```

### Base URL
```
http://localhost:3000/api/v1
```

## 🔌 Complete API Endpoints

### 👥 Users API (Authentication & Authorization)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users` | Register new user | ❌ |
| POST | `/users/login` | Login aur JWT token milega | ❌ |
| GET | `/users` | Sab users ki list | ❌ |
| GET | `/users/:id` | Specific user | ❌ |
| PUT | `/users/:id` | Update user (sirf apna profile) | ✅ |
| DELETE | `/users/:id` | Delete user (sirf apna account) | ✅ |

**Example - Register:**
```bash
POST http://localhost:3000/api/v1/users
Content-Type: application/json

{
  "name": "Ali Ahmed",
  "email": "ali@example.com",
  "password": "securepass123",
  "department": "Computer Science"
}
```

**Example - Login:**
```bash
POST http://localhost:3000/api/v1/users/login
Content-Type: application/json

{
  "email": "ali@example.com",
  "password": "securepass123"
}
```

Response:
```json
{
  "data": {
    "user": { "id": 1, "name": "Ali Ahmed", "email": "ali@example.com" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 📚 Books API (Online Bookstore - PDF Case Study)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/books` | Sab books (pagination + filter) | ❌ |
| GET | `/books/:id` | Specific book | ❌ |
| POST | `/books` | Nai book add karein | ✅ |
| PUT | `/books/:id` | Book update karein | ✅ |
| DELETE | `/books/:id` | Book delete karein | ✅ |

**Query Parameters:**
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 10, max: 100)
- `author` - Filter by author name

**Example - Get Books with Filter:**
```bash
GET http://localhost:3000/api/v1/books?page=1&pageSize=10&author=Martin
```

**Example - Add Book (Protected):**
```bash
POST http://localhost:3000/api/v1/books
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "price": 500,
  "isbn": "978-0132350884"
}
```

### 📦 Items API

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/items` | Sab items (pagination) | ❌ |
| GET | `/items/:id` | Specific item | ❌ |
| POST | `/items` | Naya item create | ❌ |
| PUT | `/items/:id` | Item update | ❌ |
| DELETE | `/items/:id` | Item delete | ❌ |

### 🏥 Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health status |
| GET | `/health/ready` | Readiness check |

## 🔒 Security Implementation (PDF Requirements)

### 1. CORS Configuration
```javascript
cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
```

### 2. Helmet Security Headers
- **CSP** - Content Security Policy
- **HSTS** - HTTP Strict Transport Security
- **X-Frame-Options** - Clickjacking protection
- **X-Content-Type-Options** - MIME sniffing protection

### 3. Rate Limiting (DDoS Protection)
- 500 requests per 15 minutes per IP
- Prevents server overload

### 4. JWT Authentication
- Token-based authentication (stateless)
- 24-hour token expiry
- Secure token verification

### 5. Input Validation (XSS Prevention)
- Express-validator for all inputs
- Sanitization to prevent script injection
- Type checking and constraints

## 🧪 Testing with Postman

### Step 1: Register User
```bash
POST http://localhost:3000/api/v1/users
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123",
  "department": "IT"
}
```

### Step 2: Login
```bash
POST http://localhost:3000/api/v1/users/login
{
  "email": "test@example.com",
  "password": "test123"
}
```

Token copy karein response se.

### Step 3: Protected Endpoint Use Karein
```bash
POST http://localhost:3000/api/v1/books
Authorization: Bearer YOUR_TOKEN_HERE
{
  "title": "Test Book",
  "author": "Test Author",
  "price": 299
}
```

## 📁 Project Structure

```
REST-API-IMPLEMENTATION/
├── project/
│   ├── public/
│   │   ├── index.html          # Frontend UI
│   │   ├── app.js              # Frontend logic
│   │   ├── styles.css          # Styling
│   │   └── api-docs.html       # API Documentation
│   └── src/
│       ├── app.js              # Express app config
│       ├── server.js           # Server entry
│       ├── openapi.yaml        # API specification
│       ├── middleware/
│       │   ├── auth.js         # JWT middleware
│       │   └── errorHandler.js # Error handling
│       └── routes/v1/
│           ├── health.js       # Health endpoints
│           ├── users.js        # Users API (NEW)
│           ├── books.js        # Books API (NEW)
│           └── items.js        # Items API
├── build/
│   └── pdf_corpus.txt          # Extracted PDF content
├── tools/
│   ├── extract.js              # PDF extraction
│   └── generatePrompt.js       # Prompt generation
├── .env.example                # Environment template
├── package.json
└── README.md
```

## 🎓 Learning Outcomes (PDF Concepts)

### 1. REST Principles
- ✅ Stateless architecture
- ✅ Resource-based design
- ✅ Uniform interface
- ✅ Client-server separation

### 2. HTTP Methods
- ✅ GET - Retrieve data
- ✅ POST - Create data
- ✅ PUT - Update data
- ✅ DELETE - Remove data

### 3. Security (PDF Lecture 3)
- ✅ Authentication vs Authorization
- ✅ JWT token-based auth
- ✅ CORS configuration
- ✅ XSS prevention
- ✅ DDoS protection
- ✅ Secure headers

### 4. API Design Best Practices
- ✅ RESTful naming (nouns, not verbs)
- ✅ Proper status codes
- ✅ Error handling
- ✅ Pagination
- ✅ Filtering

## 🚦 HTTP Status Codes (PDF Guidelines)

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Internal error |
| 501 | Not Implemented | Feature not configured |

## 📝 Error Response Format

Consistent error structure:
```json
{
  "error": {
    "message": "Human readable message",
    "code": "MACHINE_READABLE_CODE",
    "details": null or array
  }
}
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `CORS_ORIGIN` | Allowed origins | * |
| `LOG_FORMAT` | Morgan format | dev |
| `JWT_SECRET` | JWT secret | (required) |

## 🎯 PDF Assignment Extensions

PDFs mein diye gaye assignments implement kar sakte hain:

### 1. Database Integration
- MongoDB ya MySQL connect karein
- In-memory storage replace karein
- Migrations add karein

### 2. Advanced Authentication
- Password hashing (bcrypt)
- Refresh tokens
- OAuth 2.0 integration
- Email verification

### 3. Additional Resources (PDF Examples)
- **University System**: Students, Courses, Teachers
- **E-Commerce**: Products, Cart, Orders, Payments
- **Library System**: Books, Members, Borrowing

### 4. Advanced Features
- File upload
- Search functionality
- Advanced filtering
- Sorting options
- Caching (Redis)

### 5. Deployment
- Cloud deployment (Render, Railway)
- Docker containerization
- CI/CD pipeline
- Production configs

## 📚 References (PDF Citations)

- REST architectural style - Roy Fielding (2000)
- HTTP Protocol - RFC 2616
- JWT Standard - RFC 7519
- OAuth 2.0 - IETF Standard
- OWASP Security Guidelines

## 🤝 Contributing

Improvements ke liye pull requests welcome hain!

## 📄 License

Educational purposes ke liye.

---

**Note:** Yeh implementation PDFs ke sab concepts cover karta hai:
- ✅ REST API Design principles
- ✅ Complete CRUD implementation
- ✅ Security best practices (CORS, XSS, DDoS, JWT)
- ✅ Authentication & Authorization
- ✅ Session handling (token-based)
- ✅ Case studies (Users, Books, Items)
