// api/productos.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const productos = [
    {
      _id: "cargador-rapido-45w",
      nombre: "Cargador Rapido 45W",
      precio: 89900,
      categoria: "electronica",
      descripcion: "Cargador rapido de 45W para dispositivos moviles",
      imagen: "https://images.unsplash.com/photo-1609592810794-1c0d49c7b9bd?w=400",
      stock: 25
    },
    {
      _id: "smartwatch-pro-x1",
      nombre: "Smartwatch Pro X1",
      precio: 1000960,
      categoria: "electronica",
      descripcion: "Smartwatch avanzado con multiples funciones",
      imagen: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      stock: 10
    },
    {
      _id: "nerdminer-v3",
      nombre: "Nerdminer v3",
      precio: 730600,
      categoria: "electronica",
      descripcion: "Miner avanzado para criptomonedas",
      imagen: "https://images.unsplash.com/photo-1621570366844-bda4c4b43d57?w=400",
      stock: 5,
      envio: "3-5 días"
    }
  ];
  res.status(200).json(productos);
}
