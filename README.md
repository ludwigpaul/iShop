# iShop E-Commerce System

## Introduction
iShop is a full-stack e-commerce platform built with React.js (frontend), Node.js/Express.js (backend), and MySQL (database). It supports user registration, product browsing, order management, admin and worker dashboards, and secure authentication.

---

## System Architecture

- **Frontend:** React.js (Material UI, React Router)
- **Backend:** Node.js, Express.js (REST API)
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)
- **Email:** Nodemailer for email verification and notifications

---

## Features

### User Features
- Register, verify email, and login
- Browse products and categories
- Add products to cart and place orders
- View and update profile
- View order history and order details

### Admin Features
- Admin login (JWT protected)
- View all users
- View all orders (with assigned worker name or "Not assigned yet")
- Assign orders to workers
- View all workers
- View orders assigned to a specific worker

### Worker Features
- Worker login (JWT protected)
- View assigned orders
- Mark orders as completed (triggers email notification to user)

---

## Repository Pattern

- All database queries are handled in the `repositories/` directory.
- Controllers handle HTTP requests and call service/repository functions.
- Routes are clean and only call controller or repository functions.

---

## REST API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/login/worker` - Worker login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/verify-email` - Email verification

### User
- `GET /api/v1/users` - List all users (admin only)
- `GET /api/v1/users/id/:id` - Get user by ID
- `PUT /api/v1/users/id/:id` - Update user profile

### Products & Categories
- `GET /api/v1/products` - List all products
- `GET /api/v1/products/id/:id` - Get product by ID
- `GET /api/v1/categories` - List all categories

### Orders
- `GET /api/v1/orders` - List all orders (admin only)
- `POST /api/v1/orders/checkout` - Create new order
- `POST /api/v1/orders/complete/:orderId` - Mark order as completed (worker only)
- `GET /api/v1/worker/:workerId/orders` - Get orders assigned to a worker

### Admin
- `POST /api/v1/admin/login` - Admin login
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/orders` - Get all orders with worker name
- `POST /api/v1/admin/assign-order` - Assign order to worker
- `GET /api/v1/admin/workers` - Get all workers
- `GET /api/v1/admin/worker/:workerId/orders` - Get orders for a worker

---

## Database Schema (Key Tables)

### Users
```sql
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('USER', 'ADMIN', 'WORKER') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Workers
```sql
CREATE TABLE Workers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);
```
### Products
```sql

CREATE TABLE Products (
                        id INT PRIMARY KEY AUTO_INCREMENT,
                        name VARCHAR(255) NOT NULL,
                        description TEXT,
                        price DECIMAL(10, 2) NOT NULL,
                        stockQuantity INT DEFAULT 0,
                        category_id INT,
                        FOREIGN KEY (category_id) REFERENCES Categories(id)
);
```
### Orders
```sql
CREATE TABLE Orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    worker_id INT,
    status VARCHAR(20) DEFAULT 'pending',
    estimated_arrival DATETIME,
    completed_at DATETIME,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (product_id) REFERENCES Products(id),
    FOREIGN KEY (worker_id) REFERENCES Workers(id)
);
```
### Categories
```sql
CREATE TABLE Categories (
                          id INT PRIMARY KEY AUTO_INCREMENT,
                          name VARCHAR(255) NOT NULL UNIQUE,
                          description TEXT
);
```
## TECH STACK
- **Frontend**: React.js, HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Docker, Nginx
- **Version Control**: Git, GitHub
- **Testing**: Jest, Mocha, Chai
- **API Documentation**: Swagger

## Project Structure
```
ishop/
├── config/
├── ├── db.config.js
├── models/
├── ├── schema.sql  
├── app.js
├── .env
├── package.json
├── package-lock.json
├── routes/
├── ├── productRoutes.js
├── ├── orderRoutes.js
├── ├── categoryRoutes.js
├── ├── userRoutes.js
├── ├── authRoutes.js
├── middleware/
├── ├── authMiddleware.js
├── controllers/
├── ├── productController.js
├── ├── orderController.js
├── ├── categoryController.js
├── ├── userController.js
├── ├── authController.js
├── services/
├── ├── productRoutes.js
├── ├── orderService.js
├── ├── categoryService.js
├── ├── userService.js
├── repositories/
├── ├── productRepository.js
├── ├── orderRepository.js
├── ├── categoryRepository.js
├── ├── userRepository.js

ishop-frontend/
├── node_modules/
├── public/
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── Navbar.js
│   ├── pages/
│   │   ├── Cart.js
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── Order.js
│   │   ├── ProductDetails.js
│   │   ├── Products.js
│   │   ├── Profile.js
│   │   └── Register.js
│   ├── services/
│   │   └── api.js
│   ├── store/
│   │   ├── index.js
│   │   └── slices/
│   │       └── cartSlice.js
│   ├── utils/
│       └── encryption.js
│   ├── App.js
│   ├── index.js
│   └── theme.js
├── .env
├── package.json
└── README.md


```

## Libraries and Dependencies
- **Express.js**: Web framework for Node.js to build RESTful APIs.
- **MySQL**: Relational database management system for storing data.
- **Morgan**: HTTP request logger middleware for Node.js.
- **nodemon**: Utility that monitors for changes in the source code and automatically restarts the server.
- **dotenv**: Module to load environment variables from a `.env` file.
- **mysql2**: MySQL client for Node.js to interact with the database.
- **express**: Web framework for building APIs.
- **jsonwebtoken**: Library for handling JSON Web Tokens for user authentication.
- **bcryptjs**: Library for hashing passwords securely.
- **cors**: Middleware for enabling Cross-Origin Resource Sharing.
- **body-parser**: Middleware for parsing incoming request bodies in a middleware before your handlers, available under the `req.body` property.
- **


## How to Run the Project
1. Install Node.js and MySQL on your machine.
2. Go to the project directory.
3. Run `npm install` to install the dependencies.
4. Create a `.env` file in the root directory and configure your database connection settings.
5. Run `npm start dev` to start the server.

## Running Integration Tests

1. Make sure Docker is running.
2. In your project directory, run:
   ```
   docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
   ```
   This will:
   - Start a MySQL test database container.
   - Build and run your app container, which will execute the integration tests.
   - Stop all containers when tests finish.

3. To clean up containers and volumes after the test run:
   ```
   docker-compose -f docker-compose.test.yml down -v
   ```

## Conclusion
The iShop e-commerce system is designed to provide a comprehensive online shopping experience.
It includes features for product management, order processing, and user interaction.
The system is built with scalability and maintainability in mind.

## Future Enhancements
- **User Management**: Implement user registration, authentication, and profile management.
- **Payment Integration**: Integrate payment gateways for secure transactions.
- **Search Optimization**: Enhance search functionality with advanced filtering and sorting options.
- **Analytics Dashboard**: Provide insights into sales, user behavior, and product performance.
- **Mobile Application**: Develop a mobile app for iOS and Android to enhance user accessibility.
- **Recommendation System**: Implement a recommendation engine to suggest products based on user behavior and preferences.
- **Admin Dashboard**: Create an admin interface for managing products, orders, and users.
- **Promotions and Discounts**: Implement a system for managing promotions, discounts, and coupons.
- **Customer Support**: Integrate a customer support system for handling inquiries and issues.
- **Multi-language Support**: Add support for multiple languages to cater to a global audience.
