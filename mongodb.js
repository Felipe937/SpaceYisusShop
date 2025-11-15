const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://felipevargass24a_db_user:hIwMSJJqzdJg9b4U@cluster0.p6ghqet.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri);
let database;

async function connectDB() {
    if (!database) {
        await client.connect();
        database = client.db("tienda_colombia");
        console.log("✅ Conectado a MongoDB");
    }
    return database;
}

// Obtener todos los productos
async function getProductos() {
    const db = await connectDB();
    return await db.collection("productos").find({}).toArray();
}

// Obtener producto por ID
async function getProductoById(id) {
    const db = await connectDB();
    return await db.collection("productos").findOne({ _id: id });
}

// Obtener productos por categoría
async function getProductosByCategoria(categoria) {
    const db = await connectDB();
    return await db.collection("productos").find({ categoria: categoria }).toArray();
}

module.exports = {
    connectDB,
    getProductos,
    getProductoById,
    getProductosByCategoria
};
