# SYSTEM OVERVIEW OF I-SHOP E-COMMERCE SYSTEM

## Introduction
This document provides a high-level overview of the iShop e-commerce system, 
detailing its architecture, components, and interactions. 
The iShop system is designed to facilitate online shopping, 
allowing users to browse products, and complete purchases.

## System Architecture
The iShop application is built as a monolithic web application.
It consists of several key components that work together to provide a 
seamless shopping experience.

## Key Components

### 1. User Interface (UI) - This will be handled by the frontend application

### 2. Product Management - This component handles product listings.
- **Product Catalog**: Stores product details such as name, description, price, and images.
- **Product Search**: Allows users to search for products based on various criteria.
- **Product Categories**: Organizes products into categories for easier navigation.

### 3. Make Order - This component manages the order process.
- **Shopping Cart**: Allows users to add products to their cart, and make order.
- **Order Processing**: Handles the creation of orders, including payment processing and order confirmation.
- **Order History**: Stores past orders for users to view and manage.
- **Order Tracking**: Allows users to track the status of their orders.

### 4. User Management - This component handles user accounts.
- **User Registration**: Allows users to create accounts.
- **User Authentication**: Manages user login.

[//]: # (- **User Authentication**: Manages user login and logout processes.)

[//]: # (- **User Profiles**: Stores user information such as name, email, and address.)

[//]: # (- **User Preferences**: Allows users to set preferences for notifications, language, and other settings.)

[//]: # (- **User Roles**: Manages different user roles such as admin, customer, and guest.)


## Database Design
The iShop system uses a relational database to store its data.
### Key Tables
- **Products**: Contains product details including productID, name, 
  description, price, and stock quantity.
- **Orders**: Contains order details including orderID, productID, quantities,
  orderDate, statusDate and order status (PENDING, PROCESSING, SHIPPED, 
  DELIVERED).
- **Categories**: Contains identifiers and names for product categories. 
  Many products can belong to a single category.


## REST API Endpoints
The iShop system provides a RESTful API to interact with its components.
### Product Management Endpoints
- `GET /products`: Retrieve a list of ALL products.
- `GET /products/id/{id}`: Retrieve details of a specific product with a given 
  productID.
- `GET /products/name/{name}`: Retrieve products by name.
- `GET /products/category/{category}`: Retrieve products by category.
- `POST /products`: Add a new product to the catalog.
- `PUT /products/{id}`: Update an existing product.
- `DELETE /products/{id}`: Delete a product from the catalog.
- `GET /products/search?query={query}`: Search for products by a query 
  string (Search product by name or description).
- `GET /products/categories`: Retrieve a list of ALL product categories.

### Order Management Endpoints
- `GET /orders`: Retrieve a list of ALL orders.
- `GET /orders/id/{id}`: Retrieve details of a specific order with a given 
  orderID.
- `POST /orders`: Create a new order.
- `PUT /orders/{id}`: Update an existing order. (Only admin should do this 
  to update the status of the order)

### Category Management Endpoints
- `GET /categories`: Retrieve a list of ALL categories.
- `GET /categories/id/{id}`: Retrieve details of a specific category 
  with a given categoryID.
- `POST /categories`: Add a new category (name, description).
- `PUT /categories/id/{id}`: Update an existing category.
- `DELETE /categories/{id}`: Delete a category from the catalog.
- `GET /categories/search?query={query}`: Search for categories by a 
  query string (Search category by name).

### User Management Endpoints
- `POST /users/register`: Register a new user.
- `POST /users/login`: Authenticate a user and return a JWT token.
- `GET /users/profile`: Retrieve the profile of the authenticated user.
- `PUT /users/profile`: Update the profile of the authenticated user.
- `GET /users/orders`: Retrieve the order history of the authenticated user.
- `GET /users/orders/{id}`: Retrieve details of a specific order for the authenticated user.
- `PUT /users/orders/{id}`: Update the status of an order for the authenticated user (only if the user is admin).

## Database Schema Design

### Categories Table
```sql
CREATE TABLE Categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE
);

ALTER TABLE Categories ADD COLUMN `description` TEXT;

```

### Products Table
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

### Orders Table
```sql
CREATE TABLE Orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(10) DEFAULT 'PENDING',
    status_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(id)
);
```

### Users Table
<<<<<<< HEAD
```sql
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

=======
``` sql
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
>>>>>>> e42de880e5329b1422c952e6e47abfdf7ca48169
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
├── ├── dbConfig.js
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
├── controllers/
├── ├── productController.js
├── ├── orderController.js
├── ├── categoryController.js
├── services/
├── ├── productRoutes.js
├── ├── orderService.js
├── ├── categoryService.js
├── repositories/
├── ├── productRepository.js
├── ├── orderRepository.js
├── ├── categoryRepository.js


```

## Libraries and Dependencies
- **Express.js**: Web framework for Node.js to build RESTful APIs.
- **MySQL**: Relational database management system for storing data.
- **Morgan**: HTTP request logger middleware for Node.js.
- **nodemon**: Utility that monitors for changes in the source code and automatically restarts the server.
- **dotenv**: Module to load environment variables from a `.env` file.
- **mysql2**: MySQL client for Node.js to interact with the database.
- **express**: Web framework for building APIs.

## How to Run the Project
1. Install Node.js and MySQL on your machine.
2. Go to the project directory.
3. Run `npm install` to install the dependencies.
4. Create a `.env` file in the root directory and configure your database connection settings.
5. Run `npm start dev` to start the server.

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




