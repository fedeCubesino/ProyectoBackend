import express from 'express';
import Product from '../models/Products.js'; 
const router = express.Router();

// Obtener productos con paginación, filtrado y ordenamiento
router.get('/', async (req, res) => {
    const { limit = 10, page = 1, sort, query } = req.query;

    // Filtro por categoría o disponibilidad (query)
    const filter = {};
    if (query) {
        filter.$or = [
            { category: query }, 
            { status: query === "true" } 
        ];
    }

    try {
        const totalProducts = await Product.countDocuments(filter); // Contar el total de productos
        const totalPages = Math.ceil(totalProducts / limit);
        const prevPage = page > 1 ? page - 1 : null;
        const nextPage = page < totalPages ? page + 1 : null;
        const hasPrevPage = prevPage !== null;
        const hasNextPage = nextPage !== null;
        const prevLink = hasPrevPage ? `http://localhost:3000/api/products?limit=${limit}&page=${prevPage}&sort=${sort}&query=${query}` : null;
        const nextLink = hasNextPage ? `http://localhost:3000/api/products?limit=${limit}&page=${nextPage}&sort=${sort}&query=${query}` : null;

        const products = await Product.find(filter)
            .limit(Number(limit))
            .skip((page - 1) * limit)
            .sort(sort ? { price: sort } : {});

        res.json({
            status: 'success',
            payload: products,
            totalPages,
            prevPage,
            nextPage,
            page: Number(page),
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink,
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});



// Obtener un producto por ID
router.get('/:pid', async (req, res) => {
    const { pid } = req.params;

    try {
        const product = await Product.findById(pid);
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        res.json({ status: 'success', data: product });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
    const { name, description, price, category, stock, status } = req.body;

    try {
        const newProduct = new Product({ name, description, price, category, stock, status });
        await newProduct.save();
        res.status(201).json({ status: 'success', data: newProduct });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Actualizar un producto
router.put('/:pid', async (req, res) => {
    const { pid } = req.params;
    const updateData = req.body;

    try {
        const updatedProduct = await Product.findByIdAndUpdate(pid, updateData, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        res.json({ status: 'success', data: updatedProduct });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Eliminar un producto
router.delete('/:pid', async (req, res) => {
    const { pid } = req.params;

    try {
        const deletedProduct = await Product.findByIdAndDelete(pid);
        if (!deletedProduct) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        res.json({ status: 'success', message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;
