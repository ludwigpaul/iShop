import logger from "../logger/logger.js";
import productService from "../services/productService.js";

// The controller for managing categories in the ishop database.
// The purpose of this controller is to handle HTTP requests related to products.

// The controller layer is responsible for handling HTTP requests, validating input, and calling the service layer to perform business logic.
const getAllProducts = async (req, res) => {
    try {
        logger.info('Getting all products');
        const products = await productService.getProductsWithCategory();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({message: 'Error retrieving products', error});
    }
}


// Retrieves a product by its ID
const getProductById = async (req, res) => {
    try {
        const {id} = req.params;
        logger.info(`Getting product with ID: ${id}`);
        const product = await productService.getProductById(id);
        if (!product) {
            return res.status(404).json({message: 'Product not found'});
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({message: 'Error retrieving product', error});
    }
};

// Creates a new product
const createProduct = async (req, res) => {
    try {
        const product = req.body;
        logger.info('Creating new product', product);

        if (!product.name || !product.price) {
            return res.status(400).json({message: 'Name and price are required'});
        }
        const newProduct = await productService.createProduct(product);
        res.status(201).json(newProduct);
    } catch (error) {
        logger.error('Error creating product', error);

        if (error.errno === 1062) { // Unique constraint violation
            return res.status(409).json({message: 'Product already exists'});
        }

        res.status(500).json({message: 'Error creating product', error});
    }
};

// Updates an existing product
const updateProduct = async (req, res) => {
    try {
        const {id} = req.params;
        const product = req.body;
        logger.info(`Updating product with ID: ${id}`, product);

        if (!product.name && !product.price) {
            return res.status(400).json({
                message: 'At least one of name or price is required for update'
            });
        }
        const updatedProduct = await productService.updateProduct(id, product);
        if (!updatedProduct) {
            return res.status(404).json({message: 'Product not found'});
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({message: 'Error updating product', error});
    }
};

// Deletes a product by its ID
const deleteProduct = async (req, res) => {
    try {
        const {id} = req.params;
        logger.info(`Deleting product with ID: ${id}`);
        const deletedProduct = await productService.deleteProduct(id);
        if (!deletedProduct) {
            return res.status(404).json({message: 'Product not found'});
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({message: 'Error deleting product', error});
    }
};

// Finds products based on a search term
const findProducts = async (req, res) => {
    try {
        const {searchTerm} = req.query;
        logger.info(`Finding products with search term: ${searchTerm}`);
        const products = await productService.findProducts(searchTerm);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({message: 'Error finding products', error});
    }
};

// Exporting the product controller functions
export default {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    findProducts
};

