import categoryService from "../services/categoryService.js";
import {logger} from "../logger/logger.js";

// The controller for managing categories in the ishop database.

// The purpose of this controller is to handle HTTP requests related to categories.

// Retrieves all categories
// TODO: Implement pagination and sorting (This can be done if you expect a large number of categories)
const getAllCategories = async (req, res) => {
    try {
        logger.info('Getting all categories');
        const categories = await categoryService.getAllCategories();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({message: 'Error retrieving categories', error});
    }
};

// Retrieves a category by its ID
const getCategoryById = async (req, res) => {
    try {
        const {id} = req.params;
        logger.info(`Getting category with ID: ${id}`);
        const category = await categoryService.getCategoryById(id);
        if (!category) {
            return res.status(404).json({message: 'Category not found'});
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({message: 'Error retrieving category', error});
    }
};

const createCategory = async (req, res) => {
    try {
        const category = req.body;
        logger.info('Creating new category', category);

        if (!category.name || !category.description) {
            return res.status(400).json({message: 'Name and description are required'});
        }
        const newCategory = await categoryService.createCategory(category);
        res.status(201).json(newCategory);
    } catch (error) {
        logger.error('Error creating category', error);

        if(error.errno === 1062) { // Unique constraint violation
            return res.status(409).json({message: 'Category already exists'});
        }

        res.status(500).json({message: 'Error creating category', error});
    }
};

const updateCategory = async (req, res) => {
    try {
        const {id} = req.params;
        const category = req.body;
        logger.info(`Updating category with ID: ${id}`, category);

        if (!category.name && !category.description) {
            return res.status(400).json({
                message: 'Name or description is' +
                    ' required'
            });
        }
        const updatedCategory = await categoryService.updateCategory(id, category);
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({message: 'Error updating category', error});
    }
};

const deleteCategory = async (req, res) => {
    try {
        const {id} = req.params;
        logger.info(`Deleting category with ID: ${id}`);
        await categoryService.deleteCategory(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({message: 'Error deleting category', error});
    }
};

const findCategories = async (req, res) => {
    try {
        const {searchTerm} = req.query;
        logger.info(`Finding categories with search term: ${searchTerm}`);

        if (!searchTerm) {
            return res.status(400).json({message: 'Search term is required'});
        }
        const categories = await categoryService.findCategories(searchTerm);
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({message: 'Error finding categories', error});
    }
};

export default {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    findCategories
};
