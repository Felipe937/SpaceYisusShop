import { getProductoById } from '../mongodb.js';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      
      console.log('🔍 API: Buscando producto ID:', id);
      
      if (!id) {
        return res.status(400).json({ error: 'Se requiere ID del producto' });
      }
      
      const producto = await getProductoById(id);
      
      if (producto) {
        console.log('✅ API: Producto encontrado:', producto.nombre);
        res.status(200).json(producto);
      } else {
        console.log('❌ API: Producto no encontrado');
        res.status(404).json({ error: 'Producto no encontrado' });
      }
    } catch (error) {
      console.error('❌ API Error:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error.message 
      });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
