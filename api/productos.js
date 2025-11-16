// api/productos.js  
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const productos = [
    {
      _id: "cargador-rapido-45w",
      nombre: "Cargador Rápido 45W",
      precio: 89900,
      categoria: "electronica",
      descripcion: "Cargador rápido de 45W para dispositivos móviles",
      imagen: "https://images.unsplash.com/photo-1609592810794-1c0d49c7b9bd?w=400",
      stock: 25
    },
    {
      _id: "smartwatch-pro-x1", 
      nombre: "Smartwatch Pro X1",
      precio: 1000960,
      categoria: "electronica",
      descripcion: "Smartwatch avanzado con múltiples funciones",
      imagen: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      stock: 10
    }
  ];

  res.status(200).json(productos);
}
