// api/productos/index.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { categoria } = req.query;

  try {
    await client.connect();
    const db = client.db('tienda_colombia');
    
    let query = {};
    if (categoria) {
      query = { 
        $or: [
          { categoria: categoria },
          { category: categoria },
          { 'categoria.slug': categoria }
        ]
      };
    }

    const productos = await db.collection('productos')
      .find(query)
      .limit(50)
      .toArray();

    res.status(200).json(productos);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
  } finally {
    await client.close();
  }
}
