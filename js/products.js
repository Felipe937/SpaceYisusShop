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
            
            // Función auxiliar para buscar por ID o slug
            const searchProduct = async (identifier) => {
                try {
                    // Primero intentamos buscar por slug
                    let { data, error } = await supabase
                        .from('products')
                        .select('*')
                        .or(`slug.eq.${identifier}`)
                        .limit(1);
                    
                    if (error) {
                        console.error('Error en búsqueda por slug:', error);
                        throw error;
                    }
                    
                    // Si no encontramos, intentamos buscar por ID
                    if (!data || data.length === 0) {
                        console.log('No se encontró por slug, intentando por ID...');
                        const { data: idData, error: idError } = await supabase
                            .from('products')
                            .select('*')
                            .eq('id', identifier)
                            .limit(1);
                        
                        if (idError) {
                            console.error('Error en búsqueda por ID:', idError);
                            throw idError;
                        }
                        
                        if (idData && idData.length > 0) {
                            console.log('Producto encontrado por ID:', idData[0].name);
                            return idData[0];
                        }
                        
                        // Si aún no encontramos, intentamos por nombre
                        console.log('No se encontró por ID, intentando por nombre...');
                        const searchTerm = identifier.replace(/-/g, ' ');
                        const { data: searchData, error: searchError } = await supabase
                            .from('products')
                            .select('*')
                            .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
                            .limit(1);
                        
                        if (searchError) {
                            console.error('Error en búsqueda por nombre:', searchError);
                            throw searchError;
                        }
                        
                        if (searchData && searchData.length > 0) {
                            console.log('Producto encontrado por nombre:', searchData[0].name);
                            return searchData[0];
                        }
                    } else {
                        console.log('Producto encontrado por slug:', data[0].name);
                        return data[0];
                    }
                    
                    return data && data.length > 0 ? data[0] : null;
                } catch (e) {
                    console.error('Error en búsqueda de producto:', e);
                    return null;
                }
            };
            
            // 1. Intentar búsqueda directa por ID o slug
            product = await searchProduct(productId);
            
            // 2. Si no se encuentra, intentar con formato modificado (reemplazar guiones por espacios)
            if (!product && productId.includes('-')) {
                console.log('Producto no encontrado, intentando con formato modificado...');
                const modifiedId = productId.replace(/-/g, ' ');
                product = await searchProduct(modifiedId);
            }

            // 3. Si aún no encontramos el producto, intentamos buscar por nombre
            if (!product) {
                console.log('Buscando por nombre...');
                const searchTerm = productId.replace(/-/g, ' ');
                console.log('Término de búsqueda:', searchTerm);
                
                try {
                    const { data, error: nameError } = await supabase
                        .from('products')
                        .select('*')
                        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
                        .limit(1);
                    
                    if (nameError) throw nameError;
                    
                    if (data && data.length > 0) {
                        console.log('Producto encontrado por nombre:', data[0]);
                        product = data[0];
                    }
                } catch (e) {
                    console.error('Error en búsqueda por nombre:', e);
                }
            }

            if (!product) {
                console.error('No se encontró el producto con ID o nombre:', productId);
                // Intentar una búsqueda más amplia como último recurso
                try {
                    const { data } = await supabase
                        .from('products')
                        .select('*')
                        .limit(1);
                    
                    if (data && data.length > 0) {
                        console.warn('No se encontró el producto específico, mostrando un producto aleatorio');
                        return data[0];
                    }
                } catch (e) {
                    console.error('Error en búsqueda de respaldo:', e);
                }
                
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
