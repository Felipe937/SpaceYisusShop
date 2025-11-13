// Variables globales
let currentStep = 1;
let selectedShippingMethod = 'estandar';
let selectedPaymentMethod = 'credit-card';
let cartItems = [];

// Precios
const shippingPrices = {
    estandar: 15000,
    express: 30000
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Cargar carrito desde localStorage o usar datos de ejemplo
    loadCart();
    updateOrderSummary();
    updateCheckoutSummary();
});

// Cargar carrito desde localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cartItems = JSON.parse(savedCart);
    } else {
        // Datos de ejemplo si no hay carrito
        cartItems = [
            { id: 1, name: 'Smartwatch Pro X1', price: 1499950, quantity: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150' },
            { id: 2, name: 'Cargador Rápido 45W', price: 176900, quantity: 2, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150' }
        ];
    }
}

// Navegación entre pasos
function nextStep(step) {
    if (step === 1 && !validateStep1()) return;
    if (step === 3 && !validateStep3()) return;
    
    document.querySelector(`#shipping-form, #shipping-method, #payment-method, #review-order`).classList.add('hidden');
    
    currentStep = step + 1;
    
    let nextStepElement;
    if (currentStep === 2) nextStepElement = document.getElementById('shipping-method');
    else if (currentStep === 3) nextStepElement = document.getElementById('payment-method');
    else if (currentStep === 4) {
        nextStepElement = document.getElementById('review-order');
        updateReviewOrder();
    }
    
    if (nextStepElement) {
        nextStepElement.classList.remove('hidden');
        updateStepIndicator();
    }
}

function prevStep(step) {
    document.querySelector(`#shipping-form, #shipping-method, #payment-method, #review-order`).classList.add('hidden');
    
    currentStep = step - 1;
    
    let prevStepElement;
    if (currentStep === 1) prevStepElement = document.getElementById('shipping-form');
    else if (currentStep === 2) prevStepElement = document.getElementById('shipping-method');
    else if (currentStep === 3) prevStepElement = document.getElementById('payment-method');
    
    if (prevStepElement) {
        prevStepElement.classList.remove('hidden');
        updateStepIndicator();
    }
}

// Actualizar indicador de pasos
function updateStepIndicator() {
    for (let i = 1; i <= 4; i++) {
        const stepElement = document.getElementById(`step-${i}`);
        if (i < currentStep) {
            stepElement.classList.add('completed');
            stepElement.classList.remove('active');
        } else if (i === currentStep) {
            stepElement.classList.add('active');
            stepElement.classList.remove('completed');
        } else {
            stepElement.classList.remove('active', 'completed');
        }
    }
}

// Seleccionar método de envío
function selectShippingMethod(method, element) {
    document.querySelectorAll('.shipping-method').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    selectedShippingMethod = method;
    updateOrderSummary();
    updateCheckoutSummary();
}

// Seleccionar método de pago
function selectPaymentMethod(method, element) {
    document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    selectedPaymentMethod = method;
    
    const creditCardForm = document.getElementById('credit-card-form');
    if (creditCardForm) {
        creditCardForm.style.display = method === 'credit-card' ? 'block' : 'none';
    }
}

// Validar pasos
function validateStep1() {
    const requiredFields = ['first-name', 'last-name', 'email', 'phone', 'address', 'city', 'state', 'zip'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });
    
    if (!isValid) {
        alert('Por favor completa todos los campos obligatorios.');
    }
    
    return isValid;
}

function validateStep3() {
    if (selectedPaymentMethod === 'credit-card') {
        const requiredFields = ['card-number', 'card-expiry', 'card-cvv', 'card-name'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                field.style.borderColor = '#ef4444';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });
        
        if (!isValid) {
            alert('Por favor completa toda la información de la tarjeta.');
            return false;
        }
    }
    
    return true;
}

