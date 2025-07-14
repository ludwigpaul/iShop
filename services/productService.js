import productRepository from '../repositories/productRepository.js';

export const getAllProducts = async (page = 1, limit = 10) => {
    return await productRepository.getAllProducts(page, limit);
};

export const getProductById = async (id) => {
    return await productRepository.getProductById(id);
};

export const getProductsWithCategory = async () => {
    return await productRepository.getProductsWithCategory();
};

export const createProduct = async (product) => {
    return await productRepository.createProduct(product);
};

export const updateProduct = async (id, product) => {
    return await productRepository.updateProduct(id, product);
};

export const deleteProduct = async (id) => {
    return await productRepository.deleteProduct(id);
};

export const findProducts = async (searchTerm) => {
    return await productRepository.findProducts(searchTerm);
};

export default {
    getAllProducts,
    getProductById,
    getProductsWithCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    findProducts
};