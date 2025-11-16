import { getProductos } from '../mongodb.js';

export default async function handler(req, res) {
  try {
    const productos = await getProductos();
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const config = {
  runtime: 'nodejs'
};
