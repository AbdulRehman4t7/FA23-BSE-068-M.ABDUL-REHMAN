# 🍕 Online Food Ordering System

A modern, professional food ordering web application built with Node.js, Express, MySQL, and Bootstrap 5. Inspired by popular food delivery platforms like Foodpanda and Uber Eats.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Express](https://img.shields.io/badge/Express-v4.21-blue)
![Bootstrap](https://img.shields.io/badge/Bootstrap-v5.3-purple)
![MySQL](https://img.shields.io/badge/MySQL-v8.0-orange)

---

## 📋 Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Roman Urdu Overview](#roman-urdu-overview)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Seeding Sample Data](#seeding-sample-data)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)

---

## ✨ Features

### 🏠 Home Page
- **Hero Section** with animated food images
- **Real-time Statistics** (Total menu items, orders, delivery time)
- **Category Browser** with 6 food categories
- **Featured Menu Items** showcase
- **How It Works** section with 3-step process
- **Promotional Banner** with call-to-action

### 🍔 Menu Management
- **CRUD Operations** (Create, Read, Update, Delete)
- **Category-based Filtering**
- **Responsive Card Layout**
- **Image Support** for menu items
- **Availability Toggle**
- **Price Management**

### 📦 Order Management
- **Order Creation** with customer details
- **Order Status Tracking** (Pending, Confirmed, Preparing, Out for Delivery, Delivered)
- **Order History** with detailed view
- **Customer Information** management

### 🎨 UI/UX Features
- **Fully Responsive Design** (Mobile, Tablet, Desktop)
- **Modern Glassmorphism Effects**
- **Smooth Animations** and transitions
- **Bootstrap 5 Components**
- **Bootstrap Icons** integration
- **Professional Color Scheme** with gradients
- **Dark Theme** with teal/green accents

---

## 🛠️ Technologies Used

### Backend
- **Node.js** (v18+) - JavaScript runtime
- **Express.js** (v4.21) - Web application framework
- **Sequelize** (v6.37) - ORM for MySQL
- **MySQL2** (v3.11) - MySQL database driver
- **dotenv** (v16.4) - Environment variable management

### Frontend
- **EJS** (v3.1) - Templating engine
- **Bootstrap 5.3** - CSS framework
- **Bootstrap Icons** (v1.11) - Icon library
- **Custom CSS** - Additional styling with gradients and animations

### Middleware & Utilities
- **body-parser** - Parse incoming request bodies
- **method-override** - Support PUT and DELETE methods
- **morgan** - HTTP request logger
- **express-ejs-layouts** - Layout support for EJS

---

## 📝 Roman Urdu Overview

- Ye ek full-stack web app hai jisme Node.js (Express), MySQL (Sequelize ORM), EJS templates aur Bootstrap UI use hua hai.
- Kaam kaise hota hai:
  - Request aati hai Express app (`app.js`) par.
  - Middleware run hota hai (static files, forms parsing, method override).
  - Route files (`routes/menuItems.js`, `routes/orders.js`) business logic handle karte hain.
  - Data Sequelize models (`models/MenuItem.js`, `models/Order.js`) ke through MySQL me store hota hai.
  - Views EJS (`views/*.ejs`) se render hoti hain, layout `views/layout.ejs` use karta hai.
  - Styling `public/css/styles.css` me custom gradients aur components se hoti hai.
- Home page par stats, featured items, aur quick actions nazar aate hain.
- Menu Items aur Orders dono ke liye CRUD screens maujood hain.

---

## 📁 Project Structure

```
online-food-ordering-system/
│
├── config/
│   ├── database.js          # Database configuration
│   └── .env                  # Environment variables (not in repo)
│
├── models/
│   ├── MenuItem.js           # MenuItem model (Sequelize)
│   └── Order.js              # Order model (Sequelize)
│
├── routes/
│   ├── menuItems.js          # Menu item routes
│   └── orders.js             # Order routes
│
├── views/
│   ├── layout.ejs            # Main layout template
│   ├── index.ejs             # Home page
│   ├── 404.ejs               # Error page
│   ├── menu-items/           # Menu item views
│   │   ├── index.ejs         # List all items
│   │   ├── show.ejs          # View single item
│   │   ├── new.ejs           # Create new item
│   │   └── edit.ejs          # Edit item
│   └── orders/               # Order views
│       ├── index.ejs         # List all orders
│       ├── show.ejs          # View single order
│       ├── new.ejs           # Create new order
│       └── edit.ejs          # Edit order
│
├── public/
│   └── css/
│       └── styles.css        # Custom CSS styles
│
├── seeders/
│   ├── seedMenuItems.js      # Seed menu items
│   ├── seedOrders.js         # Seed orders
│   └── README.md             # Seeder documentation
│
├── app.js                    # Main application file
├── package.json              # Dependencies and scripts
├── .env.example              # Example environment variables
└── README.md                 # This file
```

---

## 🧠 How It Works

- Entry Point: `app.js`
  - View engine: EJS + express-ejs-layouts
  - Static files: `public/` (CSS, images, etc.)
  - Middleware: body-parser, method-override (`?_method=PUT|DELETE`), morgan
  - Routes mount:
    - `/menu-items` → menu item CRUD
    - `/orders` → order CRUD
  - Home (`/`): DB se counts + featured items fetch karke `views/index.ejs` render.

- Data Layer (Sequelize + MySQL)
  - `MenuItem` model: name, description, price, category, isAvailable
  - `Order` model: customerName, customerPhone, status
  - Many-to-Many: `Order` ↔ `MenuItem` via `OrderItem` with `quantity`
  - `sequelize.sync()` tables create karta hai agar missing hon.

- Presentation Layer (EJS)
  - `views/layout.ejs`: common navbar, shell, scripts
  - `views/index.ejs`: hero + stats + featured list
  - `views/menu-items/*.ejs` and `views/orders/*.ejs`: CRUD pages
  - `public/css/styles.css`: dark theme + teal/green gradients & components

- Seeders
  - `seeders/seedMenuItems.js`: 20 sample menu items
  - `seeders/seedOrders.js`: 8 sample orders
  - Scripts: `npm run seed:menu`, `npm run seed:orders`, `npm run seed:all`

---

## 🚀 Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/online-food-ordering-system.git
cd online-food-ordering-system
```

### Step 2: Install Dependencies
```bash
npm install
```

---

## ⚙️ Configuration

### Step 1: Create Environment File
Copy the example environment file:
```bash
cp .env.example config/.env
```

### Step 2: Configure Database
Edit `config/.env` with your MySQL credentials:

```env
DB_NAME=food_ordering_db
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=127.0.0.1
PORT=3000
```

---

## 🗄️ Database Setup

### Step 1: Create Database
Open MySQL and create the database:

```sql
CREATE DATABASE food_ordering_db;
```

### Step 2: Run the Application
The application will automatically create tables on first run:

```bash
npm start
```

Sequelize will sync models and create the following tables:
- `MenuItems` - Stores menu item information
- `Orders` - Stores order information
- `OrderItems` - Junction table for order-menu item relationship

---

## 🏃 Running the Application

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at:
```
http://localhost:3000
```

---

## 🌱 Seeding Sample Data

To populate your database with sample data for testing:

### Seed Menu Items (20 items)
```bash
npm run seed:menu
```

This adds:
- 4 Pizza items
- 3 Burger items
- 2 Salad items
- 3 Pasta items
- 2 Appetizers
- 2 Sides
- 2 Desserts
- 3 Beverages

### Seed Orders (8 orders)
```bash
npm run seed:orders
```

### Seed Everything
```bash
npm run seed:all
```

**Note:** Seeders will not run if data already exists. To re-seed, delete existing data first.

---

## 📖 Usage

### Home Page
- Visit `http://localhost:3000`
- Browse featured menu items
- View categories
- See real-time statistics

### Menu Items
- **View All**: Navigate to `/menu-items`
- **Add New**: Click "Add New Item" button
- **Edit**: Click edit icon on any item card
- **Delete**: Click delete icon and confirm
- **View Details**: Click on item card

### Orders
- **View All**: Navigate to `/orders`
- **Create New**: Click "New Order" button
- **Edit**: Click edit icon in actions column
- **Delete**: Click delete icon and confirm
- **View Details**: Click on order ID

---

## 🔌 API Endpoints

Although ye primarily server-side rendered app hai, routes structured hain:

### Menu Items
- GET `/menu-items` – List all items
- GET `/menu-items/new` – New item form
- POST `/menu-items` – Create item
- GET `/menu-items/:id` – Show item
- GET `/menu-items/:id/edit` – Edit form
- PUT `/menu-items/:id` – Update item
- DELETE `/menu-items/:id` – Delete item

### Orders
- GET `/orders` – List all orders
- GET `/orders/new` – New order form
- POST `/orders` – Create order
- GET `/orders/:id` – Show order
- GET `/orders/:id/edit` – Edit form
- PUT `/orders/:id` – Update order
- DELETE `/orders/:id` – Delete order

