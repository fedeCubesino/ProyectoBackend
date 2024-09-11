import express from 'express';
import { readProducts, writeProducts } from '../fileService.js'; 

const router = express.Router();

/* Ruta POST / para agregar un nuevo producto */

router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, stock, category, thumbnails } = req.body;

        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).send('Todos los campos son obligatorios, excepto thumbnails');
        }

        const products = await readProducts(); 
        const newProduct = {
            id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
            title,
            description,
            code,
            price,
            status: true,
            stock,
            category,
            thumbnails: thumbnails || []
        };

        products.push(newProduct);
        await writeProducts(products); 
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error al agregar producto:', error);
        res.status(500).send('Error interno del servidor');
    }
});

/* Ruta GET / para listar todos los productos con limitación */

router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit);
        const products = await readProducts(); 
        const limitedProducts = limit ? products.slice(0, limit) : products;
        res.json(limitedProducts);
    } catch (error) {
        console.error('Error al listar productos:', error);
        res.status(500).send('Error interno del servidor');
    }
});

/* Ruta GET /:pid para obtener un producto por ID */

router.get('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const products = await readProducts(); 
        const product = products.find(p => p.id === productId);

        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }

        res.json(product);
    } catch (error) {
        console.error('Error al obtener producto por ID:', error);
        res.status(500).send('Error interno del servidor');
    }
});
/* Ruta DELETE /:pid para eliminar un producto por ID */

router.delete('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        let products = await readProducts(); 
        products = products.filter(p => p.id !== productId); 

        await writeProducts(products); 
        res.status(200).send('Producto eliminado');
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).send('Error interno del servidor');
    }
});

export default router;
