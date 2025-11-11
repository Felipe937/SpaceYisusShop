// ===============================
// BOTÓN DE "AGREGAR RÁPIDO" AL CARRITO
// ===============================
document.querySelectorAll('.quick-add').forEach(button => {
  button.addEventListener('click', async function(e) {
    e.preventDefault();
    const productId = this.dataset.productId;

    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
      loadingState.style.display = 'flex';
    }

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: productId, quantity: 1 }] })
      });

      const cartData = await response.json();
      updateCartUI();
      toggleCart();
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    } finally {
      if (loadingState) {
        loadingState.style.display = 'none';
      }
    }
  });
});

// ===============================
// TOGGLE DEL CARRITO LATERAL
// ===============================
function toggleCart() {
  const cart = document.querySelector('.site-cart');
  const body = document.body;

  if (cart) {
    if (cart.classList.contains('is-active')) {
      cart.classList.remove('is-active');
      body.style.overflow = 'auto';
    } else {
      updateCartUI();
      cart.classList.add('is-active');
      body.style.overflow = 'hidden';
    }
  }
}

// ===============================
// ACTUALIZAR INTERFAZ DEL CARRITO
// ===============================
async function updateCartUI() {
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartCount = document.querySelector('.cart-count');
  const cartSubtotal = document.getElementById('cart-subtotal-price');

  if (!cartItemsContainer || !cartCount || !cartSubtotal) return;

  try {
    const response = await fetch('/cart.js');
    const cartData = await response.json();
    
    cartItemsContainer.innerHTML = '';
    
    if (cartData.item_count > 0) {
      cartData.items.forEach(item => {
        const itemHtml = `
          <div class="cart-item" data-line-item-key="${item.key}">
            <img src="${item.image}" alt="${item.title}" class="cart-item-image">
            <div class="cart-item-details">
              <h3 class="cart-item-title">${item.title}</h3>
              <span class="cart-item-price">${Shopify.formatMoney(item.price * item.quantity)}</span>
            </div>
            <button class="cart-item-remove" data-line-item-key="${item.key}">&times;</button>
          </div>
        `;
        cartItemsContainer.innerHTML += itemHtml;
      });

      cartSubtotal.textContent = Shopify.formatMoney(cartData.total_price);
      cartCount.textContent = cartData.item_count;
      cartCount.style.display = 'flex';
    } else {
      cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Tu carrito está vacío.</p>';
      cartSubtotal.textContent = Shopify.formatMoney(0);
      cartCount.style.display = 'none';
    }
  } catch (error) {
    console.error('Error al obtener los datos del carrito:', error);
  }
}

// ===============================
// ACTUALIZAR O ELIMINAR ITEM DEL CARRITO
// ===============================
async function updateCartItem(key, quantity) {
  try {
    await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    });
  } catch (error) {
    console.error('Error al actualizar el carrito:', error);
  }
}

// ===============================
// EVENTOS DEL CARRITO
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  const cartToggle = document.querySelector('.cart-toggle');
  const cartClose = document.querySelector('.cart-close');
  
  if (cartToggle) {
    cartToggle.addEventListener('click', toggleCart);
  }

  if (cartClose) {
    cartClose.addEventListener('click', toggleCart);
  }

  const cartItemsContainer = document.getElementById('cart-items-container');
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', async function(e) {
      if (e.target.classList.contains('cart-item-remove')) {
        const key = e.target.dataset.lineItemKey;
        await updateCartItem(key, 0);
        updateCartUI();
      }
    });
  }
});

// ===============================
// GESTIÓN DE VARIANTES EN PRODUCTOS
// ===============================
document.addEventListener("DOMContentLoaded", function () {
  const productInfo = document.querySelector("[data-product]");
  if (!productInfo) return;

  const productData = JSON.parse(productInfo.getAttribute("data-product"));
  const variantSelect = document.querySelector("select[name='id']");
  const priceElement = document.querySelector(".product__price, .price, #ProductPrice, #dynamic-price");
  const btnPriceElement = document.getElementById("btn-price");
  const productImage = document.querySelector(".product__media img, .product-gallery img");

  if (!variantSelect) return;

  variantSelect.addEventListener("change", function () {
    const selectedVariant = productData.variants.find(v => v.id == this.value);
    if (!selectedVariant) return;

    // 🔹 Actualizar precio principal
    if (priceElement) {
      priceElement.textContent = Shopify.formatMoney(selectedVariant.price, "{{ shop.money_format }}");
    }

    // 🔹 Actualizar precio en el botón
    if (btnPriceElement) {
      btnPriceElement.textContent = Shopify.formatMoney(selectedVariant.price, "{{ shop.money_format }}");
    }

    // 🔹 Actualizar imagen
    if (selectedVariant.featured_image && productImage) {
      productImage.src = selectedVariant.featured_image.src;
    }
  });
});