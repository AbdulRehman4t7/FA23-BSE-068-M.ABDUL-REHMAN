# REST API Starter (PDF-driven)

Yeh project aap ke diye gaye REST API PDFs (design, implementation, security) ko follow karte hue ek production-style Node.js + Express starter aur us par ek simple lekin polished web UI provide karta hai.

## Quick Start

1. Dependencies install:
   - Windows: `npm.cmd install`
   - General: `npm install`
2. Server start: `npm run start:api`
3. Browser par kholen:
   - Website: http://localhost:3000/
   - Health: http://localhost:3000/api/v1/health

Optional (PDF se prompt/corpus):
- Corpus build + prompt generate: `npm run build-prompt`
  - Corpus: [build/pdf_corpus.txt](file:///d:/semester%206/Advance%20web/New%20folder/build/pdf_corpus.txt)
  - Prompt: [build/project_prompt.txt](file:///d:/semester%206/Advance%20web/New%20folder/build/project_prompt.txt)

## Project Structure

- Backend
  - Server bootstrap: [server.js](file:///d:/semester%206/Advance%20web/New%20folder/project/src/server.js)
  - App config (Helmet, CORS, rate limit, routes): [app.js](file:///d:/semester%206/Advance%20web/New%20folder/project/src/app.js)
  - Routes
    - Health: [health.js](file:///d:/semester%206/Advance%20web/New%20folder/project/src/routes/v1/health.js)
    - Items CRUD: [items.js](file:///d:/semester%206/Advance%20web/New%20folder/project/src/routes/v1/items.js)
  - Middleware
    - Errors: [errorHandler.js](file:///d:/semester%206/Advance%20web/New%20folder/project/src/middleware/errorHandler.js)
    - JWT: [auth.js](file:///d:/semester%206/Advance%20web/New%20folder/project/src/middleware/auth.js)
  - OpenAPI seed: [openapi.yaml](file:///d:/semester%206/Advance%20web/New%20folder/project/src/openapi.yaml)
- Frontend (static, Express serve karta hai)
  - Page: [index.html](file:///d:/semester%206/Advance%20web/New%20folder/project/public/index.html)
  - Script: [app.js](file:///d:/semester%206/Advance%20web/New%20folder/project/public/app.js)
  - Styles: [styles.css](file:///d:/semester%206/Advance%20web/New%20folder/project/public/styles.css)
- PDF Tools
  - Extractor: [tools/extract.js](file:///d:/semester%206/Advance%20web/New%20folder/tools/extract.js)
  - Prompt generator: [tools/generatePrompt.js](file:///d:/semester%206/Advance%20web/New%20folder/tools/generatePrompt.js)
- Package scripts: [package.json](file:///d:/semester%206/Advance%20web/New%20folder/package.json)

## Backend Overview

- Versioned API: `/api/v1/*`
- Consistent error shape:
  ```json
  {
    "error": {
      "message": "Human readable",
      "code": "MACHINE_CODE",
      "details": null
    }
  }
  ```
- Security baseline: Helmet, CORS, rate limiting, input validation
- Logging: Morgan
- Optional JWT support (dev mode me JWT_SECRET ke baghair anonymous allow)

### Endpoints

- Health
  - GET `/api/v1/health` → uptime/timestamp
  - GET `/api/v1/health/ready` → readiness true

- Items (demo resource)
  - GET `/api/v1/items?page=1&pageSize=10`
  - POST `/api/v1/items` body: `{ "name": "Item A", "price": 99.99 }`
  - GET `/api/v1/items/:id`
  - PUT `/api/v1/items/:id` body: `{ "name": "New", "price": 123 }` (fields optional)
  - DELETE `/api/v1/items/:id`

### Validation

- express-validator per rules (params, query, body) aur centralized validationResult handling se 400 Bad Request deta hai jab input invalid ho.

### Error Handling

- 404 par [notFoundHandler](file:///d:/semester%206/Advance%20web/New%20folder/project/src/middleware/errorHandler.js#L1) structured JSON deta hai.
- Exceptions ya next(err) par [errorHandler](file:///d:/semester%206/Advance%20web/New%20folder/project/src/middleware/errorHandler.js#L11) status infer karke JSON return karta hai; 5xx par minimal console error bhi log hota hai.

## Frontend Overview

- Single-page static UI (no framework) jo Items resource par CRUD perform karta hai.
- Features:
  - Create form
  - List with search (client-side), sort (name/price), pagination controls
  - Modal-based edit
  - Delete + toast notifications
- Served via Express static middleware: [app.js](file:///d:/semester%206/Advance%20web/New%20folder/project/src/app.js)
- Access: http://localhost:3000/

## Libraries Ka Role (Kya kaam hai)

- express: HTTP server + routing.
- helmet: Secure HTTP headers set karta hai (XSS, clickjacking ke khilaf baseline hardening).
- cors: Cross-Origin Resource Sharing manage karta hai (allowed origins, methods, headers).
- express-rate-limit: Per-IP request limits set karta hai abuse se bachne ke liye.
- express-validator: Request input validate karta hai (params, query, body).
- morgan: HTTP request logging (dev friendly formats).
- jsonwebtoken (JWT): Tokens sign/verify karne ke liye; yahan optional auth skeleton diya gaya hai.
- dotenv: `.env` se environment vars load karta hai.
- pdf-parse: PDFs se text extract karne ke liye (prompt/corpus generation).

## Environment Variables

- `PORT` (default 3000): Server port
- `CORS_ORIGIN` (default `*`): Allowed origin(s) for CORS
- `JWT_SECRET` (optional): Set karne par JWT verification active hota hai

JWT flow (basic skeleton):
- Agar `JWT_SECRET` set hai:
  - `requireJwt` protected routes enforce kar sakti hain (401 on invalid/missing token).
  - `optionalJwt` token na ho to anonymous request allow karta hai, token ho to `req.user` set karta hai.

## Design Choices (PDFs se aligned)

- Resource-oriented paths; collections plural; semantic methods (GET/POST/PUT/DELETE).
- Correct status codes (201 create, 204 delete, 400 validation, 404 not found).
- Versioning `/api/v1` future-proofing ke liye.
- Centralized error shape for predictable clients.
- Security baseline (headers, limits, validation) + auth skeleton.
- Operability endpoints (health/ready) aur OpenAPI seed for future docs.

## Extend / Customize

- Domain change: `items` ko aapke domain (students/courses/orders) se replace karein:
  - Naya route add karein `project/src/routes/v1/<domain>.js`
  - Controller logic adjust karein (currently in-memory store)
  - UI mein columns/fields update karein
- DB Integration:
  - In-memory ke bajaye DB client add karein (e.g., PostgreSQL/Prisma)
  - Readiness check me DB health include karein
- Auth:
  - Sign-in/Sign-up endpoints add karein jo JWT issue karein
  - Protected routes par `requireJwt` lagayein

## Useful Commands

- Install deps: `npm install` (Windows me `npm.cmd install` agar PowerShell policy block ho)
- Run API + UI: `npm run start:api`
- Build corpus + prompt: `npm run build-prompt`

## Notes

- Port 3000 busy ho to doosra process band karein ya `PORT` change karein.
- Yahan UI client-side search/sort karta hai; server-side filters add karne ke liye Items GET me query params process kar sakte hain.

