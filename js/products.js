// products.js
import { supabase } from '../supabase.js';

export class ProductService {
  static async getProductById(productId) {
    try {
      if (!productId) {
        console.error('❌ No se proporcionó un ID de producto');
        return null;
      }

      console.log('🔍 Buscando producto con identificador:', productId);

      // Mapeo de slugs conocidos y variaciones
      const knownSlugs = {
        'cargador-rapido-45w': ['cargador-rapido-45w', 'cargador-rápido-45w-usbc'],
        'xiaomi-redmi-airdots-2': ['xiaomi-redmi-airdots-2'],
        'camiseta-algodon-premium': ['camiseta-algodon-premium', 'camiseta-algodón-premium'],
        'nerdminer-v3': ['nerdminer-v3'],
        'lucky-miner-bitcoin-lv06': ['lucky-miner-bitcoin-lv06'],
        'avalon-nano3-4t-miner': ['avalon-nano3-4t-miner'],
        'cargador-laptop-240w': ['cargador-laptop-240w'],
        'smartwatch-pro-x1': ['smartwatch-pro-x1'],
      };

      // 1️⃣ Intentar búsqueda exacta
      const { data: exactMatch, error: exactError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', productId)
        .single();

      if (!exactError && exactMatch) {
        console.log('✅ Producto encontrado por slug exacto:', exactMatch.name);
        return exactMatch;
      }

      // 2️⃣ Normalizar slug (sin tildes)
      const normalized = productId
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

      console.log('🔍 Búsqueda normalizada:', normalized);

      // 3️⃣ Buscar dentro de slugs conocidos
      for (const [baseSlug, variations] of Object.entries(knownSlugs)) {
        if (variations.includes(normalized)) {
          console.log(`🔄 Intentando con slug conocido: ${baseSlug}`);

          const { data: knownSlugMatch } = await supabase
            .from('products')
            .select('*')
            .eq('slug', baseSlug)
            .limit(1);

          if (knownSlugMatch?.length > 0) {
            console.log(`✅ Producto encontrado por slug conocido: ${baseSlug}`);
            return knownSlugMatch[0];
          }
        }
      }

      // 4️⃣ Búsqueda flexible (slug parcial)
      const { data: fuzzyMatch } = await supabase
        .from('products')
        .select('*')
        .ilike('slug', `%${normalized}%`)
        .limit(1);

      if (fuzzyMatch?.length > 0) {
        console.log('✅ Producto encontrado por búsqueda flexible:', fuzzyMatch[0].name);
        return fuzzyMatch[0];
      }

      // 5️⃣ Búsqueda por nombre o descripción
      const searchTerm = normalized.replace(/-/g, ' ');
      console.log('🪄 Búsqueda por nombre/descripción:', searchTerm);

      const { data: altData } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(1);

      if (altData?.length > 0) {
        console.log('✅ Producto encontrado por nombre o descripción:', altData[0].name);
        return altData[0];
      }

      // 6️⃣ Fallback: devolver producto genérico
      const { data: fallback } = await supabase.from('products').select('*').limit(1);
      if (fallback?.length > 0) {
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

  static async getRelatedProducts(_, excludeId, productName, limit = 4) {
    try {
      console.log('🔍 Buscando productos relacionados para:', productName);

      if (!excludeId) {
        console.warn('⚠️ No se proporcionó un ID de producto para excluir');
        return [];
      }

      const baseQuery = supabase.from('products').select('*').neq('id', excludeId);

      // Buscar por palabras clave en el nombre
      if (productName) {
        const keywords = productName.split(/\s+/).filter(w => w.length > 3);
        if (keywords.length > 0) {
          const orQuery = keywords.map(w => `name.ilike.%${w}%`).join(',');
          const { data: related } = await baseQuery.or(orQuery).limit(limit);
          if (related?.length > 0) {
            console.log(`✅ ${related.length} productos relacionados encontrados`);
            return related;
          }
        }
      }

      // Fallback: productos aleatorios
      const { data: random } = await baseQuery.order('created_at', { ascending: false }).limit(limit);
      console.log(`ℹ️ Mostrando ${random?.length || 0} productos aleatorios`);
      return random || [];
    } catch (error) {
      console.error('💥 Error en getRelatedProducts:', error);
      return [];
    }
  }
}
