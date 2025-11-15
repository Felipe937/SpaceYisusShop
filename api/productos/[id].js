// api/productos/[id].js
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'ID del producto es requerido' });
  }

  try {
    await client.connect();
    const db = client.db('tienda_colombia');
    
    // Intentar buscar por _id (ObjectId) primero
    let producto;
    try {
      producto = await db.collection('productos').findOne({ 
        _id: ObjectId(id) 
      });
    } catch (e) {
      // Si falla, intentar buscar por slug o id como string
      producto = await db.collection('productos').findOne({
        $or: [
          { _id: id },
          { slug: id },
          { id: id }
        ]
      });
    }

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json(producto);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
  } finally {
    await client.close();
  }
}
