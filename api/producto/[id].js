import { getProductoById } from '../../mongodb.js';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      
      console.log('🔍 API buscando producto ID:', id);
      
      const producto = await getProductoById(id);
      
      if (producto) {
        console.log('✅ Producto encontrado en API:', producto.nombre);
        res.status(200).json(producto);
      } else {
        console.log('❌ Producto no encontrado en API');
        res.status(404).json({ error: 'Producto no encontrado' });
      }
    } catch (error) {
      console.error('❌ Error en API producto:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
