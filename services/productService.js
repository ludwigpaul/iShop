import productRepository from '../repositories/productRepository.js';

function getErrorMessage(err) {
    return err && err.message ? err.message : String(err);
}

export const getAllProducts = async (page = 1, limit = 10) => {
    try {
        page = Math.max(1, parseInt(page) || 1);
        limit = Math.max(1, parseInt(limit) || 10);
        return await productRepository.getAllProducts(page, limit);
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

export const getProductById = async (id) => {
    if (!id) throw new Error('Product ID is required');
    try {
        return await productRepository.getProductById(id);
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

export const getProductsWithCategory = async () => {
    try {
        return await productRepository.getProductsWithCategory();
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

export const createProduct = async (product) => {
    if (!product || typeof product !== 'object') throw new Error('Product data is required');
    try {
        return await productRepository.createProduct(product);
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

export const updateProduct = async (id, product) => {
    if (!id) throw new Error('Product ID is required');
    if (!product || typeof product !== 'object') throw new Error('Product data is required');
    try {
        return await productRepository.updateProduct(id, product);
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

export const deleteProduct = async (id) => {
    if (!id) throw new Error('Product ID is required');
    try {
        return await productRepository.deleteProduct(id);
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

export const findProducts = async (searchTerm) => {
    if (!searchTerm) throw new Error('Search term is required');
    try {
        return await productRepository.findProducts(searchTerm);
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
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