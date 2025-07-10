// carrito.js - Funcionalidad del carrito de compras

// Elementos del DOM
const carroBoton = document.getElementById('carro-boton');
const carroCount = document.getElementById('carro-count');
const carroModelo = document.getElementById('carro-modelo');
const cerrarCarroBoton = document.getElementById('cerrar-carro');
const carroContenido = document.getElementById('carro-contenido');
const carroTotal = document.getElementById('carro-total');
const confirmarOrdenBoton = document.getElementById('confirmar-pedido');

// Array del carrito
let carro = [];

// Función para mostrar/ocultar el modal del carrito
function toggleCarroModelo(mostrar) {
  if (mostrar) {
    carroModelo.classList.remove('carro-oculto');
    carroModelo.classList.add('carro-visible');
  } else {
    carroModelo.classList.add('carro-oculto');
    carroModelo.classList.remove('carro-visible');
  }
}

// Event listeners para el modal del carrito
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

// Función para actualizar el contador del carrito
function updateCarroCount() {
  const totalCantidad = carro.reduce((sum, item) => sum + item.cantidad, 0);
  carroCount.textContent = totalCantidad;
}

// Función para añadir productos al carrito
function añadirCarro(productos) {
  const nombre = productos.dataset.nombre;
  const precio = parseFloat(productos.dataset.precio);
  const stock = parseInt(productos.dataset.stock);
  const imgTag = productos.querySelector('.producto-imagen img');
  const imgSrc = imgTag ? imgTag.getAttribute('src') : '';
  
  // Verificar si hay stock disponible
  if (stock <= 0) {
    alert('Este producto no tiene stock disponible.');
    return;
  }
  
  // Verificar si el producto ya existe en el carrito
  const existe = carro.find(item => item.nombre === nombre);
  if (existe) {
    // Verificar si no excede el stock
    if (existe.cantidad >= stock) {
      alert(`No puedes agregar más de ${stock} unidades de este producto.`);
      return;
    }
    existe.cantidad += 1;
  } else {
    carro.push({ nombre, precio, imgSrc, cantidad: 1, stock });
  }
  
  updateCarroCount();
  
  // Mostrar feedback visual
  const boton = productos.querySelector('.añadirCarro');
  const textoOriginal = boton.textContent;
  boton.textContent = '¡Agregado!';
  boton.style.backgroundColor = '#28a745';
  
  setTimeout(() => {
    boton.textContent = textoOriginal;
    boton.style.backgroundColor = '';
  }, 1000);
}

// Función para renderizar el carrito
function renderCarro() {
  carroContenido.innerHTML = ''; 
  let total = 0;

  if (carro.length === 0) {
    carroContenido.innerHTML = '<p style="text-align:center; margin:20px 0;">Tu carrito está vacío.</p>';
  } else {
    carro.forEach((item, idx) => {
      const itemTotal = (item.precio * item.cantidad);
      total += itemTotal;

      // Crear elemento del carrito
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
          <div class="carro-controles">
            <button class="btn-cantidad" onclick="cambiarCantidad(${idx}, -1)">-</button>
            <span class="cantidad">${item.cantidad}</span>
            <button class="btn-cantidad" onclick="cambiarCantidad(${idx}, 1)">+</button>
            <button class="btn-eliminar" onclick="eliminarDelCarro(${idx})">🗑️</button>
          </div>
        </div>
      `;
      carroContenido.appendChild(carroItemDiv);
    });
  }

  carroTotal.textContent = `$${total.toFixed(2)}`;
}

// Función para cambiar cantidad de un producto
function cambiarCantidad(index, cambio) {
  const item = carro[index];
  const nuevaCantidad = item.cantidad + cambio;
  
  if (nuevaCantidad <= 0) {
    eliminarDelCarro(index);
  } else if (nuevaCantidad > item.stock) {
    alert(`No puedes agregar más de ${item.stock} unidades de este producto.`);
  } else {
    item.cantidad = nuevaCantidad;
    updateCarroCount();
    renderCarro();
  }
}

// Función para eliminar un producto del carrito
function eliminarDelCarro(index) {
  carro.splice(index, 1);
  updateCarroCount();
  renderCarro();
}

// Función para inicializar los event listeners del carrito
function inicializarCarrito() {
  // Remover event listeners existentes para evitar duplicados
  document.querySelectorAll('.añadirCarro').forEach(btn => {
    // Clonar el botón para remover todos los event listeners
    const nuevoBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(nuevoBtn, btn);
  });
  
  // Agregar nuevos event listeners
  document.querySelectorAll('.añadirCarro').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const producto = btn.closest('.producto');
      añadirCarro(producto);
    });
  });
}

// Event listener para confirmar pedido
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

// Inicializar carrito cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  updateCarroCount();
});

// Función global para que la pueda llamar productos.js
window.inicializarCarrito = inicializarCarrito;
