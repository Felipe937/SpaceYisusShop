const { MongoClient } = require('mongodb');

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
  // Solo permitir peticiones GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Método no permitido' }),
    };
  }

  try {
    const { userId } = event.queryStringParameters;
    
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Se requiere el ID de usuario' }),
      };
    }

    const db = await connectToDatabase();
    const carritos = db.collection('carritos');

    // Buscar el carrito del usuario
    const carrito = await carritos.findOne({ userId });

    // Si no existe, devolver un carrito vacío
    if (!carrito) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          userId,
          items: [],
          updatedAt: new Date(),
        }),
      };
    }

    // Obtener información detallada de los productos
    const productos = db.collection('productos');
    const itemsConDetalles = await Promise.all(
      carrito.items.map(async (item) => {
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
        ...carrito,
        items: itemsConDetalles,
      }),
    };
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Error al procesar la solicitud',
        error: error.message 
      }),
    };
  }
};
