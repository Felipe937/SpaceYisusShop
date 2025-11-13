import { supabase } from '../supabase.js';

export class ProductService {
    static async getProductById(productId) {
        try {
            if (!productId) {
                console.error('No se proporcionó un ID de producto');
                return null;
            }

            console.log('Buscando producto con ID:', productId);
            
            // Primero intentamos buscar por ID exacto (por si acaso es un UUID)
            let { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            // Si no encontramos por ID, intentamos buscar por nombre (insensible a mayúsculas/minúsculas)
            if (!product && (error?.code === 'PGRST116' || error?.code === '22P02')) {
                console.log('Buscando por nombre en lugar de ID...');
                const { data, error: nameError } = await supabase
                    .from('products')
                    .select('*')
                    .ilike('name', `%${productId.replace(/-/g, ' ')}%`)
                    .limit(1);
                
                if (nameError) {
                    console.error('Error al buscar por nombre:', nameError);
                    throw nameError;
                }
                
                product = data?.[0] || null;
                error = nameError;
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
