const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'spaceyisusshop';

// Conectar a MongoDB
async function connectToDatabase() {
  const client = await MongoClient.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return client.db(DB_NAME);
}

exports.handler = async (event, context) => {
  // Solo permitir peticiones PUT
  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Método no permitido' }),
    };
  }

  try {
    const { userId, items } = JSON.parse(event.body);
    
    if (!userId || !Array.isArray(items)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Faltan campos requeridos o formato inválido' }),
      };
    }

    const db = await connectToDatabase();
    const carritos = db.collection('carritos');

    // Actualizar o crear el carrito
    const result = await carritos.updateOne(
      { userId },
      {
        $set: {
          items,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Obtener el carrito actualizado
    const carritoActualizado = await carritos.findOne({ userId });

    // Obtener información detallada de los productos
    const productos = db.collection('productos');
    const itemsConDetalles = await Promise.all(
      carritoActualizado.items.map(async (item) => {
        const producto = await productos.findOne({ _id: item.productId });
        return {
          ...item,
          producto,
        };
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        ...carritoActualizado,
        items: itemsConDetalles,
      }),
    };
  } catch (error) {
    console.error('Error al actualizar el carrito:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Error al procesar la solicitud',
        error: error.message 
      }),
    };
  }
};
