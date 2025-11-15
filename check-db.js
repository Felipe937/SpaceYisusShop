const { connectDB, getProductos } = require('./mongodb.js');

async function verificarConexion() {
    try {
        await connectDB();
        const productos = await getProductos();
        console.log("✅ Conexión exitosa. Productos encontrados:", productos.length);
        
        // Mostrar información de los primeros 5 productos
        if (productos.length > 0) {
            console.log('\n📋 Muestra de productos:');
            const sample = productos.slice(0, 5);
            sample.forEach((p, i) => {
                console.log(`\nProducto ${i + 1}:`);
                console.log(`- ID: ${p._id || p.id}`);
                console.log(`- Nombre: ${p.nombre || p.name || 'Sin nombre'}`);
                console.log(`- Precio: $${(p.precio || p.price || 0).toLocaleString('es-CO')}`);
                if (p.categoria || p.category) {
                    console.log(`- Categoría: ${p.categoria || p.category}`);
                }
            });
        }
        
        return true;
    } catch (error) {
        console.error("❌ Error de conexión:", error);
        return false;
    }
}

// Ejecutar la verificación
verificarConexion()
    .then(success => {
        if (success) {
            console.log("\n✅ Verificación completada con éxito");
            process.exit(0);
        } else {
            console.error("\n❌ La verificación ha fallado");
            process.exit(1);
        }
    })
    .catch(error => {
        console.error("\n❌ Error inesperado:", error);
        process.exit(1);
    });
