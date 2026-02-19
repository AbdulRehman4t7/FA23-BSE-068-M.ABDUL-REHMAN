# CRUD Examples (MongoDB, MySQL, SQLite)
<p align="center">
  <img src="https://github.com/user-attachments/assets/38b09736-8677-4cc1-8cf3-bc2b9afc4de5" width="30%" />
  <img src="https://github.com/user-attachments/assets/92c31064-0c78-450e-a0ff-82dd80f14d05" width="30%" />
  <img src="https://github.com/user-attachments/assets/28642a4a-724b-468c-9d47-8333b7949298" width="30%" />
</p>





Simple CRUD applications built with Node.js and Express, showcasing three data stores:
- MongoDB (`mongodb_crud`) on port 3000
- MySQL (`mysql_crud`) on port 3001
- SQLite (`sqlite_crud`) on port 3002

## Project Structure
- `mongodb_crud/` — Express + Mongoose, connects to `mongodb://127.0.0.1:27017/crud_db`
- `mysql_crud/` — Express + `mysql2`, creates/uses DB `crud_op_demo`
- `sqlite_crud/` — Express + `sqlite3`, stores data in `crud_db.sqlite`

Each app serves a minimal frontend from its `public/index.html` and exposes the same REST API.

## Prerequisites
- Node.js (LTS)
- MongoDB running locally (for `mongodb_crud`)
- MySQL server running locally (for `mysql_crud`)
  - Default config uses `user=root` and empty `password` in `server.js`; update if needed

## Install and Run

MongoDB CRUD:

```bash
cd mongodb_crud
npm install
npm start
# http://localhost:3000
```

MySQL CRUD:

```bash
cd mysql_crud
npm install
npm start
# http://localhost:3001
```

SQLite CRUD:

```bash
cd sqlite_crud
npm install
npm start
# http://localhost:3002
```

## REST API (common across all apps)
- `POST /api/items` — create { name, description }
- `GET /api/items` — list all items
- `GET /api/items/:id` — get one item
- `PUT /api/items/:id` — update { name, description }
- `DELETE /api/items/:id` — delete one item

## Frontend
Open the corresponding app URL in your browser:
- MongoDB: `http://localhost:3000`
- MySQL: `http://localhost:3001`
- SQLite: `http://localhost:3002`

