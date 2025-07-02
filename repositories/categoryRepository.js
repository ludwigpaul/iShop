import {db} from '../config/dbConfig.js';

// The repository for managing categories in the ishop database.
// The purpose of this repository is to provide functions for CRUD operations on categories.

// Function to get all categories
const getAllCategories = async () => {
    const [rows] = await db.query('SELECT * FROM ishop.Categories');
    return rows;
};

// Function to get a category by ID
const getCategoryById = async (id) => {
    const [rows] = await db.query('SELECT * FROM ishop.Categories WHERE id = ?', [id]);
    return rows[0]; // Return the first row if found
};

// Function to create a new category
const createCategory = async (category) => {
    const {name, description} = category;
    const [result] = await db.query('INSERT INTO ishop.Categories (name, description) VALUES (?, ?)', [name, description]);
    return {id: result.insertId, name, description};
};

// Function to update a category by ID
const updateCategory = async (id, category) => {
    const {name, description} = category;
    await db.query('UPDATE ishop.Categories SET name = ?, description = ? WHERE id = ?', [name, description, id]);
    return {id, name, description};
};

// Function to delete a category by ID
const deleteCategory = async (id) => {
    await db.query('DELETE FROM ishop.Categories WHERE id = ?', [id]);
    return {message: 'Category deleted successfully'};
};

// Function to find categories by name or description
const findCategories = async (searchTerm) => {
    const [rows] = await db.query('SELECT * FROM  ishop.Categories WHERE name LIKE ? OR description LIKE ?', [`%${searchTerm}%`, `%${searchTerm}%`]);
    return rows;
};


// Export the repository functions
export default {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    findCategories
}