// products.js
const { getProductos, getProductoById, getProductosByCategoria } = require('../mongodb.js');

class ProductService {
  static async getProductById(productId) {
    try {
      if (!productId) {
        console.error('❌ No se proporcionó un ID de producto');
        return null;
      }

      console.log('🔍 Buscando producto con identificador:', productId);

      // 1️⃣ Intentar búsqueda por ID
      try {
        const product = await getProductoById(productId);
        if (product) {
          console.log('✅ Producto encontrado por ID:', product.nombre || product.name);
          return product;
        }
      } catch (error) {
        console.warn('⚠️ Error en búsqueda por ID:', error);
      }

      // 2️⃣ Búsqueda por slug (asumiendo que el ID podría ser un slug)
      try {
        const allProducts = await getProductos();
        
        // Buscar por slug exacto
        const exactMatch = allProducts.find(p => p.slug === productId);
        if (exactMatch) {
          console.log('✅ Producto encontrado por slug exacto:', exactMatch.nombre || exactMatch.name);
          return exactMatch;
        }

        // Búsqueda flexible (slug parcial)
        const normalized = productId
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim();

        const fuzzyMatch = allProducts.find(p => 
          p.slug && p.slug.toLowerCase().includes(normalized) ||
          p.nombre && p.nombre.toLowerCase().includes(normalized) ||
          p.name && p.name.toLowerCase().includes(normalized)
        );

        if (fuzzyMatch) {
          console.log('✅ Producto encontrado por búsqueda flexible:', fuzzyMatch.nombre || fuzzyMatch.name);
          return fuzzyMatch;
        }

        // Búsqueda por nombre o descripción
        const searchTerm = normalized.replace(/-/g, ' ');
        const textMatch = allProducts.find(p => 
          (p.nombre && p.nombre.toLowerCase().includes(searchTerm)) ||
          (p.name && p.name.toLowerCase().includes(searchTerm)) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm)) ||
          (p.description && p.description.toLowerCase().includes(searchTerm))
        );

        if (textMatch) {
          console.log('✅ Producto encontrado por nombre/descripción:', textMatch.nombre || textMatch.name);
          return textMatch;
        }

        // Fallback: devolver el primer producto si no se encuentra ninguno
        if (allProducts.length > 0) {
          console.warn('⚠️ No se encontró el producto exacto, devolviendo uno genérico');
          return allProducts[0];
        }

      } catch (error) {
        console.error('💥 Error en búsqueda de productos:', error);
      }

      console.error('❌ No se encontró ningún producto en la base de datos');
      return null;
    } catch (error) {
      console.error('💥 Error al obtener el producto:', error);
      return null;
    }
  }

  static async getRelatedProducts(_, excludeId, productName, limit = 4) {
    try {
      console.log('🔍 Buscando productos relacionados para:', productName);

      if (!excludeId) {
        console.warn('⚠️ No se proporcionó un ID de producto para excluir');
        return [];
      }

      console.log('🔍 Buscando productos con ID distinto a:', excludeId);
      
      // Obtener todos los productos
      const allProducts = await getProductos();
      
      // Encontrar el producto actual
      const currentProduct = allProducts.find(p => p._id === excludeId || p.id === excludeId);
      let relatedProducts = [];

      if (currentProduct?.categoria) {
        // Filtrar por categoría si está disponible
        console.log(`🔍 Buscando productos en la categoría: ${currentProduct.categoria}`);
        relatedProducts = allProducts.filter(p => 
          (p._id !== excludeId && p.id !== excludeId) && 
          p.categoria === currentProduct.categoria
        );
      } else if (productName) {
        // Si no hay categoría, buscar por palabras clave en el nombre
        const keywords = productName.split(/\s+/).filter(w => w.length > 3);
        console.log('🔍 Buscando por palabras clave:', keywords);
        
        relatedProducts = allProducts.filter(p => {
          if (p._id === excludeId || p.id === excludeId) return false;
          
          const name = (p.nombre || p.name || '').toLowerCase();
          return keywords.some(keyword => 
            name.includes(keyword.toLowerCase())
          );
        });
      }

      // Si no encontramos suficientes productos relacionados, agregar algunos aleatorios
      if (relatedProducts.length < limit) {
        const remaining = limit - relatedProducts.length;
        const otherProducts = allProducts.filter(p => 
          (p._id !== excludeId && p.id !== excludeId) && 
          !relatedProducts.some(rp => rp._id === p._id || rp.id === p.id)
        );
        
        // Mezclar y tomar los necesarios
        const randomProducts = [...otherProducts]
          .sort(() => 0.5 - Math.random())
          .slice(0, remaining);
        
        relatedProducts = [...relatedProducts, ...randomProducts];
      }

      // Limitar el número de resultados
      relatedProducts = relatedProducts.slice(0, limit);
      
      console.log(`✅ Encontrados ${relatedProducts.length} productos relacionados`);
      return relatedProducts;
    } catch (error) {
      console.error('💥 Error en getRelatedProducts:', error);
      return [];
    }
  }
}
