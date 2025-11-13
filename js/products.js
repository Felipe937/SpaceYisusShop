import { supabase } from '../supabase.js';

export class ProductService {
    static async getProductById(productId) {
        try {
            if (!productId) {
                console.error('No se proporcionó un ID de producto');
                return null;
            }

            console.log('Buscando producto con ID:', productId);
            
            // Primero intentamos con el ID exacto
            let { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            // Si no encontramos el producto, intentamos con ilike (insensible a mayúsculas/minúsculas)
            if (!product && error?.code === 'PGRST116') {
                console.log('Producto no encontrado con búsqueda exacta, intentando con búsqueda insensible...');
                const { data, error: likeError } = await supabase
                    .from('products')
                    .select('*')
                    .ilike('id', `%${productId}%`)
                    .limit(1);
                
                if (likeError) {
                    console.error('Error en búsqueda insensible:', likeError);
                    throw likeError;
                }
                
                product = data?.[0] || null;
                error = likeError;
            }

            if (error) {
                console.error('Error de Supabase:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint,
                    details: error.details
                });
                return null;
            }

            if (!product) {
                console.error('No se encontró el producto con ID:', productId);
                return null;
            }

            console.log('Producto encontrado:', product);
            return product;
        } catch (error) {
            console.error('Error fetching product:', error);
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

            if (error) throw error;
            return relatedProducts || [];
        } catch (error) {
            console.error('Error fetching related products:', error);
            return [];
        }
    }
}
