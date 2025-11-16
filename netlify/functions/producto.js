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
      envio: "3-5 días"
    },
    "nerdminer-v3": {
      _id: "nerdminer-v3",
      nombre: "Nerdminer v3",
      precio: 730600,
      categoria: "electronica",
      descripcion: "Miner avanzado para criptomonedas",
      imagen: "https://images.unsplash.com/photo-1621570366844-bda4c4b43d57?w=400",
      stock: 5,
      envio: "3-5 días"
    }
  };

  const producto = productos[id];

  if (producto) {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(producto)
    };
  } else {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Producto no encontrado' })
    };
  }
};
