-- Create the iShop database
CREATE DATABASE IF NOT EXISTS ishop;
USE ishop;

-- =========================
-- Categories Table
-- =========================
CREATE TABLE IF NOT EXISTS Categories (
                                          id INT PRIMARY KEY AUTO_INCREMENT,
                                          name VARCHAR(255) NOT NULL UNIQUE
);

-- =========================
-- Products Table
-- =========================
CREATE TABLE IF NOT EXISTS Products (
                                        id INT PRIMARY KEY AUTO_INCREMENT,
                                        name VARCHAR(255) NOT NULL,
                                        description TEXT,
                                        price DECIMAL(10, 2) NOT NULL,
                                        stockQuantity INT DEFAULT 0,
                                        category_id INT NOT NULL,
                                        FOREIGN KEY (category_id) REFERENCES Categories(id)
);

-- =========================
-- Users Table
-- =========================
CREATE TABLE IF NOT EXISTS Users (
                                     id INT PRIMARY KEY AUTO_INCREMENT,
                                     username VARCHAR(50) NOT NULL UNIQUE,
                                     password VARCHAR(255) NOT NULL,
                                     email VARCHAR(100) NOT NULL UNIQUE,
                                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                     role ENUM('USER', 'ADMIN', 'WORKER') DEFAULT 'USER',
                                     verified BOOLEAN DEFAULT FALSE,
                                     verificationToken VARCHAR(255),
                                     verification_token VARCHAR(255),
                                     verification_expiry DATETIME,
                                     verification_date DATETIME
);

-- =========================
-- Workers Table
-- =========================
CREATE TABLE IF NOT EXISTS Workers (
                                       id INT PRIMARY KEY AUTO_INCREMENT,
                                       name VARCHAR(100) NOT NULL,
                                       email VARCHAR(100) UNIQUE
);

-- =========================
-- Orders Table
-- =========================
CREATE TABLE IF NOT EXISTS Orders (
                                      id INT PRIMARY KEY AUTO_INCREMENT,
                                      user_id INT NOT NULL,
                                      product_id INT NOT NULL,
                                      quantity INT NOT NULL,
                                      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                      status VARCHAR(10) DEFAULT 'PENDING',
                                      status_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                      completed_at DATETIME NULL,
                                      estimated_arrival DATETIME NULL,
                                      worker_id INT,
                                      FOREIGN KEY (user_id) REFERENCES Users(id),
                                      FOREIGN KEY (product_id) REFERENCES Products(id),
                                      FOREIGN KEY (worker_id) REFERENCES Workers(id)
);

-- =========================
-- Triggers
-- =========================
DELIMITER $$
CREATE TRIGGER prevent_order_update
    BEFORE UPDATE ON Orders
    FOR EACH ROW
BEGIN
    IF OLD.product_id <> NEW.product_id OR OLD.quantity <> NEW.quantity THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Updating product_id and quantity is not allowed';
    END IF;
END$$
DELIMITER ;