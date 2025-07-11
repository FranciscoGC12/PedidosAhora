// carrito.js - Implementación siguiendo el diagrama de clases

// Clase EspecificacionDePedido siguiendo el diagrama
class EspecificacionDePedido {
    constructor(idProducto, idPedido, producto, cantidad = 1, precioUnitario = 0) {
        this.idPedido = idPedido;
        this.idProducto = idProducto;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        
        // Información adicional del producto para mostrar
        this.nombreProducto = producto.nombre || '';
        this.imagenProducto = producto.imgSrc || producto.imagen || '';
        this.stockDisponible = producto.stock || 0;
    }

    // +calcularCosto(): number
    calcularCosto() {
        return this.cantidad * this.precioUnitario;
    }

    // +añadirProducto(): void (aumentar cantidad)
    añadirProducto(cantidad = 1) {
        if (this.cantidad + cantidad <= this.stockDisponible) {
            this.cantidad += cantidad;
            return true;
        }
        return false;
    }

    // +removerProducto(): void (disminuir cantidad)
    removerProducto(cantidad = 1) {
        if (this.cantidad - cantidad >= 0) {
            this.cantidad -= cantidad;
            return true;
        }
        return false;
    }

    // Método para validar si se puede agregar cierta cantidad
    puedeAgregarCantidad(cantidad) {
        return (this.cantidad + cantidad) <= this.stockDisponible;
    }

    // Generar HTML para mostrar en el carrito
    generarHTML(index) {
        const costoTotal = this.calcularCosto();
        
        return `
            <div class="carro-item" data-index="${index}" data-id-producto="${this.idProducto}">
                <div class="carro-imagen">
                    <img src="${this.imagenProducto}" alt="${this.nombreProducto}" 
                         onerror="this.src='css/img/default.jpg'">
                </div>
                <div class="carro-detalle">
                    <h4 class="item-nombre">${this.nombreProducto}</h4>
                    <p class="carro-precio">$${this.precioUnitario.toFixed(2)} x ${this.cantidad}</p>
                    <p class="carro-total">Subtotal: $${costoTotal.toFixed(2)}</p>
                    <div class="carro-controles">
                        <button class="btn-cantidad btn-disminuir" 
                                onclick="pedidoActual.disminuirCantidad(${index})"
                                ${this.cantidad <= 1 ? 'disabled' : ''}>-</button>
                        <span class="cantidad">${this.cantidad}</span>
                        <button class="btn-cantidad btn-aumentar" 
                                onclick="pedidoActual.aumentarCantidad(${index})"
                                ${!this.puedeAgregarCantidad(1) ? 'disabled' : ''}>+</button>
                        <button class="btn-eliminar" 
                                onclick="pedidoActual.eliminarEspecificacion(${index})"
                                title="Eliminar producto">🗑️</button>
                    </div>
                    <small class="stock-info">Stock disponible: ${this.stockDisponible}</small>
                </div>
            </div>
        `;
    }
}

// Clase Pedido siguiendo el diagrama
class Pedido {
    constructor() {
        this.idPedido = this.generarIdPedido();
        this.idCliente = null; // Se asignará cuando se implemente autenticación
        this.idDelivery = null;
        this.idPago = null;
        this.fecha = new Date();
        this.total = 0;
        this.puntuacion = null;
        this.comentario = '';
        this.estado = 'carrito'; // carrito, confirmado, preparando, enviado, entregado
        
        // Array de especificaciones de pedido
        this.especificaciones = [];
        
        // Elementos del DOM
        this.initializeDOM();
    }

    // Inicializar elementos del DOM
    initializeDOM() {
        this.carroBoton = document.getElementById('carro-boton');
        this.carroCount = document.getElementById('carro-count');
        this.carroModelo = document.getElementById('carro-modelo');
        this.cerrarCarroBoton = document.getElementById('cerrar-carro');
        this.carroContenido = document.getElementById('carro-contenido');
        this.carroTotal = document.getElementById('carro-total');
        this.confirmarOrdenBoton = document.getElementById('confirmar-pedido');
        
        this.setupEventListeners();
    }

    // Configurar event listeners
    setupEventListeners() {
        if (this.carroBoton) {
            this.carroBoton.addEventListener('click', () => this.mostrarCarrito());
        }
        
        if (this.cerrarCarroBoton) {
            this.cerrarCarroBoton.addEventListener('click', () => this.ocultarCarrito());
        }
        
        if (this.confirmarOrdenBoton) {
            this.confirmarOrdenBoton.addEventListener('click', () => this.confirmarPedido());
        }
        
        // Cerrar al hacer click en el overlay
        const overlay = document.querySelector('.carro-ventana');
        if (overlay) {
            overlay.addEventListener('click', () => this.ocultarCarrito());
        }
    }

