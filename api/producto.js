// api/producto.js 
export default async function handler(req, res) { 
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); 
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); 
  if (req.method === 'OPTIONS') return res.status(200).end(); 
  const productos = { 
    "cargador-rapido-45w": { 
      _id: "cargador-rapido-45w", 
      nombre: "Cargador Rapido 45W", 
      precio: 89900, 
      categoria: "electronica", 
      descripcion: "Cargador rapido de 45W para dispositivos moviles", 
      imagen: "https://images.unsplash.com/photo-1609592810794-1c0d49c7b9bd?w=400", 
      stock: 25, 
      envio: "1-2 dias" 
    } 
  }; 
  const { id } = req.query; 
  const producto = productos[id]; 
  if (producto) res.status(200).json(producto); 
} 
