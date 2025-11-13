import { supabase } from '../supabase.js';

export class ProductService {
    static async getProductById(productId) {
        try {
            if (!productId) {
                console.error('No se proporcionó un ID de producto');
                return null;
            }

            console.log('Buscando producto con ID:', productId);
            
            // Primero intentamos buscar por ID exacto
            let { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            console.log('Resultado de la búsqueda por ID:', { product, error });

            // Si no encontramos por ID, intentamos buscar por nombre
            if ((!product || error) && (error?.code === 'PGRST116' || error?.code === '22P02' || error?.code === 'PGRST116')) {
                console.log('Buscando por nombre en lugar de ID...');
                const searchTerm = productId.replace(/-/g, ' ');
                console.log('Término de búsqueda:', searchTerm);
                
                const { data, error: nameError } = await supabase
                    .from('products')
                    .select('*')
                    .ilike('name', `%${searchTerm}%`)
                    .limit(1);
                
                console.log('Resultado de búsqueda por nombre:', { data, nameError });

                if (nameError) {
                    console.error('Error al buscar por nombre:', nameError);
                    throw nameError;
                }
                
                product = data?.[0] || null;
            }

            if (error && !product) {
                console.error('Error de Supabase:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                });
                return null;
            }

            if (!product) {
                console.error('No se encontró el producto con ID o nombre:', productId);
                return null;
            }

            console.log('Producto encontrado:', product);
            return product;
        } catch (error) {
            console.error('Error al obtener el producto:', error);
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
                console.error('Error al obtener productos relacionados:', error);
                throw error;
            }
            return relatedProducts || [];
        } catch (error) {
            console.error('Error en getRelatedProducts:', error);
            return [];
        }
    }
}
