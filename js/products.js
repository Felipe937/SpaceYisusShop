import { supabase } from '../supabase.js';

export class ProductService {
    static async getProductById(productId) {
        try {
            if (!productId) {
                console.error('❌ No se proporcionó un ID de producto');
                return null;
            }

            console.log('🔍 Buscando producto con identificador:', productId);

            let product = null;

            // 1️⃣ Intentar búsqueda directa por slug (insensible a mayúsculas y acentos)
            const normalizedSearch = productId.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            console.log('🔍 Búsqueda normalizada:', normalizedSearch);
            
            const { data: directData, error: directError } = await supabase
                .from('products')
                .select('*')
                .ilike('slug', `%${normalizedSearch}%`)
                .limit(1)
                .maybeSingle();

            if (directError) {
                console.error('⚠️ Error al buscar por slug:', directError);
                throw directError;
            }

            if (directData) {
                console.log('✅ Producto encontrado por búsqueda flexible:', directData.name);
                return directData;
            }
            
            // 2️⃣ Si no se encuentra, intentar por ID exacto
            const { data: byIdData, error: idError } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .maybeSingle();
                
            if (byIdData) {
                console.log('✅ Producto encontrado por ID exacto:', byIdData.name);
                return byIdData;
            }

            // 3️⃣ Búsqueda flexible por nombre/descripción (insensible a acentos)
            const searchTerm = productId.replace(/-/g, ' ').trim();
            const normalizedSearchTerm = searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            console.log('🪄 Búsqueda flexible con término:', normalizedSearchTerm);

            const { data: nameData, error: nameError } = await supabase.rpc('search_products', {
                search_term: `%${normalizedSearchTerm}%`
            });

            if (nameError) {
                console.error('⚠️ Error al buscar por nombre/descripcion:', nameError);
                throw nameError;
            }

            if (nameData) {
                console.log('✅ Producto encontrado por nombre/descripcion:', nameData.name);
                return nameData;
            }

            // 3️⃣ Último recurso: devolver un producto aleatorio
            console.warn('⚠️ No se encontró el producto, devolviendo uno aleatorio como respaldo...');
            const { data: fallback } = await supabase
                .from('products')
                .select('*')
                .limit(1)
                .maybeSingle();

            if (fallback) {
                console.log('🎲 Mostrando producto de respaldo:', fallback.name);
                return fallback;
            }

            throw new Error('No se encontró el producto solicitado');
        } catch (error) {
            console.error('💥 Error al obtener el producto:', error);
            return null;
        }
    }

    static async getRelatedProducts(category, excludeId, limit = 4) {
        try {
            const { data: relatedProducts, error } = await supabase
                .from('products')
                .select('*')
                .eq('category', category)
                .neq('id', excludeId)
                .limit(limit);

            if (error) {
                console.error('⚠️ Error al obtener productos relacionados:', error);
                throw error;
            }

            return relatedProducts || [];
        } catch (error) {
            console.error('💥 Error en getRelatedProducts:', error);
            return [];
        }
    }
}
