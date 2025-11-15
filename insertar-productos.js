const { MongoClient } = require('mongodb');

// URL de conexión a MongoDB (la misma que en mongodb.js)
const uri = "mongodb+srv://felipevargass24a_db_user:hIwMSJJqzdJg9b4U@cluster0.p6ghqet.mongodb.net/tienda_colombia?retryWrites=true&w=majority";
const client = new MongoClient(uri);

// Datos de los productos extraídos de collection.html
const productos = [
    {
        nombre: "Smartwatch Pro X1",
        descripcion: "Smartwatch de última generación con múltiples funciones de salud y seguimiento deportivo.",
        precio: 1499950,
        categoria: "electronica",
        imagen: "https://atumano.com.co/wp-content/uploads/2024/01/msg1330939853-11079.jpg",
        stock: 15,
        slug: "smartwatch-pro-x1",
        destacado: true
    },
    {
        nombre: "Cargador Rápido 45W USB-C",
        descripcion: "Cargador rápido de 45W compatible con la mayoría de dispositivos USB-C.",
        precio: 176900,
        categoria: "accesorios",
        imagen: "https://exitocol.vtexassets.com/arquivos/ids/826867/Cargador-Samsung-45W-USB-Type-C-Fast-Charge-Wall-Charger.jpg",
        stock: 50,
        slug: "cargador-rapido-45w",
        destacado: true
    },
    {
        nombre: "Nerdminer v3 Bitcoin Miner",
        descripcion: "Minería eficiente de Bitcoin con bajo consumo energético.",
        precio: 730600,
        categoria: "mineria",
        imagen: "https://ae01.alicdn.com/kf/S38202af44dfb47a7b890f2389dda1e81a.jpg",
        stock: 8,
        slug: "nerdminer-v3",
        destacado: true
    },
    {
        nombre: "Cargador Laptop 240W",
        descripcion: "Cargador de alta potencia para laptops de diferentes marcas.",
        precio: 1177200,
        categoria: "accesorios",
        imagen: "https://articulo.mercadolibre.com.co/MCO-3156196132-nuevo-cargador-de-laptop-de-240w-de-240w-compatible-con-dell-_JMS",
        stock: 12,
        slug: "cargador-laptop-240w",
        destacado: false
    },
    {
        nombre: "Lucky Miner Bitcoin LV06",
        descripcion: "Miner de Bitcoin con alta eficiencia y bajo consumo.",
        precio: 415001.39,
        categoria: "mineria",
        imagen: "https://www.cryptominerbros.com/wp-content/uploads/2025/04/LV06.webp",
        stock: 5,
        slug: "lucky-miner-bitcoin-lv06",
        destacado: false
    },
    {
        nombre: "Camiseta Algodón Premium",
        descripcion: "Camiseta de algodón 100% de alta calidad y comodidad.",
        precio: 73812.57,
        categoria: "ropa",
        imagen: "https://eu.venum.com/cdn/shop/files/a9d215321dd9da47d52d9409ba7014d592ed87ff_VENUM_05017_001___VNM___1_256x@3x.jpg",
        stock: 100,
        slug: "camiseta-algodon-premium",
        destacado: true
    },
    {
        nombre: "Avalon Nano3 4T Miner",
        descripcion: "Miner de criptomonedas de alto rendimiento y eficiencia energética.",
        precio: 2272590.93,
        categoria: "mineria",
        imagen: "https://ae01.alicdn.com/kf/Sf8a5bf463d7b458590bf2d64879e94c55.jpg",
        stock: 3,
        slug: "avalon-nano3-4t-miner",
        destacado: true
    },
    {
        nombre: "Xiaomi Redmi Airdots 2",
        descripcion: "Audífonos inalámbricos con excelente calidad de sonido y batería de larga duración.",
        precio: 233400,
        categoria: "audio",
        imagen: "https://exitocol.vtexassets.com/arquivos/ids/10981656/audifonos-xiaomi-redmi-airdots-2.jpg",
        stock: 25,
        slug: "xiaomi-redmi-airdots-2",
        destacado: true
    }
];

async function insertarProductos() {
    try {
        // Conectar a MongoDB
        await client.connect();
        console.log("✅ Conectado a MongoDB");

        // Seleccionar la base de datos y la colección
        const database = client.db("tienda_colombia");
        const collection = database.collection("productos");

        // Eliminar productos existentes (opcional, comenta esta línea si no quieres borrar los existentes)
        await collection.deleteMany({});
        console.log("🗑️  Colección 'productos' vaciada");

        // Insertar los productos
        const result = await collection.insertMany(productos);
        console.log(`✅ ${result.insertedCount} productos insertados correctamente`);

        // Crear índices para mejorar el rendimiento
        await collection.createIndex({ nombre: 1 });
        await collection.createIndex({ categoria: 1 });
        await collection.createIndex({ precio: 1 });
        await collection.createIndex({ slug: 1 }, { unique: true });
        console.log("🔍 Índices creados correctamente");

    } catch (error) {
        console.error("❌ Error al insertar productos:", error);
    } finally {
        // Cerrar la conexión
        await client.close();
        console.log("🔒 Conexión cerrada");
    }
}

// Ejecutar la función
console.log("🚀 Iniciando inserción de productos...");
insertarProductos().catch(console.error);
