import express from 'express';
import { readCarts, writeCarts } from '../fileService.js';

const router = express.Router();

/* Ruta GET /:cid para listar los productos de un carrito específico */

router.get('/:cid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const carts = await readCarts();
        const cart = carts.find(c => c.id === cartId);

        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        res.json(cart.products);
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).send('Error interno del servidor');
    }
});

/* Ruta POST /:cid/product/:pid para agregar un producto al carrito */

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const productId = parseInt(req.params.pid);

        const carts = await readCarts();
        const cart = carts.find(c => c.id === cartId);

        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        const productInCart = cart.products.find(p => p.product === productId);

        if (productInCart) {
            productInCart.quantity += 1;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }

        await writeCarts(carts);
        res.status(200).json(cart.products);
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).send('Error interno del servidor');
    }
});

export default router;
