# 🧪 Testing Guide - REST API

## Quick Test Commands (Postman ya cURL)

### 1️⃣ Health Check (No Auth Required)

```bash
GET http://localhost:3000/api/v1/health
```

Expected Response:
```json
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### 2️⃣ User Registration

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

Expected Response (201 Created):
```json
{
  "data": {
    "id": 1,
    "name": "Ali Ahmed",
    "email": "ali@example.com",
    "department": "Computer Science",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3️⃣ User Login

```bash
POST http://localhost:3000/api/v1/users/login
Content-Type: application/json

{
  "email": "ali@example.com",
  "password": "securepass123"
}
```

Expected Response (200 OK):
```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "Ali Ahmed",
      "email": "ali@example.com",
      "department": "Computer Science"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhbGlAZXhhbXBsZS5jb20iLCJuYW1lIjoiQWxpIEFobWVkIiwiaWF0IjoxNzA0MDY3MjAwLCJleHAiOjE3MDQxNTM2MDB9.abc123"
  }
}
```

**⚠️ Important:** Token ko copy kar lein! Aage protected endpoints ke liye chahiye hoga.

---

### 4️⃣ Get All Users

```bash
GET http://localhost:3000/api/v1/users
```

Expected Response:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Ali Ahmed",
      "email": "ali@example.com",
      "department": "Computer Science",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 5️⃣ Get All Books (with Pagination)

```bash
GET http://localhost:3000/api/v1/books?page=1&pageSize=10
```

Expected Response:
```json
{
  "data": [
    {
      "id": 1,
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "price": 500,
      "isbn": "978-0132350884"
    },
    {
      "id": 2,
      "title": "The Pragmatic Programmer",
      "author": "Andrew Hunt",
      "price": 450,
      "isbn": "978-0201616224"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

---

### 6️⃣ Filter Books by Author

```bash
GET http://localhost:3000/api/v1/books?author=Martin
```

---

### 7️⃣ Add New Book (Protected - Token Required)

```bash
POST http://localhost:3000/api/v1/books
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "title": "Design Patterns",
  "author": "Gang of Four",
  "price": 600,
  "isbn": "978-0201633610"
}
```

Expected Response (201 Created):
```json
{
  "data": {
    "id": 3,
    "title": "Design Patterns",
    "author": "Gang of Four",
    "price": 600,
    "isbn": "978-0201633610",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 8️⃣ Get Single Book

```bash
GET http://localhost:3000/api/v1/books/1
```

---

### 9️⃣ Update Book (Protected)

```bash
PUT http://localhost:3000/api/v1/books/1
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "price": 550,
  "title": "Clean Code - Updated Edition"
}
```

---

### 🔟 Delete Book (Protected)

```bash
DELETE http://localhost:3000/api/v1/books/3
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

Expected Response (204 No Content)

---

### 1️⃣1️⃣ Update User Profile (Protected - Own Profile Only)

```bash
PUT http://localhost:3000/api/v1/users/1
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "name": "Ali Ahmed Updated",
  "department": "Software Engineering"
}
```

---

### 1️⃣2️⃣ Items API (Similar to Books)

```bash
# Get all items
GET http://localhost:3000/api/v1/items?page=1&pageSize=10

# Create item
POST http://localhost:3000/api/v1/items
Content-Type: application/json

{
  "name": "Laptop",
  "price": 50000
}

# Get single item
GET http://localhost:3000/api/v1/items/1

# Update item
PUT http://localhost:3000/api/v1/items/1
Content-Type: application/json

{
  "name": "Gaming Laptop",
  "price": 75000
}

# Delete item
DELETE http://localhost:3000/api/v1/items/1
```

---

## 🔒 Testing Security Features

### Test 1: Rate Limiting (DDoS Protection)
Send 501+ requests rapidly to any endpoint:
```bash
# Should get 429 Too Many Requests after 500 requests
```

### Test 2: XSS Prevention
Try injecting script in name field:
```bash
POST http://localhost:3000/api/v1/users
Content-Type: application/json

{
  "name": "<script>alert('XSS')</script>",
  "email": "test@example.com",
  "password": "test123"
}
# Should be sanitized or rejected
```

### Test 3: Unauthorized Access
Try accessing protected endpoint without token:
```bash
POST http://localhost:3000/api/v1/books
Content-Type: application/json

{
  "title": "Test Book",
  "author": "Test",
  "price": 100
}
# Should get 401 Unauthorized
```

### Test 4: Authorization (Forbidden)
Try updating another user's profile:
```bash
# Login as user 1, then try to update user 2
PUT http://localhost:3000/api/v1/users/2
Authorization: Bearer USER_1_TOKEN
Content-Type: application/json

{
  "name": "Hacked"
}
# Should get 403 Forbidden
```

---

## 📊 Expected Error Responses

### 400 Bad Request (Validation Failed)
```json
{
  "error": {
    "message": "Validation failed",
    "code": "BAD_REQUEST",
    "details": [
      {
        "msg": "Invalid value",
        "param": "email",
        "location": "body"
      }
    ]
  }
}
```

### 401 Unauthorized (Missing/Invalid Token)
```json
{
  "error": {
    "message": "Missing token",
    "code": "UNAUTHORIZED",
    "details": null
  }
}
```

### 403 Forbidden (Insufficient Permissions)
```json
{
  "error": {
    "message": "Forbidden: You can only update your own profile",
    "code": "FORBIDDEN",
    "details": null
  }
}
```

### 404 Not Found
```json
{
  "error": {
    "message": "Book not found",
    "code": "NOT_FOUND",
    "details": null
  }
}
```

### 409 Conflict (User Already Exists)
```json
{
  "error": {
    "message": "User already exists",
    "code": "CONFLICT",
    "details": null
  }
}
```

---

## 🎯 Postman Collection

### Import karein:
1. Postman open karein
2. Import > Raw Text
3. Neeche diye gaye JSON ko paste karein

```json
{
  "info": {
    "name": "REST API - Complete",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/v1/health"
      }
    },
    {
      "name": "Register User",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/v1/users",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Ali Ahmed\",\n  \"email\": \"ali@example.com\",\n  \"password\": \"securepass123\",\n  \"department\": \"Computer Science\"\n}"
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/v1/users/login",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"ali@example.com\",\n  \"password\": \"securepass123\"\n}"
        }
      }
    },
    {
      "name": "Get All Books",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/v1/books?page=1&pageSize=10"
      }
    },
    {
      "name": "Add Book (Protected)",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/v1/books",
        "header": [
          {"key": "Content-Type", "value": "application/json"},
          {"key": "Authorization", "value": "Bearer {{token}}"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Clean Code\",\n  \"author\": \"Robert C. Martin\",\n  \"price\": 500,\n  \"isbn\": \"978-0132350884\"\n}"
        }
      }
    }
  ]
}
```

---

## ✅ Testing Checklist

- [ ] Health check working
- [ ] User registration successful
- [ ] Login returns JWT token
- [ ] Get all users working
- [ ] Get all books with pagination
- [ ] Filter books by author
- [ ] Add book with token (protected)
- [ ] Update book with token
- [ ] Delete book with token
- [ ] Update own user profile
- [ ] Cannot update other user's profile (403)
- [ ] Cannot access protected endpoints without token (401)
- [ ] Rate limiting working (429 after 500 requests)
- [ ] XSS prevention working
- [ ] Error responses consistent

---

## 🎓 Testing Tips

1. **Token Management**: Login karke token ko environment variable mein save karein Postman mein
2. **Sequential Testing**: Pehle register, phir login, phir protected endpoints test karein
3. **Error Testing**: Invalid data bhi test karein validation check karne ke liye
4. **Security Testing**: Deliberately malicious requests send karke security features verify karein

Happy Testing! 🚀
