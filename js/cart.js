import { supabase } from '../supabase.js';

export class ShoppingCart {
    constructor() {
        this.items = [];
        this.currentUser = null;
        this.initialize();
    }

    async initialize() {
        try {
            // Verificar autenticación sin redirigir
            const { data: { user } } = await supabase.auth.getUser();
            this.currentUser = user;
            
            if (this.currentUser) {
                // Si el usuario está autenticado, cargar el carrito desde Supabase
                await this.loadCart();
                this.syncWithLocalStorage();
            } else {
                // Si no está autenticado, cargar desde localStorage
                this.loadFromLocalStorage();
            }
            
            // Actualizar UI en cualquier caso
            this.updateCartUI();
            
        } catch (error) {
            console.error('Error al inicializar el carrito:', error);
            // Cargar desde localStorage como respaldo
            this.loadFromLocalStorage();
        }
    }

    async loadCart() {
        try {
            const { data, error } = await supabase
                .from('cart')
                .select(`
                    id as cart_item_id,
                    quantity,
                    products (*)
                `)
                .eq('user_id', this.currentUser.id);

            if (error) throw error;

            this.items = data.map(item => ({
                ...item.products,
                cart_item_id: item.cart_item_id,
                quantity: item.quantity
            }));

            return this.items;
        } catch (error) {
            console.error('Error al cargar el carrito:', error);
            throw error;
        }
    }

    async addProduct(product, quantity = 1) {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return false;
        }

        try {
            // Verificar si el producto ya está en el carrito
            const existingItemIndex = this.items.findIndex(item => item.id === product.id);
            
            if (existingItemIndex >= 0) {
                // Actualizar cantidad si el producto ya existe
                const newQuantity = this.items[existingItemIndex].quantity + quantity;
                return await this.updateQuantity(product.id, newQuantity);
            } else {
                // Añadir nuevo ítem al carrito
                const { data, error } = await supabase
                    .from('cart')
                    .insert([
                        { 
                            user_id: this.currentUser.id, 
                            product_id: product.id, 
                            quantity: quantity 
                        }
                    ])
                    .select(`
                        id as cart_item_id,
                        quantity,
                        products (*)
                    `)
                    .single();

                if (error) throw error;

                this.items.push({
                    ...data.products,
                    cart_item_id: data.cart_item_id,
                    quantity: data.quantity
                });

                this.updateCartUI();
                this.showAddToCartAnimation(product);
                this.syncWithLocalStorage();
                return true;
            }
        } catch (error) {
            console.error('Error al añadir al carrito:', error);
            return false;
        }
    }

    async updateQuantity(productId, newQuantity) {
        try {
            newQuantity = parseInt(newQuantity);
            if (isNaN(newQuantity) || newQuantity < 1) newQuantity = 1;

            const itemIndex = this.items.findIndex(item => item.id === productId);
            if (itemIndex === -1) return false;

            const { error } = await supabase
                .from('cart')
                .update({ quantity: newQuantity })
                .eq('id', this.items[itemIndex].cart_item_id);

            if (error) throw error;

            this.items[itemIndex].quantity = newQuantity;
            this.updateCartUI();
            this.syncWithLocalStorage();
            return true;
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
            return false;
        }
    }

    async removeItem(productId) {
        try {
            const item = this.items.find(item => item.id === productId);
            if (!item) return false;

            const { error } = await supabase
                .from('cart')
                .delete()
                .eq('id', item.cart_item_id);

            if (error) throw error;

            this.items = this.items.filter(item => item.id !== productId);
            this.updateCartUI();
            this.syncWithLocalStorage();
            return true;
        } catch (error) {
            console.error('Error al eliminar del carrito:', error);
            return false;
        }
    }

    async clearCart() {
        try {
            const { error } = await supabase
                .from('cart')
                .delete()
                .eq('user_id', this.currentUser.id);

            if (error) throw error;

            this.items = [];
            this.updateCartUI();
            this.syncWithLocalStorage();
            return true;
        } catch (error) {
            console.error('Error al vaciar el carrito:', error);
            return false;
        }
    }

    calculateTotals() {
        const subtotal = this.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0);
            
        const taxRate = 0.19; // 19% de IVA
        const tax = subtotal * taxRate;
        const shipping = subtotal > 0 ? (subtotal > 100000 ? 0 : 10000) : 0; // Envío gratis sobre $100,000
        const total = subtotal + tax + shipping;

        return {
            subtotal: this.formatCurrency(subtotal),
            tax: this.formatCurrency(tax),
            shipping: this.formatCurrency(shipping),
            total: this.formatCurrency(total),
            raw: { subtotal, tax, shipping, total }
        };
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    updateCartUI() {
        // Actualizar contador de carrito
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = this.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.style.display = this.items.length > 0 ? 'inline-block' : 'none';
        }

        // Disparar evento personalizado para actualizar la UI
        document.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { 
                items: this.items,
                totals: this.calculateTotals()
            } 
        }));
    }

    showAddToCartAnimation(product) {
        // Crear y mostrar animación de "añadido al carrito"
        const animation = document.createElement('div');
        animation.className = 'add-to-cart-animation';
        animation.innerHTML = `
            <div class="animation-content">
                <img src="${product.image_url || 'https://via.placeholder.com/50'}" alt="${product.name}">
                <span>¡Añadido al carrito!</span>
            </div>
        `;
        
        document.body.appendChild(animation);
        
        // Eliminar la animación después de mostrarse
        setTimeout(() => {
            animation.classList.add('show');
            setTimeout(() => {
                animation.classList.remove('show');
                setTimeout(() => animation.remove(), 300);
            }, 2000);
        }, 100);
    }

    // Métodos para persistencia local
    saveToLocalStorage() {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('cart', JSON.stringify({
                items: this.items,
                timestamp: new Date().getTime()
            }));
        }
    }

    loadFromLocalStorage() {
        if (typeof localStorage !== 'undefined') {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                try {
                    const { items, timestamp } = JSON.parse(savedCart);
                    // Solo cargar si los datos tienen menos de 1 hora
                    if (new Date().getTime() - timestamp < 3600000) {
                        this.items = items;
                        this.updateCartUI();
                    }
                } catch (e) {
                    console.error('Error al cargar carrito desde localStorage:', e);
                }
            }
        }
    }

    syncWithLocalStorage() {
        this.saveToLocalStorage();
    }

    // Métodos estáticos para fácil acceso global
    static async getInstance() {
        if (!ShoppingCart.instance) {
            ShoppingCart.instance = new ShoppingCart();
            await ShoppingCart.instance.initialize();
        }
        return ShoppingCart.instance;
    }
}

// Inicializar instancia global
document.addEventListener('DOMContentLoaded', () => {
    window.shoppingCart = ShoppingCart.getInstance();
});
