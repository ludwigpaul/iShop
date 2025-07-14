import db from '../models/index.js';
import logger from '../logger/logger.js';
const Categories = db.Categories;

// The repository for managing categories in the ishop database.
// The purpose of this repository is to provide functions for CRUD operations on categories.

// Function to get all categories
const getAllCategories = async () => {
    const categories = await Categories.findAll();
    logger.info(`Getting all categories. Total categories: ${categories.length}`);
    return categories;
};

// Function to get a category by ID
const getCategoryById = async (id) => {
    const category = await Categories.findByPk(id);
    logger.info(`Getting category with ID: ${id}`);
    return category;
};

// Function to create a new category
const createCategory = async (category) => {
    const newCategory = await Categories.create(category);
    logger.info(`Creating new category: ${newCategory.name} with ID: ${newCategory.id}`);
    return newCategory;
};

// Function to update a category by ID
const updateCategory = async (id, category) => {
    const updatedCategory = await Categories.update(category, {
        where: { id: id },
        returning: true,
        plain: true
    });
    logger.info(`Updating category with ID: ${id}`);
    return updatedCategory[1];
};

// Function to delete a category by ID
const deleteCategory = async (id) => {
    const count = await Categories.destroy({where: {id: id}});
    logger.info(`Deleting category with ID: ${id}`);
    return count > 0 ? { message: 'Category deleted successfully' } : { message: 'Category not found' };
};

// Function to find categories by name or description
const findCategories = async (searchTerm) => {
    const categories = await Categories.findAll({
        where: {
            [db.Sequelize.Op.or]: [
                { name: { [db.Sequelize.Op.like]: `%${searchTerm}%` } },
                { description: { [db.Sequelize.Op.like]: `%${searchTerm}%` } }
            ]
        }
    });
    logger.info(`Finding categories with search term: ${searchTerm}. Total found: ${categories.length}`);
    return categories;
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