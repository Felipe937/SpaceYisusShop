// products.js - Usando Netlify Functions
export async function cargarProductos() {
    try {
        const response = await fetch('/.netlify/functions/productos');
        const productos = await response.json();
        mostrarProductos(productos);
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

function mostrarProductos(productos) {
    const container = document.getElementById('productos-container');
    if (!container) {
        console.error('No se encontró el contenedor de productos');
        return;
    }
    
    container.innerHTML = productos.map(producto => `
        <div class="producto">
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio.toLocaleString()}</p>
            <button onclick="agregarAlCarrito('${producto._id}')">Comprar</button>
        </div>
    `).join('');
}

// Hacer la función accesible globalmente para el evento onclick
window.agregarAlCarrito = async (productoId) => {
    try {
        // Aquí puedes implementar la lógica para agregar al carrito
        console.log('Producto agregado al carrito:', productoId);
        // Ejemplo: carrito.agregarProducto(productoId);
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
    }
};

// Cargar productos cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargarProductos);
} else {
    cargarProductos();
}
