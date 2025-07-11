// js/productos.js - Lógica específica de la página de productos

// Clase para gestionar el catálogo de productos (implementa +listarProductos())
class CatalogoProductos {
    constructor() {
        this.productos = [];
        this.catalogoElement = document.getElementById('catalogo');
    }

    // +listarProductos(): Array<Producto>
    async listarProductos() {
        try {
            // Mostrar loading
            this.mostrarLoading();
            
            // Obtener desde DATABASE
            const productosData = await window.api.productos.obtener();
            
            // Convertir datos a instancias de Producto
            this.productos = productosData.map(data => Producto.fromAPI(data));
            
            this.mostrarProductos();
            return this.productos;
            
        } catch (error) {
            console.error('Error al listar productos:', error);
            this.mostrarError(error.message);
            return [];
        }
    }

    // Mostrar loading
    mostrarLoading() {
        if (!this.catalogoElement) return;
        
        this.catalogoElement.innerHTML = `
            <div class="loading-productos">
                <div class="spinner"></div>
                <p>🔄 Cargando productos...</p>
            </div>
        `;
    }

    // Mostrar productos en el DOM
    mostrarProductos() {
        if (!this.catalogoElement) {
            console.error('Elemento catálogo no encontrado');
            return;
        }

        // Limpiar contenido actual
        this.catalogoElement.innerHTML = '';
        
        // Si no hay productos
        if (this.productos.length === 0) {
            this.catalogoElement.innerHTML = `
                <div class="sin-productos">
                    <div class="sin-productos-icono">📦</div>
                    <h3>No hay productos disponibles</h3>
                    <p>Por favor, intenta nuevamente más tarde.</p>
                    <button onclick="window.catalogo.refrescar()" class="btn-reintentar">
                        🔄 Reintentar
                    </button>
                </div>
            `;
            return;
        }
        
        // Crear contenedor de productos
        const productosContainer = document.createElement('div');
        productosContainer.className = 'productos-grid';
        
        // Generar HTML para cada producto
        this.productos.forEach(producto => {
            const productoElement = document.createElement('div');
            productoElement.innerHTML = producto.generarHTML();
            productosContainer.appendChild(productoElement.firstElementChild);
        });
        
        this.catalogoElement.appendChild(productosContainer);
        
        // Reactivar event listeners del carrito
        this.activarEventListeners();
    }

    // Activar event listeners para los productos
    activarEventListeners() {
        // Usar el sistema global de inicialización del carrito
        if (typeof window.inicializarCarrito === 'function') {
            window.inicializarCarrito();
        }
    }

    // Métodos de búsqueda y filtrado
    buscarProductoPorId(id) {
        return this.productos.find(producto => producto.idProducto == id);
    }

    buscarProductoPorNombre(nombre) {
        return this.productos.find(producto => 
            producto.nombre.toLowerCase() === nombre.toLowerCase()
        );
    }

    filtrarProductosConStock() {
        return this.productos.filter(producto => producto.verificarStock());
    }

    filtrarProductosPorPrecio(min, max) {
        return this.productos.filter(producto => 
            producto.precio >= min && producto.precio <= max
        );
    }

    buscarProductos(termino) {
        const terminoLower = termino.toLowerCase();
        return this.productos.filter(producto => 
            producto.nombre.toLowerCase().includes(terminoLower) ||
            producto.descripcion.toLowerCase().includes(terminoLower) ||
            producto.getIngredientesFormateados().toLowerCase().includes(terminoLower)
        );
    }

    // Actualizar stock de un producto y sincronizar con backend
    async actualizarStockProducto(nombre, cantidad) {
        const producto = this.buscarProductoPorNombre(nombre);
        if (producto && producto.reducirStock(cantidad)) {
            try {
                // Actualizar en backend
                await producto.modificarProducto({
                    stock: producto.stock
                });
                
                // Actualizar visualmente
                this.actualizarStockEnDOM(producto);
                
                return true;
            } catch (error) {
                // Revertir cambio local si falla el backend
                producto.agregarStock(cantidad);
                console.error('Error al actualizar stock:', error);
                return false;
            }
        }
        return false;
    }

