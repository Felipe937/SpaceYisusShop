const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

exports.handler = async function(event, context) {
  // Handle CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  const { id } = event.queryStringParameters;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Se requiere un ID de producto' })
    };
  }

  try {
    await client.connect();
    const db = client.db('tienda_colombia');
    const producto = await db.collection('productos').findOne({ _id: id });
    
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(producto)
    };
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Error al conectar con la base de datos: ' + error.message })
    };
  }
};
