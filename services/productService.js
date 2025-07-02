import productRepository from "../repositories/productRepository.js";

// The service for managing products in the ishop database.
// The purpose of this service is to provide functions for CRUD operations on products

const getAllProducts = async () => {
    return await productRepository.getAllProducts();
}

const getProductById = async (id) => {
    return await productRepository.getProductById(id);
}

const getProductsWithCategory = async () => {
    return await productRepository.getProductsWithCategory();
}

const createProduct = async (product) => {
    return await productRepository.createProduct(product);
}

const updateProduct = async (id, product) => {
    return await productRepository.updateProduct(id, product);
}

const deleteProduct = async (id) => {
    return await productRepository.deleteProduct(id);
}

const findProducts = async (searchTerm) => {
    return await productRepository.findProducts(searchTerm);
}

export default {
    getAllProducts,
    getProductById,
    getProductsWithCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    findProducts
}