    // Actualizar stock en el DOM
    actualizarStockEnDOM(producto) {
        const productoElement = document.querySelector(`[data-id="${producto.idProducto}"]`);
        if (productoElement) {
            const stockElement = productoElement.querySelector('.stock');
            const botonElement = productoElement.querySelector('.añadirCarro');
            
            if (stockElement) {
                stockElement.textContent = `En stock: ${producto.stock} unidades`;
                stockElement.className = `stock ${producto.stock <= 5 ? 'stock-bajo' : ''}`;
            }
            
            if (botonElement) {
                if (!producto.verificarStock()) {
                    botonElement.disabled = true;
                    botonElement.textContent = 'Sin stock';
                } else {
                    botonElement.disabled = false;
                    botonElement.textContent = 'Agregar al carrito';
                }
            }
        }
    }

    // Métodos de utilidad
    cargarProductos() {
        return this.listarProductos();
    }

    async refrescar() {
        // Recargar productos desde el servidor
        return this.listarProductos();
    }

    obtenerEstadisticas() {
        const total = this.productos.length;
        const conStock = this.filtrarProductosConStock().length;
        const sinStock = total - conStock;
        const precioPromedio = this.productos.reduce((sum, p) => sum + p.precio, 0) / total;

        return {
            total,
            conStock,
            sinStock,
            precioPromedio: isNaN(precioPromedio) ? 0 : precioPromedio,
            productos: this.productos
        };
    }

    // Ordenar productos
    ordenarProductos(criterio = 'nombre', direccion = 'asc') {
        this.productos.sort((a, b) => {
            let valorA, valorB;
            
            switch (criterio) {
                case 'precio':
                    valorA = a.precio;
                    valorB = b.precio;
                    break;
                case 'stock':
                    valorA = a.stock;
                    valorB = b.stock;
                    break;
                case 'nombre':
                default:
                    valorA = a.nombre.toLowerCase();
                    valorB = b.nombre.toLowerCase();
                    break;
            }
            
            if (direccion === 'desc') {
                return valorA < valorB ? 1 : valorA > valorB ? -1 : 0;
            } else {
                return valorA > valorB ? 1 : valorA < valorB ? -1 : 0;
            }
        });
        
        this.mostrarProductos();
    }
}

// Instancia global del catálogo
window.catalogo = new CatalogoProductos();

// Event listeners y inicialización
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Inicializando catálogo de productos...');
    
    // Verificar conexión antes de cargar productos
    const conexionOK = await window.api.verificarConexion();
    if (conexionOK) {
        window.catalogo.cargarProductos();
    } else {
        if (window.catalogo.catalogoElement) {
            window.catalogo.mostrarError('No se puede conectar con el servidor. Verifique que el backend esté ejecutándose.');
        }
    }
});

// Funciones globales para compatibilidad
window.cargarProductos = () => window.catalogo.cargarProductos();
window.refrescarProductos = () => window.catalogo.refrescar();

// Funciones para filtros y búsqueda (para usar desde HTML)
window.buscarProductos = function(termino) {
    if (!termino || termino.trim() === '') {
        window.catalogo.mostrarProductos();
        return;
    }
    
    const productosEncontrados = window.catalogo.buscarProductos(termino);
    window.catalogo.productos = productosEncontrados;
    window.catalogo.mostrarProductos();
};

window.filtrarPorPrecio = function(min, max) {
    const productosFiltrados = window.catalogo.filtrarProductosPorPrecio(min, max);
    window.catalogo.productos = productosFiltrados;
    window.catalogo.mostrarProductos();
};

window.ordenarProductos = function(criterio, direccion) {
    window.catalogo.ordenarProductos(criterio, direccion);
};

// Función para resetear filtros
window.resetearFiltros = function() {
    window.catalogo.refrescar();
};