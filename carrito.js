const carroBoton = document.getElementById('carro-boton');
const carroCount = document.getElementById('carro-count');
const carroModelo = document.getElementById('carro-modelo');
const cerrarCarroBoton = document.getElementById('cerrar-carro');
const carroContenido = document.getElementById('carro-contenido');
const carroTotal = document.getElementById('carro-total');
const confirmarOrdenBoton = document.getElementById('confirmar-pedido');
let carro = [];

function toggleCarroModelo(mostrar) {
  if (mostrar) {
    carroModelo.classList.remove('carro-oculto');
    carroModelo.classList.add('carro-visible');
  } else {
    carroModelo.classList.add('carro-oculto');
    carroModelo.classList.remove('carro-visible');
  }
}

carroBoton.addEventListener('click', () => {
  toggleCarroModelo(true);
  renderCarro(); 
});

cerrarCarroBoton.addEventListener('click', () => {
  toggleCarroModelo(false);
});

document.querySelector('.carro-ventana').addEventListener('click', () => {
  toggleCarroModelo(false);
});

function updateCarroCount() {
  const totalCantidad = carro.reduce((sum, item) => sum + item.cantidad, 0);
  carroCount.textContent = totalCantidad;
}


function añadirCarro(productos) {
  const nombre = productos.dataset.nombre;
  const precio = parseFloat(productos.dataset.precio);
  const imgTag = productos.querySelector('.producto-imagen img');
  const imgSrc = imgTag ? imgTag.getAttribute('src') : '';
  // Si el producto ya existe, sólo aumentamos cantidad
  const existe = carro.find(item => item.nombre === nombre);
  if (existe) {
    existe.cantidad += 1;
  } else {
    carro.push({ nombre, precio, imgSrc, cantidad: 1 });
  }
  updateCarroCount();
}

function renderCarro() {
  carroContenido.innerHTML = ''; 
  let total = 0;

  if (carro.length === 0) {
    carroContenido.innerHTML = '<p style="text-align:center; margin:20px 0;">Tu carrito está vacío.</p>';
  } else {
    carro.forEach((item, idx) => {
      const itemTotal = (item.precio * item.cantidad);
      total += itemTotal;

      // Crear una carpeta para .carro-item
      const carroItemDiv = document.createElement('div');
      carroItemDiv.classList.add('carro-item');

      carroItemDiv.innerHTML = `
        <div class="carro-imagen">
          <img src="${item.imgSrc}" alt="${item.nombre}">
        </div>
        <div class="carro-detalle">
          <h4>${item.nombre}</h4>
          <p class="carro-precio">$${item.precio.toFixed(2)} x ${item.cantidad}</p>
          <p class="carro-total">Subtotal: $${itemTotal.toFixed(2)}</p>
        </div>
      `;
      carroContenido.appendChild(carroItemDiv);
    });
  }

  carroTotal.textContent = `$${total.toFixed(2)}`;
}

document.querySelectorAll('.añadirCarro').forEach(btn => {
  btn.addEventListener('click', () => {
    const producto = btn.closest('.producto');
    añadirCarro(producto);
  });
});

/*
confirmarOrdenBoton.addEventListener('click', () => {
  if (carro.length === 0) {
    alert('No hay productos en el carrito.');
    return;
  }
  // Por ahora, sólo mostramos alerta y vaciamos carrito:
  alert('¡Pedido confirmado :D!\nTotal: ' + carroTotal.textContent);
  carro = [];
  updateCarroCount();
  renderCarro();
  toggleCarroModelo(false);
});
*/

confirmarOrdenBoton.addEventListener('click', () => {
  if (carro.length === 0) {
    alert('No hay productos en el carrito.');
    return;
  }

  // Guardar el carrito y total en localStorage
  localStorage.setItem('carrito', JSON.stringify(carro));
  localStorage.setItem('total', carroTotal.textContent);

  // Redirigir a página de pago
  window.location.href = 'pago.html';
});