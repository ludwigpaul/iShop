import db from '../models/index.js';
import logger from '../logger/logger.js';

const Products = db.Products;
// The repository for managing products in the ishop database.
// The purpose of this repository is to provide functions for CRUD operations on products.

// Get all products with pagination
export const getAllProducts = async (page = 1, limit = 10) => {
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.max(1, parseInt(limit) || 10);
    const offset = (page - 1) * limit;

    logger.info(`Getting all products with pagination. Page: ${page}, Limit: ${limit}`);
    const {count, rows} = await Products.findAndCountAll({
        offset: offset,
        limit: limit,
        include: [{
            model: db.Categories,
            as: 'category',
            attributes: ['id', 'name']
        }]
    });
    logger.info(`Getting all products. Total products: ${count}, Page: ${page}, Limit: ${limit}`);
    return { items: rows, total: count, page, limit };
};

// Function to get products with category name
const getProductsWithCategory = async () => {
    const productsWithCategory = await db.Products.findAll({
        include: [{
            model: db.Categories,
            as: 'category',
            attributes: ['id', 'name']
        }]
    });
    logger.info(`Getting products with category. Total products: ${productsWithCategory.length}`);
    return productsWithCategory;
};

// Function to get a product by ID
const getProductById = async (id) => {
    if (!id) {
        logger.warn('No product ID provided');
        return undefined;
    }
    const product = await Products.findByPk(id);
    logger.info(`Getting product with ID: ${id}`);
    return product;
};

// Function to create a new product
const createProduct = async (product) => {
    const newProduct = await Products.create(product);
    logger.info(`Creating new product: ${newProduct.name} with ID: ${newProduct.id}`);
    return newProduct;
};

// Function to update a product by ID
const updateProduct = async (id, product) => {
    const updatedProduct = await Products.update(product, {
        where: { id: id },
        returning: true,
        plain: true
    });
    logger.info(`Updating product with ID: ${id}`);
    return updatedProduct[1]; // Return the updated product
};

// Function to delete a product by ID
const deleteProduct = async (id) => {
    const count = await Products.destroy({ where: { id: id } });
    logger.info(`Deleting product with ID: ${id}`);
    return count > 0 ? { message: 'Product deleted successfully' } : { message: 'Product not found' };
};

// Function to find products by name or description
const findProducts = async (searchTerm) => {
    const products = await Products.findAll({
        where: {
            [db.Sequelize.Op.or]: [
                { name: { [db.Sequelize.Op.like]: `%${searchTerm}%` } },
                { description: { [db.Sequelize.Op.like]: `%${searchTerm}%` } }
            ]
        }
    });
    logger.info(`Finding products with search term: ${searchTerm}. Total found: ${products.length}`);
    return products;
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
