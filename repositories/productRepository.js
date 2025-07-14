import {db} from '../config/dbConfig.js';

// The repository for managing products in the ishop database.
// The purpose of this repository is to provide functions for CRUD operations on products.

// Get all products with pagination
export const getAllProducts = async (page = 1, limit = 10) => {
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.max(1, parseInt(limit) || 10);
    const offset = (page - 1) * limit;
    const [products] = await db.query(
        'SELECT * FROM ishop.products LIMIT ? OFFSET ?',
        [limit, offset]
    );
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM ishop.products');
    return { products, total };
};

// Function to get products with category name
const getProductsWithCategory = async () => {
    const [rows] = await db.query(`
        SELECT p.*, c.name AS category_name 
        FROM ishop.Products p 
        JOIN ishop.Categories c ON p.category_id = c.id
    `);
    return rows;
};

// Function to get a product by ID
const getProductById = async (id) => {
    const [rows] = await db.query('SELECT * FROM ishop.Products WHERE id = ?', [id]);
    return rows[0]; // Return the first row if found
};

// Function to create a new product
const createProduct = async (product) => {
    const {name, description, price, category_id} = product;
    const [result] = await db.query('INSERT INTO ishop.Products (name, description, price, category_id) VALUES (?, ?, ?, ?)', [name, description, price, category_id]);
    return {id: result.insertId, name, description, price, category_id};
};

// Function to update a product by ID
const updateProduct = async (id, product) => {
    const {name, description, price, category_id} = product;
    await db.query('UPDATE ishop.Products SET name = ?, description = ?, price = ?, category_id = ? WHERE id = ?', [name, description, price, category_id, id]);
    return {id, name, description, price, category_id};
};

// Function to delete a product by ID
const deleteProduct = async (id) => {
    await db.query('DELETE FROM ishop.Products WHERE id = ?', [id]);
    return {message: 'Product deleted successfully'};
};

// Function to find products by name or description
const findProducts = async (searchTerm) => {
    const [rows] = await db.query('SELECT * FROM ishop.Products WHERE name LIKE ? OR description LIKE ?', [`%${searchTerm}%`, `%${searchTerm}%`]);
    return rows;
};

// Export the repository functions
export default {
    getAllProducts,
    getProductsWithCategory,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    findProducts
};
