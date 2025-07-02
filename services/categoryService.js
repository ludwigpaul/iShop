import categoryRepository from '../repositories/categoryRepository.js';

// The service for managing categories in the ishop database.

// The purpose of this service is to provide functions for CRUD operations on categories
// The service layer is responsible for business logic and interacts with the repository layer to perform database operations.

const getAllCategories = async () => {
    return await categoryRepository.getAllCategories();
};

const getCategoryById = async (id) => {
    return await categoryRepository.getCategoryById(id);
};

const createCategory = async (category) => {
    return await categoryRepository.createCategory(category);
};

const updateCategory = async (id, category) => {
    return await categoryRepository.updateCategory(id, category);
};

const deleteCategory = async (id) => {
    return await categoryRepository.deleteCategory(id);
};

const findCategories = async (searchTerm) => {
    return await categoryRepository.findCategories(searchTerm);
};

export default {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    findCategories
}
