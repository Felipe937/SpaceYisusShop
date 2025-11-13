import { supabase } from '../supabase.js';

export class ProductService {
    static async getProductById(productId) {
        try {
            if (!productId) {
                console.error('No se proporcionó un ID de producto');
                return null;
            }

            console.log('Buscando producto con ID:', productId);
            
            let product = null;
            let error = null;
            
            try {
                // Primero intentamos buscar por ID exacto
                const response = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', productId)
                    .single();
                
                product = response.data;
                error = response.error;
                
                console.log('Resultado de la búsqueda por ID:', { product, error });
                
                // Si hay un error 406, puede ser un problema de headers
                if (error?.code === '406') {
                    console.warn('Error 406 detectado, intentando con headers alternativos...');
                    // Intentar de nuevo con headers más simples
                    const { data, error: retryError } = await supabase
                        .from('products')
                        .select('*')
                        .eq('id', productId)
                        .single();
                    
                    if (!retryError) {
                        product = data;
                        error = null;
                    } else {
                        error = retryError;
                    }
                }
            } catch (e) {
                console.error('Excepción al buscar por ID:', e);
                error = e;
            }

            // Si no encontramos por ID, intentamos buscar por nombre
            if ((!product || error) && (error?.code === 'PGRST116' || error?.code === '22P02' || error?.code === 'PGRST116' || error?.code === '406')) {
                console.log('Buscando por nombre en lugar de ID...');
                const searchTerm = productId.replace(/-/g, ' ');
                console.log('Término de búsqueda:', searchTerm);
                
                try {
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
                } catch (e) {
                    console.error('Error en búsqueda por nombre:', e);
                }
            }

            if (error && !product) {
                console.error('Error de Supabase al buscar producto:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint,
                    status: error.status,
                    statusCode: error.statusCode
                });
                throw new Error(`Error al buscar el producto: ${error.message}`);
            }

            if (!product) {
                console.error('No se encontró el producto con ID o nombre:', productId);
                throw new Error('No se encontró el producto solicitado');
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
