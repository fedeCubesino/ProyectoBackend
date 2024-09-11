import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const productsPath = path.join(__dirname, '..', 'ecommerce-server', 'productos.json');
const cartsPath = path.join(__dirname, '..', 'ecommerce-server', 'carrito.json');


async function readJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading file ${filePath}:`, err);
        return [];
    }
}


async function writeJSON(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Error writing file ${filePath}:`, err);
    }
}


export const readProducts = () => readJSON(productsPath);
export const writeProducts = (data) => writeJSON(productsPath, data);
export const readCarts = () => readJSON(cartsPath);
export const writeCarts = (data) => writeJSON(cartsPath, data);
