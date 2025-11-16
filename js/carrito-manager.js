class CarritoManager {
  constructor() {
    this.sesionId = this.getSessionId();
    this.carrito = { items: [] };
    this.init();
  }

  getSessionId() {
    let sessionId = localStorage.getItem('spaceyisus_sesion_id');
    if (!sessionId) {
      sessionId = 'sesion_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('spaceyisus_sesion_id', sessionId);
    }
    return sessionId;
  }

  async init() {
    await this.obtenerCarrito();
    this.actualizarContador();
  }

  async agregarProducto(productoId, nombre, precio) {
    try {
      const response = await fetch('/.netlify/functions/agregar-al-carrito', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sesion_id: this.sesionId,
          producto_id: productoId,
          nombre: nombre,
          precio: precio,
          cantidad: 1
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.carrito = result.carrito;
        this.actualizarContador();
        this.mostrarNotificacion('✅ Producto agregado al carrito');
      }
    } catch (error) {
      console.error('Error:', error);
      this.mostrarNotificacion('❌ Error al agregar producto');
    }
  }

  async obtenerCarrito() {
    try {
      const response = await fetch(`/.netlify/functions/obtener-carrito?sesion_id=${this.sesionId}`);
      this.carrito = await response.json();
      this.actualizarContador();
    } catch (error) {
      console.error('Error obteniendo carrito:', error);
    }
  }

  actualizarContador() {
    const totalItems = this.carrito.items.reduce((total, item) => total + item.cantidad, 0);
    
    // Buscar o crear contador
    let contador = document.getElementById('carrito-contador');
    if (!contador) {
      contador = document.createElement('span');
      contador.id = 'carrito-contador';
      contador.className = 'carrito-contador';
      contador.style.cssText = `
        background: #ff4444;
        color: white;
        border-radius: 50%;
        padding: 2px 6px;
        font-size: 12px;
        margin-left: 5px;
      `;
      
      // Agregar cerca del enlace del carrito
      const carritoLink = document.querySelector('a[href*="cart"]');
      if (carritoLink) {
        carritoLink.appendChild(contador);
      }
    }
    
    contador.textContent = totalItems;
    contador.style.display = totalItems > 0 ? 'inline' : 'none';
  }

  mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.textContent = mensaje;
    notificacion.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 1000;
      font-family: Arial, sans-serif;
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
      if (document.body.contains(notificacion)) {
        document.body.removeChild(notificacion);
      }
    }, 3000);
  }
}

// Inicializar globalmente
window.carritoManager = new CarritoManager();
