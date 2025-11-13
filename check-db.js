import { supabase } from './supabase.js';

async function checkProductsTable() {
  try {
    // Get the table structure
    const { data: columns, error } = await supabase
      .rpc('get_table_columns', { 
        table_name: 'products' 
      });

    if (error) throw error;
    
    console.log('Products table structure:');
    console.table(columns);
    
    // Get a sample of products to check the data
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
      
    if (productsError) throw productsError;
    
    console.log('\nSample products:');
    console.table(products);
    
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

// Run the check
checkProductsTable();
