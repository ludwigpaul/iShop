import productService from '../services/productService.js';

export const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const products = await productService.getAllProducts(page, limit);
        res.status(200).json({ products});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getProductsWithCategory = async (req, res) => {
    try {
        const products = await productService.getProductsWithCategory();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await productService.updateProduct(req.params.id, req.body);
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export async function deleteProduct(req, res) {
    try {
        const result = await productService.deleteProduct(req.params.id);
        res.send({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const findProducts = async (req, res) => {
    try {
        const products = await productService.findProducts(req.query.searchTerm);
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
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
}