    // Generar ID único para el pedido
    generarIdPedido() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `PED-${timestamp}-${random}`;
    }

    // +crearPedido(): void
    crearPedido(clienteId = null) {
        this.idCliente = clienteId;
        this.fecha = new Date();
        this.estado = 'creado';
        console.log(`Pedido creado: ${this.idPedido}`);
    }

    // +confirmarPedido(): void
    confirmarPedido() {
        if (this.especificaciones.length === 0) {
            alert('No hay productos en el carrito.');
            return false;
        }

        // Validar stock antes de confirmar
        if (!this.validarStockDisponible()) {
            alert('Algunos productos no tienen stock suficiente.');
            return false;
        }

        // Calcular total
        this.calcularTotal();
        
        // Cambiar estado
        this.estado = 'confirmado';
        
        // Guardar datos para el proceso de pago
        this.guardarParaPago();
        
        // Redirigir a página de pago
        window.location.href = 'pago.html';
        
        return true;
    }

    // +calificarPedido(): void
    calificarPedido(puntuacion, comentario = '') {
        if (this.estado !== 'entregado') {
            console.warn('Solo se pueden calificar pedidos entregados');
            return false;
        }
        
        this.puntuacion = Math.max(1, Math.min(5, puntuacion)); // Entre 1 y 5
        this.comentario = comentario;
        
        console.log(`Pedido ${this.idPedido} calificado con ${this.puntuacion} estrellas`);
        return true;
    }

    // +listarPedidos(): Array (método estático)
    static async listarPedidos(clienteId = null) {
        try {
            const url = clienteId 
                ? `${API_URL}/pedidos?cliente=${clienteId}` 
                : `${API_URL}/pedidos`;
                
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Error al obtener pedidos');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error al listar pedidos:', error);
            return [];
        }
    }

    // Métodos para gestionar especificaciones de productos

    // Agregar producto al pedido
    agregarProducto(producto) {
        const idProducto = producto.dataset?.idProducto || 
                          producto.querySelector('[data-id]')?.dataset.id ||
                          producto.dataset.nombre;
        
        const nombre = producto.dataset.nombre;
        const precio = parseFloat(producto.dataset.precio);
        const stock = parseInt(producto.dataset.stock);
        const imgTag = producto.querySelector('.producto-imagen img');
        const imgSrc = imgTag ? imgTag.getAttribute('src') : '';
        
        // Verificar stock
        if (stock <= 0) {
            this.mostrarMensaje('Este producto no tiene stock disponible.', 'error');
            return false;
        }
        
        // Buscar si ya existe una especificación para este producto
        const especificacionExistente = this.especificaciones.find(
            esp => esp.idProducto === idProducto
        );
        
        if (especificacionExistente) {
            // Verificar si se puede agregar más cantidad
            if (!especificacionExistente.puedeAgregarCantidad(1)) {
                this.mostrarMensaje(`No puedes agregar más de ${stock} unidades de este producto.`, 'warning');
                return false;
            }
            especificacionExistente.añadirProducto(1);
        } else {
            // Crear nueva especificación
            const nuevaEspecificacion = new EspecificacionDePedido(
                idProducto,
                this.idPedido,
                { nombre, imgSrc, stock },
                1,
                precio
            );
            this.especificaciones.push(nuevaEspecificacion);
        }
        
        this.actualizarContadorCarrito();
        this.mostrarFeedbackAgregarProducto(producto);
        
        return true;
    }

    // Aumentar cantidad de un producto
    aumentarCantidad(index) {
        if (index >= 0 && index < this.especificaciones.length) {
            const especificacion = this.especificaciones[index];
            if (especificacion.añadirProducto(1)) {
                this.renderizarCarrito();
            } else {
                this.mostrarMensaje('No hay suficiente stock disponible.', 'warning');
            }
        }
    }

    // Disminuir cantidad de un producto
    disminuirCantidad(index) {
        if (index >= 0 && index < this.especificaciones.length) {
            const especificacion = this.especificaciones[index];
            if (especificacion.cantidad > 1) {
                especificacion.removerProducto(1);
                this.renderizarCarrito();
            } else {
                this.eliminarEspecificacion(index);
            }
        }
    }

    // Eliminar especificación completa
    eliminarEspecificacion(index) {
        if (index >= 0 && index < this.especificaciones.length) {
            this.especificaciones.splice(index, 1);
            this.actualizarContadorCarrito();
            this.renderizarCarrito();
        }
    }

    // Calcular total del pedido
    calcularTotal() {
        this.total = this.especificaciones.reduce((sum, esp) => sum + esp.calcularCosto(), 0);
        return this.total;
    }

    // Validar stock disponible
    validarStockDisponible() {
        return this.especificaciones.every(esp => esp.cantidad <= esp.stockDisponible);
    }

    // Métodos de UI

    // Mostrar carrito
    mostrarCarrito() {
        if (this.carroModelo) {
            this.carroModelo.classList.remove('carro-oculto');
            this.carroModelo.classList.add('carro-visible');
            this.renderizarCarrito();
        }
    }

    // Ocultar carrito
    ocultarCarrito() {
        if (this.carroModelo) {
            this.carroModelo.classList.add('carro-oculto');
            this.carroModelo.classList.remove('carro-visible');
        }
    }

    // Renderizar contenido del carrito
    renderizarCarrito() {
        if (!this.carroContenido) return;

        this.carroContenido.innerHTML = '';
        
        if (this.especificaciones.length === 0) {
            this.carroContenido.innerHTML = `
                <div class="carrito-vacio">
                    <p>Tu carrito está vacío.</p>
                    <button onclick="pedidoActual.ocultarCarrito()" class="btn-continuar">
                        Continuar comprando
                    </button>
                </div>
            `;
        } else {
            // Renderizar cada especificación
            this.especificaciones.forEach((especificacion, index) => {
                const especificacionHTML = document.createElement('div');
                especificacionHTML.innerHTML = especificacion.generarHTML(index);
                this.carroContenido.appendChild(especificacionHTML.firstElementChild);
            });
        }

        // Actualizar total
        this.actualizarTotalCarrito();
    }

    // Actualizar contador del carrito
    actualizarContadorCarrito() {
        if (this.carroCount) {
            const totalCantidad = this.especificaciones.reduce((sum, esp) => sum + esp.cantidad, 0);
            this.carroCount.textContent = totalCantidad;
        }
    }

    // Actualizar total del carrito
    actualizarTotalCarrito() {
        if (this.carroTotal) {
            const total = this.calcularTotal();
            this.carroTotal.textContent = `$${total.toFixed(2)}`;
        }
    }

    // Mostrar feedback visual al agregar producto
    mostrarFeedbackAgregarProducto(producto) {
        const boton = producto.querySelector('.añadirCarro');
        if (boton) {
            const textoOriginal = boton.textContent;
            boton.textContent = '¡Agregado!';
            boton.style.backgroundColor = '#28a745';
            
            setTimeout(() => {
                boton.textContent = textoOriginal;
                boton.style.backgroundColor = '';
            }, 1000);
        }
    }

    // Mostrar mensajes al usuario
    mostrarMensaje(mensaje, tipo = 'info') {
        // Crear elemento de mensaje
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = `mensaje-temporal mensaje-${tipo}`;
        mensajeDiv.textContent = mensaje;
        
        // Estilos básicos
        mensajeDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'error' ? '#dc3545' : tipo === 'warning' ? '#ffc107' : '#17a2b8'};
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        
        document.body.appendChild(mensajeDiv);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            if (mensajeDiv.parentNode) {
                mensajeDiv.parentNode.removeChild(mensajeDiv);
            }
        }, 3000);
    }

    // Guardar datos para el proceso de pago
    guardarParaPago() {
        const datosCarrito = this.especificaciones.map(esp => ({
            nombre: esp.nombreProducto,
            precio: esp.precioUnitario,
            cantidad: esp.cantidad,
            imgSrc: esp.imagenProducto
        }));
        
        localStorage.setItem('carrito', JSON.stringify(datosCarrito));
        localStorage.setItem('total', `$${this.calcularTotal().toFixed(2)}`);
        localStorage.setItem('pedidoId', this.idPedido);
    }

    // Vaciar carrito
    vaciarCarrito() {
        this.especificaciones = [];
        this.total = 0;
        this.actualizarContadorCarrito();
        this.renderizarCarrito();
    }

    // Obtener resumen del pedido
    obtenerResumen() {
        return {
            idPedido: this.idPedido,
            fecha: this.fecha,
            estado: this.estado,
            cantidadItems: this.especificaciones.length,
            cantidadTotal: this.especificaciones.reduce((sum, esp) => sum + esp.cantidad, 0),
            total: this.calcularTotal(),
            especificaciones: this.especificaciones
        };
    }
}

// Función para inicializar event listeners en productos
function inicializarCarrito() {
    // Remover event listeners existentes
    document.querySelectorAll('.añadirCarro').forEach(btn => {
        const nuevoBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(nuevoBtn, btn);
    });
    
    // Agregar nuevos event listeners
    document.querySelectorAll('.añadirCarro').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const producto = btn.closest('.producto');
            if (producto) {
                pedidoActual.agregarProducto(producto);
            }
        });
    });
}

// Instancia global del pedido actual
let pedidoActual = null;

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    pedidoActual = new Pedido();
    console.log('Sistema de carrito inicializado');
});

// Funciones globales para compatibilidad
window.inicializarCarrito = inicializarCarrito;
window.pedidoActual = pedidoActual;

// Funciones globales para usar desde HTML (compatibilidad hacia atrás)
window.cambiarCantidad = function(index, cambio) {
    if (!pedidoActual) return;
    
    if (cambio > 0) {
        pedidoActual.aumentarCantidad(index);
    } else {
        pedidoActual.disminuirCantidad(index);
    }
};

window.eliminarDelCarro = function(index) {
    if (pedidoActual) {
        pedidoActual.eliminarEspecificacion(index);
    }
};

// Exportar clases para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EspecificacionDePedido, Pedido };
}