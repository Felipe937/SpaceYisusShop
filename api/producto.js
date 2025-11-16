// api/producto.js - Código SUPER SIMPLE para probar
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // DATOS DE PRUEBA DIRECTOS - SIN MONGODB
  const productos = {
    "cargador-rapido-45w": {
      _id: "cargador-rapido-45w",
      nombre: "Cargador Rápido 45W",
      precio: 89900,
      categoria: "electronica",
      descripcion: "Cargador rápido de 45W para dispositivos móviles",
      imagen: "https://images.unsplash.com/photo-1609592810794-1c0d49c7b9bd?w=400",
      stock: 25,
      envio: "1-2 días"
    },
    "smartwatch-pro-x1": {
      _id: "smartwatch-pro-x1", 
      nombre: "Smartwatch Pro X1",
      precio: 1000960,
      categoria: "electronica",
      descripcion: "Smartwatch avanzado con múltiples funciones",
      imagen: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      stock: 10,
      envio: "2-3 días"
    }
  };

  try {
    const { id } = req.query;
    console.log('🔍 API recibió ID:', id);

    if (!id) {
      return res.status(400).json({ error: 'Falta el ID del producto' });
    }

    const producto = productos[id];

    if (producto) {
      console.log('✅ Producto encontrado:', producto.nombre);
      res.status(200).json(producto);
    } else {
      console.log('❌ Producto no encontrado');
      res.status(404).json({ error: 'Producto no encontrado' });
    }

  } catch (error) {
    console.error('💥 Error en API:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
