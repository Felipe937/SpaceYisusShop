const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://felipevargass24a_db_user:hIwMSJJqzdJg9b4U@cluster0.p6ghqet.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function verificarBaseDeDatos() {
    try {
        // Conectar a MongoDB
        await client.connect();
        console.log("✅ Conectado a MongoDB");

        // Obtener información de la base de datos
        const db = client.db("tienda_colombia");
        console.log(`📊 Base de datos: ${db.databaseName}`);

        // Listar todas las colecciones
        const collections = await db.listCollections().toArray();
        console.log("\n📂 Colecciones encontradas:");
        console.table(collections.map(c => ({
            'Nombre': c.name,
            'Tipo': c.type || 'collection',
            'Tamaño': c.sizeOnDisk ? `${(c.sizeOnDisk / 1024).toFixed(2)} KB` : 'N/A'
        })));

        // Verificar la colección de productos
        const productos = db.collection("productos");
        const conteoProductos = await productos.countDocuments();
        console.log(`\n🛍️  Total de productos: ${conteoProductos}`);

        // Mostrar un ejemplo de producto si existe
        if (conteoProductos > 0) {
            console.log("\n📝 Ejemplo de producto:");
            const ejemplo = await productos.findOne();
            console.log(JSON.stringify(ejemplo, null, 2));
        } else {
            console.log("\nℹ️ No hay productos en la colección. La base de datos está vacía.");
            
            // Mostrar cómo se vería un producto de ejemplo
            console.log("\n📋 Estructura de ejemplo para un producto:");
            const ejemploEstructura = {
                nombre: "Ejemplo de Producto",
                descripcion: "Esta es una descripción de ejemplo",
                precio: 99990,
                categoria: "electronica",
                imagen: "https://ejemplo.com/imagen.jpg",
                stock: 10,
                fecha_creacion: new Date()
            };
            console.log(JSON.stringify(ejemploEstructura, null, 2));
        }

        // Verificar índices
        const indices = await productos.indexes();
        console.log("\n🔍 Índices de la colección 'productos':");
        if (indices.length > 0) {
            console.table(indices.map(i => ({
                'Nombre': i.name,
                'Campos': JSON.stringify(i.key).replace(/[{"}]/g, '').replace(/:/g, ': '),
                'Único': i.unique ? '✅' : '❌',
                'Tipo': i.unique ? 'Único' : 'Estándar'
            })));
        } else {
            console.log("ℹ️ No se encontraron índices personalizados.");
        }

    } catch (error) {
        console.error("\n❌ Error al verificar la base de datos:");
        console.error(error.message);
        
        // Mostrar sugerencias de solución para errores comunes
        if (error.message.includes('bad auth')) {
            console.log("\n🔑 Error de autenticación. Verifica las credenciales en la cadena de conexión.");
        } else if (error.message.includes('ECONNREFUSED')) {
            console.log("\n🔌 No se pudo conectar al servidor. Verifica que MongoDB esté en ejecución y accesible.");
        } else if (error.message.includes('bad db name')) {
            console.log("\n🏷️ Nombre de base de datos no válido. Verifica el nombre en la cadena de conexión.");
        }
    } finally {
        if (client) {
            await client.close();
            console.log("\n🔒 Conexión cerrada");
        }
    }
}

// Mostrar información de la conexión
console.log("🔍 Iniciando verificación de la base de datos...");
console.log(`📡 Intentando conectar a: ${uri.split('@')[1] || uri}`);

// Ejecutar la verificación
verificarBaseDeDatos()
    .then(() => console.log("\n✨ Verificación completada"))
    .catch(console.error);
