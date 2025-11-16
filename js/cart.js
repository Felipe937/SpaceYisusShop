export class ShoppingCart {
    constructor() {
        this.items = [];
        this.loadFromLocalStorage();
    }

    loadFromLocalStorage() {
        const savedCart = localStorage.getItem('shoppingCart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
    }

    async addProduct(product, quantity = 1) {
        try {
            const existingItemIndex = this.items.findIndex(item => item.id === product.id);
            
            if (existingItemIndex >= 0) {
                // Actualizar cantidad si el producto ya está en el carrito
                this.items[existingItemIndex].quantity += quantity;
            } else {
                // Añadir nuevo ítem al carrito
                const newItem = {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image || '',
                    quantity: quantity
                };
                this.items.push(newItem);
            }
            
            this.syncWithLocalStorage();
            this.updateUI();
            return true;
        } catch (error) {
            console.error('Error al añadir al carrito:', error);
            return false;
        }
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            return this.removeItem(productId);
        }

        const itemIndex = this.items.findIndex(item => item.id === productId);
        if (itemIndex === -1) return false;

        this.items[itemIndex].quantity = newQuantity;
        this.syncWithLocalStorage();
        this.updateUI();
        return true;
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.syncWithLocalStorage();
        this.updateUI();
        return true;
    }

    clearCart() {
        this.items = [];
        this.syncWithLocalStorage();
        this.updateUI();
        return true;
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
