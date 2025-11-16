import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://felipevargass24a_db_user:hIwMSJJqzdJg9b4U@cluster0.p6ghqet.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri);
let database;

export async function connectDB() {
    if (!database) {
        await client.connect();
        database = client.db("tienda_colombia");
        console.log("✅ Conectado a MongoDB");
    }
    return database;
}

export async function getProductos() {
    const db = await connectDB();
    return await db.collection("productos").find({}).toArray();
}

export async function getProductoById(id) {
    const db = await connectDB();
    return await db.collection("productos").findOne({ _id: id });
}
