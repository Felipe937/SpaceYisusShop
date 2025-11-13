import { supabase } from '../supabase.js';

export class ProductService {
    static async getProductById(productId) {
        try {
            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;
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
