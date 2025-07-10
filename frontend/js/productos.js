// producto.js - Clase Producto y gestión mejorada

class Producto {
    constructor(data) {
        this.idProducto = data.idproducto || data.id;
        this.nombre = data.nombre;
        this.stock = data.stock || 0;
        this.descripcion = data.descripcion || '';
        this.precio = parseFloat(data.precio);
        this.ingredientes = data.ingredientes || '';
        this.imagen = data.imagen || 'img/default.jpg';
    }

    // Método para verificar si hay stock disponible
    tieneStock() {
        return this.stock > 0;
    }

    // Método para reducir stock
    reducirStock(cantidad = 1) {
        if (this.stock >= cantidad) {
            this.stock -= cantidad;
            return true;
        }
        return false;
    }

    // Método para agregar stock
    agregarStock(cantidad) {
        this.stock += cantidad;
    }

    // Método para verificar si se puede agregar cierta cantidad
    puedeAgregar(cantidad) {
        return this.stock >= cantidad;
    }

    // Método para obtener el precio formateado
    getPrecioFormateado() {
        return `$${this.precio.toFixed(2)}`;
    }

    // Método para generar el HTML del producto
    generarHTML() {
        return `
            <div class="producto" data-id="${this.idProducto}" data-nombre="${this.nombre}" data-precio="${this.precio}" data-stock="${this.stock}">
                <div class="producto-imagen">
                    <img src="css/${this.imagen}" alt="${this.nombre}">
                </div>
                <div class="producto-detalle">
                    <h3>${this.nombre}</h3>
                    <p>${this.descripcion}</p>
                    <p class="stock">En stock: ${this.stock} unidades</p>
                    <div class="precio-boton">
                        <span>${this.getPrecioFormateado()}</span>
                        <button class="añadirCarro" ${!this.tieneStock() ? 'disabled' : ''}>
                            ${!this.tieneStock() ? 'Sin stock' : 'Agregar al carrito'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Método para actualizar el producto en la base de datos
    async actualizar() {
        try {
            const response = await fetch(`${API_URL}/productos/${this.idProducto}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: this.nombre,
                    stock: this.stock,
                    descripcion: this.descripcion,
                    precio: this.precio,
                    ingredientes: this.ingredientes,
                    imagen: this.imagen
                })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar producto');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            throw error;
        }
    }

    // Método estático para crear producto desde datos de API
    static fromAPI(data) {
        return new Producto(data);
    }
}

// Clase para gestionar el catálogo de productos
class CatalogoProductos {
    constructor() {
        this.productos = [];
        this.catalogoElement = document.getElementById('catalogo');
    }

    // Cargar productos desde la API
    async cargarProductos() {
        try {
            const response = await fetch(`${API_URL}/productos`);
            
            if (!response.ok) {
                throw new Error('Error al cargar productos');
            }
            
            const productosData = await response.json();
            
            // Convertir datos a instancias de Producto
            this.productos = productosData.map(data => Producto.fromAPI(data));
            
            this.mostrarProductos();
            
        } catch (error) {
            console.error('Error:', error);
            this.mostrarError();
        }
    }

    // Mostrar productos en el DOM
    mostrarProductos() {
        if (!this.catalogoElement) return;

        // Limpiar contenido actual
        this.catalogoElement.innerHTML = '';
        
        // Si no hay productos
        if (this.productos.length === 0) {
            this.catalogoElement.innerHTML = '<p>No hay productos disponibles.</p>';
            return;
        }
        
        // Generar HTML para cada producto
        this.productos.forEach(producto => {
            this.catalogoElement.innerHTML += producto.generarHTML();
        });
        
        // Reactivar event listeners del carrito
        if (typeof inicializarCarrito === 'function') {
            inicializarCarrito();
        }
    }

    // Mostrar error
    mostrarError() {
        if (!this.catalogoElement) return;

        this.catalogoElement.innerHTML = `
            <div class="error">
                <p>Error al cargar los productos. Por favor, intenta nuevamente.</p>
                <button onclick="catalogo.cargarProductos()">Reintentar</button>
            </div>
        `;
    }

    // Buscar producto por ID
    buscarProductoPorId(id) {
        return this.productos.find(producto => producto.idProducto == id);
    }

    // Buscar producto por nombre
    buscarProductoPorNombre(nombre) {
        return this.productos.find(producto => producto.nombre === nombre);
    }

    // Filtrar productos por stock disponible
    obtenerProductosConStock() {
        return this.productos.filter(producto => producto.tieneStock());
    }

    // Actualizar stock de un producto
    actualizarStockProducto(nombre, cantidad) {
        const producto = this.buscarProductoPorNombre(nombre);
        if (producto) {
            if (producto.reducirStock(cantidad)) {
                // Actualizar visualmente el stock en el DOM
                this.actualizarStockEnDOM(producto);
                return true;
            }
        }
        return false;
    }

    // Actualizar stock en el DOM
    actualizarStockEnDOM(producto) {
        const productoElement = document.querySelector(`[data-nombre="${producto.nombre}"]`);
        if (productoElement) {
            const stockElement = productoElement.querySelector('.stock');
            const botonElement = productoElement.querySelector('.añadirCarro');
            
            if (stockElement) {
                stockElement.textContent = `En stock: ${producto.stock} unidades`;
            }
            
            if (botonElement) {
                if (!producto.tieneStock()) {
                    botonElement.disabled = true;
                    botonElement.textContent = 'Sin stock';
                }
            }
        }
    }

    // Refrescar productos
    refrescar() {
        this.cargarProductos();
    }
}

// Instancia global del catálogo
const catalogo = new CatalogoProductos();

// Cargar productos cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
    catalogo.cargarProductos();
});

// Función global para compatibilidad con código existente
function cargarProductos() {
    catalogo.cargarProductos();
}

function refrescarProductos() {
    catalogo.refrescar();
}