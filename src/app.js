import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import { readProducts, writeProducts } from '../fileService.js'; 
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);


app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views')); 


app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());


app.get('/', async (req, res) => {
    try {
        const products = await readProducts();
        res.render('home', { products });
    } catch (error) {
        console.error('Error al cargar productos:', error);
        res.status(500).send('Error interno del servidor');
    }
});

app.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await readProducts();
        res.render('realTimeProducts', { products });
    } catch (error) {
        console.error('Error al cargar productos:', error);
        res.status(500).send('Error interno del servidor');
    }
});


io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

   
    socket.on('requestProducts', async () => {
        try {
            const products = await readProducts();
            socket.emit('products', products);
        } catch (error) {
            console.error('Error al emitir productos:', error);
        }
    });

    
    socket.on('newProduct', async (product) => {
        try {
            const products = await readProducts();
            product.id = products.length > 0 ? products[products.length - 1].id + 1 : 1; 
            products.push(product);
            await writeProducts(products);
            io.emit('products', products);
        } catch (error) {
            console.error('Error al agregar nuevo producto:', error);
        }
    });

   
    socket.on('deleteProduct', async (productId) => {
        console.log('ID del producto para eliminar:', productId);
        try {
            const products = await readProducts();
            const updatedProducts = products.filter(p => p.id !== productId);
            await writeProducts(updatedProducts);
            io.emit('products', updatedProducts);
        } catch (error) {
            console.error('Error al eliminar producto:', error);
        }
    });
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
