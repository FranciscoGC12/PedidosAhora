    let carrito = [];
    let total = 0;

    // Cargar datos del carrito
    function cargarCarrito() {
      const carritoData = localStorage.getItem('carrito');
      const totalData = localStorage.getItem('total');
      
      if (carritoData) {
        carrito = JSON.parse(carritoData);
        total = parseFloat(totalData.replace('$', '')) || 0;
        mostrarResumen();
      } else {
        mostrarCarritoVacio();
      }
    }

    // Mostrar resumen del pedido
    function mostrarResumen() {
      const resumenElemento = document.getElementById('resumen-pedido');
      
      if (carrito.length === 0) {
        mostrarCarritoVacio();
        return;
      }

      let html = '';
      carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        html += `
          <div class="item-pedido">
            <img src="${item.imgSrc}" alt="${item.nombre}" class="item-imagen">
            <div class="item-detalle">
              <div class="item-nombre">${item.nombre}</div>
              <div class="item-precio">$${item.precio.toFixed(2)} x ${item.cantidad} = $${subtotal.toFixed(2)}</div>
            </div>
          </div>
        `;
      });
      
      resumenElemento.innerHTML = html;
      
      // Calcular totales
      const subtotal = total;
      const envio = 2.50;
      const totalFinal = subtotal + envio;
      
      document.getElementById('subtotal').textContent = `${subtotal.toFixed(2)}`;
      document.getElementById('envio').textContent = `${envio.toFixed(2)}`;
      document.getElementById('total-final').textContent = `${totalFinal.toFixed(2)}`;
    }

    // Mostrar carrito vacío
    function mostrarCarritoVacio() {
      const container = document.querySelector('.contenido');
      container.innerHTML = `
        <div class="section" style="grid-column: 1 / -1;">
          <div class="carro-vacio">
            <div class="carro-vacio-icono">🛒</div>
            <h2>Tu carrito está vacío</h2>
            <p>No hay productos para procesar el pago.</p>
            <button onclick="window.location.href='productos.html'" class="boton-pago" style="max-width: 300px; margin-top: 1rem;">
              Volver al Menú
            </button>
          </div>
        </div>
      `;
    }

    // Manejar métodos de pago
    function setupMetodoPago() {
      const opcionesPago = document.querySelectorAll('.pago-opcion');
      const tarjetaDetalles = document.getElementById('detalles-tarjeta');
      
      opcionesPago.forEach(opcion => {
        opcion.addEventListener('click', function() {
          // Remover selección anterior
          opcionesPago.forEach(opc => opc.classList.remove('selected'));
          // Agregar selección actual
          this.classList.add('selected');
          
          // Mostrar/ocultar detalles de tarjeta
          const valor = this.querySelector('input[type="radio"]').value;
          if (valor === 'tarjeta') {
            tarjetaDetalles.classList.add('active');
          } else {
            tarjetaDetalles.classList.remove('active');
          }
        });
      });
    }

    // Formatear número de tarjeta
    function formatearNumeroTarjeta(input) {
      let valor = input.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
      let formateadoValor = valor.match(/.{1,4}/g)?.join(' ') || valor;
      input.value = formateadoValor;
    }

    // Formatear fecha de vencimiento
    function formatoExpirado(input) {
      let valor = input.value.replace(/\D/g, '');
      if (valor.length >= 2) {
        valor = valor.substring(0, 2) + '/' + valor.substring(2, 4);
      }
      input.value = valor;
    }

    // Procesar pago
    function procesarPago(event) {
      event.preventDefault();
      
      const form = document.getElementById('pago-form');
      const loading = document.getElementById('loading');
      const botonPago = document.getElementById('boton-pago');
      
      // Validar formulario
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      
      // Mostrar loading
      form.style.display = 'none';
      loading.classList.add('active');
      
      // Simular procesamiento de pago
      setTimeout(() => {
        // Guardar datos del pedido para la página de seguimiento
        const pedidoData = {
          items: carrito,
          total: total
        };
        localStorage.setItem('pedidoData', JSON.stringify(pedidoData));
        
        // Limpiar carrito
        localStorage.removeItem('carrito');
        localStorage.removeItem('total');
        
        // Redirigir a página de seguimiento
        window.location.href = 'pedido.html';
      }, 3000);
    }

    // Inicializar página
    document.addEventListener('DOMContentLoaded', function() {
      cargarCarrito();
      setupMetodoPago();
      
      // Event listeners para formateo de campos
      const tarjetaNumeroInput = document.getElementById('numero-tarjeta');
      const expiracionInput = document.getElementById('expiracion');
      
      if (tarjetaNumeroInput) {
        tarjetaNumeroInput.addEventListener('input', function() {
          formatearNumeroTarjeta(this);
        });
      }
      
      if (expiracionInput) {
        expiracionInput.addEventListener('input', function() {
          formatoExpirado(this);
        });
      }
      
      // Event listener para el formulario
      const form = document.getElementById('pago-form');
      if (form) {
        form.addEventListener('submit', procesarPago);
      }
    });