-- Creates the database for the iShop application
CREATE DATABASE IF NOT EXISTS ishop;

USE ishop;

-- Create the Categories table
CREATE TABLE IF NOT EXISTS Categories (
     id INT PRIMARY KEY AUTO_INCREMENT,
     name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE Products (
     id INT PRIMARY KEY AUTO_INCREMENT,
     name VARCHAR(255) NOT NULL,
     description TEXT,
     price DECIMAL(10, 2) NOT NULL,
     stockQuantity INT DEFAULT 0,
     category_id INT,
     FOREIGN KEY (category_id) REFERENCES Categories(id)
);

CREATE TABLE Orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(10) DEFAULT 'PENDING',
    status_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(id)
);

ALTER TABLE Products MODIFY category_id INT NOT NULL;

-- create trigger to prevent updating the product_id and quantity on Orders table
CREATE TRIGGER prevent_order_update
    BEFORE UPDATE ON Orders
    FOR EACH ROW
BEGIN
    IF OLD.product_id <> NEW.product_id OR OLD.quantity <> NEW.quantity THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Updating product_id and quantity is not allowed';
    END IF;
END;

-- create the Users table
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
