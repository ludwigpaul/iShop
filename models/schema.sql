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

-- Add role column to Users table
ALTER TABLE Users ADD COLUMN `role` ENUM('USER', 'ADMIN') DEFAULT 'USER';

-- Added user_id, completed_at, and estimated_arrival columns to Orders table
ALTER TABLE orders
    ADD COLUMN user_id INT NOT NULL AFTER id,
    ADD COLUMN completed_at DATETIME NULL,
    ADD COLUMN estimated_arrival DATETIME NULL;

ALTER TABLE orders
    ADD CONSTRAINT fk_user
        FOREIGN KEY (user_id) REFERENCES users(id);

-- Added verification columns to Users table
ALTER TABLE ishop.users ADD COLUMN verified BOOLEAN DEFAULT FALSE;
ALTER TABLE ishop.users ADD COLUMN verificationToken VARCHAR(255);

-- Create the Workers table
CREATE TABLE workers (
                         id INT AUTO_INCREMENT PRIMARY KEY,
                         name VARCHAR(100) NOT NULL,
                         email VARCHAR(100) UNIQUE
);

ALTER TABLE orders ADD COLUMN worker_id INT;
ALTER TABLE orders ADD CONSTRAINT fk_worker FOREIGN KEY (worker_id) REFERENCES workers(id);

ALTER TABLE ishop.users MODIFY COLUMN role ENUM('USER', 'ADMIN', 'WORKER') DEFAULT 'USER';

ALTER TABLE ishop.workers
    ADD COLUMN assigned_order_id INT DEFAULT NULL;

ALTER TABLE Users ADD COLUMN `role` ENUM('USER', 'ADMIN') DEFAULT 'USER';

ALTER TABLE Users ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE Orders ADD COLUMN `user_id` INT REFERENCES Users(id);

ALTER TABLE ishop.users MODIFY COLUMN role ENUM('USER', 'ADMIN', 'WORKER') DEFAULT 'USER';

ALTER TABLE ishop.workers
    ADD COLUMN assigned_order_id INT DEFAULT NULL;

ALTER TABLE ishop.workers DROP COLUMN assigned_order_id;

ALTER TABLE ishop.orders ADD COLUMN worker_id INT;

ALTER TABLE ishop.orders
    ADD CONSTRAINT fk_worker
        FOREIGN KEY (worker_id) REFERENCES ishop.workers(id);


ALTER TABLE ishop.users ADD COLUMN `verification_token` VARCHAR(255);
ALTER TABLE ishop.users ADD COLUMN `verification_expiry` DATETIME;

ALTER TABLE ishop.users ADD COLUMN `verification_date` DATETIME;