// Actualizar resumen del pedido
function updateOrderSummary() {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = shippingPrices[selectedShippingMethod] || 0;
    const tax = subtotal * 0.19; // 19% de IVA
    const total = subtotal + shipping + tax;
    
    // Actualizar totales
    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('shipping-cost').textContent = formatCurrency(shipping);
    document.getElementById('tax').textContent = formatCurrency(tax);
    document.getElementById('total').textContent = formatCurrency(total);
    
    // Actualizar resumen en la barra lateral
    document.getElementById('summary-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('summary-shipping').textContent = formatCurrency(shipping);
    document.getElementById('summary-tax').textContent = formatCurrency(tax);
    document.getElementById('summary-total').textContent = formatCurrency(total);
    
    // Actualizar productos en el resumen
    const orderItemsContainer = document.getElementById('order-items');
    const summaryItemsContainer = document.getElementById('summary-items');
    
    if (orderItemsContainer) {
        orderItemsContainer.innerHTML = cartItems.map(item => `
            <div class="order-summary-item">
                <img loading="lazy" src="${item.image}" alt="${item.name}" width="80" height="80">
                <div class="order-summary-item-details">
                    <h4>${item.name}</h4>
                    <p>Cantidad: ${item.quantity}</p>
                </div>
                <div class="order-summary-item-price">
                    ${formatCurrency(item.price * item.quantity)}
                </div>
            </div>
        `).join('');
    }
    
    if (summaryItemsContainer) {
        summaryItemsContainer.innerHTML = cartItems.map(item => `
            <div class="order-summary-item">
                <img loading="lazy" src="${item.image}" alt="${item.name}" width="50" height="50">
                <div class="order-summary-item-details">
                    <h4>${item.name}</h4>
                    <p>${formatCurrency(item.price)} x ${item.quantity}</p>
                </div>
            </div>
        `).join('');
    }
}

// Actualizar el resumen en el paso de revisión
function updateReviewOrder() {
    // Actualizar dirección de envío
    const address = [
        document.getElementById('first-name').value + ' ' + document.getElementById('last-name').value,
        document.getElementById('address').value,
        document.getElementById('city').value + ', ' + document.getElementById('state').value,
        document.getElementById('zip').value
    ].filter(Boolean).join('<br>');
    
    document.getElementById('shipping-address-text').innerHTML = address;
    
    // Actualizar método de pago
    let paymentMethodText = '';
    if (selectedPaymentMethod === 'credit-card') {
        const cardNumber = document.getElementById('card-number').value;
        paymentMethodText = `Tarjeta terminada en ${cardNumber.slice(-4)}`;
    } else if (selectedPaymentMethod === 'pse') {
        paymentMethodText = 'Pago por PSE';
    } else if (selectedPaymentMethod === 'efecty') {
        paymentMethodText = 'Pago en Efecty';
    }
    
    document.getElementById('payment-method-text').textContent = paymentMethodText;
}

// Formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Enviar el pedido
function submitOrder() {
    const termsCheckbox = document.getElementById('terms');
    if (!termsCheckbox.checked) {
        alert('Debes aceptar los Términos y Condiciones para continuar.');
        return;
    }
    
    // Aquí iría la lógica para procesar el pago
    alert('¡Gracias por tu compra! Tu pedido ha sido procesado correctamente.');
    // Redirigir a la página de confirmación
    // window.location.href = '/order-confirmation';
}

// Actualizar el resumen del checkout
function updateCheckoutSummary() {
    updateOrderSummary();
}

// Inicializar máscaras de entrada (si es necesario)
function initInputMasks() {
    // Ejemplo para el número de tarjeta
    const cardNumber = document.getElementById('card-number');
    if (cardNumber) {
        cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = value.trim();
        });
    }
    
    // Ejemplo para la fecha de vencimiento
    const cardExpiry = document.getElementById('card-expiry');
    if (cardExpiry) {
        cardExpiry.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // Ejemplo para el CVV
    const cardCvv = document.getElementById('card-cvv');
    if (cardCvv) {
        cardCvv.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
        });
    }
}

// Inicializar todo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initInputMasks();
});
