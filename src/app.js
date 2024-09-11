import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import { readProducts, writeProducts } from '../fileService.js'; 
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio y nombre del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Configuración de Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views')); // La ruta a la carpeta views está correcta

// Middleware
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

// Rutas
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

// Configuración de Socket.IO
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Emitir productos actuales a los nuevos clientes
    socket.on('requestProducts', async () => {
        try {
            const products = await readProducts();
            socket.emit('products', products);
        } catch (error) {
            console.error('Error al emitir productos:', error);
        }
    });

    // Escuchar eventos de creación de productos y emitir a todos los clientes conectados
    socket.on('newProduct', async (product) => {
        try {
            const products = await readProducts();
            products.push(product);
            await writeProducts(products);
            io.emit('products', products);
        } catch (error) {
            console.error('Error al agregar nuevo producto:', error);
        }
    });

    // Escuchar eventos de eliminación de productos y emitir a todos los clientes conectados
    socket.on('deleteProduct', async (productId) => {
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
