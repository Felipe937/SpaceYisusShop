import { supabase } from '../supabase.js';

export class ProductService {
  static async getProductById(productId) {
    try {
      if (!productId) {
        console.error('❌ No se proporcionó un ID de producto');
        return null;
      }

      console.log('🔍 Buscando producto con identificador:', productId);

      // 0️⃣ Lista de slugs conocidos con sus posibles variaciones
      const knownSlugs = {
        'cargador-rapido-45w': ['cargador-rápido-45w-usbc', 'cargador-rapido-45w'],
        'xiaomi-redmi-airdots-2': ['xiaomi-redmi-airdots-2'],
        'camiseta-algodon-premium': ['camiseta-algodón-premium', 'camiseta-algodon-premium'],
        'nerdminer-v3': ['nerdminer-v3'],
        'lucky-miner-bitcoin-lv06': ['lucky-miner-bitcoin-lv06'],
        'avalon-nano3-4t-miner': ['avalon-nano3-4t-miner'],
        'cargador-laptop-240w': ['cargador-laptop-240w'],
        'smartwatch-pro-x1': ['smartwatch-pro-x1']
      };

      // 1️⃣ Primero intentar búsqueda exacta por ID
      const { data: exactMatch, error: exactError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (!exactError && exactMatch) {
        console.log('✅ Producto encontrado por ID exacto:', exactMatch.name);
        return exactMatch;
      }

      // 2️⃣ Normalizar el ID del producto para búsqueda
      const normalized = productId
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

      console.log('🔍 Búsqueda normalizada:', normalized);

      // 3️⃣ Buscar en slugs conocidos primero
      for (const [baseSlug, variations] of Object.entries(knownSlugs)) {
        if (variations.includes(normalized)) {
          console.log(`🔄 Intentando con slug conocido: ${baseSlug}`);
          
          // Buscar por el slug base
          const { data: knownSlugMatch, error: knownSlugError } = await supabase
            .from('products')
            .select('*')
            .eq('slug', baseSlug)
            .limit(1);

          if (!knownSlugError && knownSlugMatch && knownSlugMatch.length > 0) {
            console.log(`✅ Producto encontrado por slug conocido (${baseSlug}):`, knownSlugMatch[0].name);
            return knownSlugMatch[0];
          }
          
          // Si no se encuentra con el slug base, intentar con la variación exacta
          const { data: variationMatch, error: variationError } = await supabase
            .from('products')
            .select('*')
            .ilike('slug', `%${normalized}%`)
            .limit(1);

          if (!variationError && variationMatch && variationMatch.length > 0) {
            console.log(`✅ Producto encontrado por variación de slug (${normalized}):`, variationMatch[0].name);
            return variationMatch[0];
          }
        }
      }

      // 4️⃣ Buscar por slug exacto
      const { data: slugMatch, error: slugError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', normalized)
        .limit(1);

      if (!slugError && slugMatch && slugMatch.length > 0) {
        console.log('✅ Producto encontrado por slug exacto:', slugMatch[0].name);
        return slugMatch[0];
      }

      // 5️⃣ Búsqueda flexible por slug
      const { data: fuzzyMatch, error: fuzzyError } = await supabase
        .from('products')
        .select('*')
        .ilike('slug', `%${normalized}%`)
        .limit(1);

      if (!fuzzyError && fuzzyMatch && fuzzyMatch.length > 0) {
        console.log('✅ Producto encontrado por búsqueda flexible de slug:', fuzzyMatch[0].name);
        return fuzzyMatch[0];
      }

      // 4️⃣ Búsqueda por nombre o descripción
      console.log('🪄 Búsqueda flexible con término:', normalized.replace(/-/g, ' '));
      const searchTerm = normalized.replace(/-/g, ' ');
      const { data: altData, error: altError } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(1);

      if (!altError && altData && altData.length > 0) {
        console.log('✅ Producto encontrado por nombre/descripción:', altData[0].name);
        return altData[0];
      }

      // 5️⃣ Último recurso: devolver un producto cualquiera
      const { data: fallback, error: fallbackError } = await supabase
        .from('products')
        .select('*')
        .limit(1);

      if (!fallbackError && fallback && fallback.length > 0) {
        console.warn('⚠️ No se encontró el producto exacto, devolviendo uno genérico');
        return fallback[0];
      }

      console.error('❌ No se encontró ningún producto en la base de datos');
      return null;

    } catch (error) {
      console.error('💥 Error al obtener el producto:', error);
      return null;
    }
  }

  static async getRelatedProducts(category, excludeId, productName, limit = 4) {
    try {
      console.log('🔍 Buscando productos relacionados para:', productName || 'producto sin nombre');
      
      // Si el ID de exclusión no está definido, no buscar productos relacionados
      if (!excludeId) {
        console.warn('⚠️ No se proporcionó un ID de producto para excluir');
        return [];
      }

      // Construir la consulta base
      let query = supabase
        .from('products')
        .select('*')
        .neq('id', excludeId);

      // Saltar la búsqueda por categoría ya que la columna no existe
      console.log('ℹ️ Búsqueda por categoría deshabilitada, buscando por nombre del producto');
      
      // Buscar por palabras clave del nombre
      if (productName) {
        console.log('🔍 Buscando productos similares por nombre:', productName);
        
        // Extraer palabras clave del nombre del producto (palabras de más de 3 letras)
        const keywords = productName.split(/\s+/).filter(word => word.length > 3);
        
        if (keywords.length > 0) {
          // Crear una consulta OR para cada palabra clave
          const orQuery = keywords.map(word => `name.ilike.%${word}%`).join(',');
          
          const { data: nameProducts, error: nameError } = await query
            .or(orQuery)
            .limit(limit);
            
          if (!nameError && nameProducts && nameProducts.length > 0) {
            console.log(`✅ Encontrados ${nameProducts.length} productos relacionados por nombre`);
            return nameProducts;
          }
        }
      }
      
      // Si no se encontraron productos por nombre, obtener productos aleatorios
      console.log('ℹ️ Mostrando productos aleatorios');
      
      // Usar una consulta aleatoria con un rango de IDs para mejorar el rendimiento
      const { data: randomProducts, error: randomError } = await supabase
        .from('products')
        .select('*')
        .neq('id', excludeId)
        .order('id', { ascending: false })
        .limit(limit);

      if (randomError) {
        console.error('⚠️ Error al obtener productos aleatorios:', randomError);
        throw randomError;
      }

      console.log(`✅ Encontrados ${randomProducts?.length || 0} productos aleatorios`);
      return randomProducts || [];
z    } catch (error) {
      console.error('💥 Error en getRelatedProducts:', error);
      return [];
    }
  }
}
