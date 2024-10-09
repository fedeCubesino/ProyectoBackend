import express from 'express';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import productsRouter from './routes/products.js'; 
import cartsRouter from './routes/carts.js'; 
import Product from './models/Products.js'; 
import session from 'express-session';
import Cart from './models/Cart.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


// Configuración de Handlebars
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error conectando a MongoDB:', err));

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Ruta raíz
app.get('/', async (req, res) => {
    try {
        const products = await Product.find().lean();  
        res.render('home', { products });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});
app.get('/cart/:cid', async (req, res) => {
    const { cid } = req.params;
    
    try {
        
        const cart = await Cart.findById(cid).populate('products.product');
        if (!cart) {
            return res.status(404).render('error', { message: 'Carrito no encontrado' });
        }

        
        res.render('cart', { cart });
    } catch (error) {
        res.status(500).render('error', { message: 'Error al cargar el carrito' });
    }
});

app.engine('handlebars', handlebars.engine ({
    helpers: {
        multiply: (price, quantity) => price * quantity,
        calculateTotal: (products) => {
            return products.reduce((total, item) => total + (item.product.price * item.quantity), 0);
        }
    }
}));

app.use(session({
    secret: 'mi_secreto', 
    resave: false,
    saveUninitialized: true,
}));

app.get('/', async (req, res) => {
    if (!req.session.cartId) {
        // Si el carrito no existe en la sesión, crear uno nuevo
        const newCart = new Cart({ products: [] });
        await newCart.save();
        req.session.cartId = newCart._id; 
    }

    // Cargar productos para mostrarlos en la vista
    const products = await Product.find();
    res.render('home', { products, cartId: req.session.cartId });
});
// Inicio del servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
