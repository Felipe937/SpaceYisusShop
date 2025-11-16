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
  // Solo permitir peticiones POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Método no permitido' }),
    };
  }

  try {
    const { userId, productId, quantity = 1 } = JSON.parse(event.body);
    
    if (!userId || !productId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Faltan campos requeridos' }),
      };
    }

    const db = await connectToDatabase();
    const carritos = db.collection('carritos');

    // Buscar si el usuario ya tiene un carrito
    let carrito = await carritos.findOne({ userId });

    if (!carrito) {
      // Crear nuevo carrito si no existe
      const result = await carritos.insertOne({
        userId,
        items: [{ productId, quantity }],
        updatedAt: new Date(),
      });
      carrito = await carritos.findOne({ _id: result.insertedId });
    } else {
      // Actualizar carrito existente
      const itemIndex = carrito.items.findIndex(
        (item) => item.productId === productId
      );

      if (itemIndex > -1) {
        // Actualizar cantidad si el producto ya está en el carrito
        carrito.items[itemIndex].quantity += quantity;
      } else {
        // Agregar nuevo producto al carrito
        carrito.items.push({ productId, quantity });
      }

      // Actualizar en la base de datos
      await carritos.updateOne(
        { _id: carrito._id },
        {
          $set: {
            items: carrito.items,
            updatedAt: new Date(),
          },
        }
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify(carrito),
    };
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Error al procesar la solicitud',
        error: error.message 
      }),
    };
  }
};
