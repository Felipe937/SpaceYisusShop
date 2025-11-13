import { supabase } from '../supabase.js';

export class ProductService {
  static async getProductById(productId) {
    try {
      if (!productId) {
        console.error('❌ No se proporcionó un ID de producto');
        return null;
      }

      console.log('🔍 Buscando producto con identificador:', productId);

      // 🔠 Normalizamos para quitar tildes y mayúsculas
      const normalized = productId
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

      console.log('🔍 Búsqueda normalizada:', normalized);

      // 1️⃣ Buscar por slug (búsqueda flexible)
      let { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('slug', `%${normalized}%`)
        .limit(1);

      if (error) {
        console.error('⚠️ Error al buscar por slug:', error);
        throw error;
      }

      // 2️⃣ Si no hay resultado, buscar por nombre o descripción
      if (!data || data.length === 0) {
        console.log('🪄 Búsqueda flexible con término:', normalized.replace(/-/g, ' '));
        const { data: altData, error: altError } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${normalized.replace(/-/g, ' ')}%,description.ilike.%${normalized.replace(/-/g, ' ')}%`)
          .limit(1);

        if (altError) {
          console.error('⚠️ Error al buscar por nombre/descripcion:', altError);
          throw altError;
        }

        if (altData && altData.length > 0) {
          console.log('✅ Producto encontrado por nombre/descripción:', altData[0].name);
          return altData[0];
        }
      } else {
        console.log('✅ Producto encontrado por slug:', data[0].name);
        return data[0];
      }

      // 3️⃣ Último recurso: devolver un producto cualquiera
      const { data: fallback } = await supabase.from('products').select('*').limit(1);
      if (fallback && fallback.length > 0) {
        console.warn('⚠️ No se encontró el producto exacto, devolviendo uno genérico');
        return fallback[0];
      }

      throw new Error('No se encontró el producto solicitado');
    } catch (error) {
      console.error('💥 Error al obtener el producto:', error);
      return null;
    }
  }

  static async getRelatedProducts(category, excludeId, productName, limit = 4) {
    try {
      console.log('🔍 Buscando productos relacionados para:', productName || 'producto sin nombre');
      
      // Buscar productos con palabras clave del nombre
      if (productName) {
        console.log('🔍 Buscando productos similares por nombre:', productName);
        
        // Extraer palabras clave del nombre del producto (palabras de más de 3 letras)
        const keywords = productName.split(/\s+/).filter(word => word.length > 3);
        
        if (keywords.length > 0) {
          // Crear una consulta OR para cada palabra clave
          const orQuery = keywords.map(word => `name.ilike.%${word}%`).join(',');
          
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .or(orQuery)
            .neq('id', excludeId)
            .limit(limit);
            
          if (data && data.length > 0) {
            console.log(`✅ Encontrados ${data.length} productos relacionados por nombre`);
            return data;
          }
        }
      }
      
      // Si no se encontraron productos por nombre, obtener productos aleatorios
      console.log('ℹ️ Mostrando productos aleatorios');
      
      const { data: relatedProducts, error } = await supabase
        .from('products')
        .select('*')
        .neq('id', excludeId)
        .order('id', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('⚠️ Error al obtener productos relacionados:', error);
        throw error;
      }

      console.log(`✅ Encontrados ${relatedProducts?.length || 0} productos`);
      return relatedProducts || [];
    } catch (error) {
      console.error('💥 Error en getRelatedProducts:', error);
      return [];
    }
  }
}
