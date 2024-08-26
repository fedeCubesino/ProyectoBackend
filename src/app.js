import express from 'express';
import productsRouter from '../routes/products.js';
import cartsRouter from '../routes/carts.js';

const app = express();

app.use(express.static('public'));
app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

