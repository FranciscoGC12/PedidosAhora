// js/classes/Producto.js - Clase Producto siguiendo el diagrama de clases

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

    // Métodos del diagrama de clases SOLAMENTE

    // +verificarStock(): boolean
    verificarStock(cantidad = 1) {
        return this.stock >= cantidad;
    }

    // +agregarProducto(): void (método estático para crear nuevo producto)
    static async agregarProducto(datosProducto) {
        // Por ahora vacío - para interactuar con base de datos
        console.log('agregarProducto() - Método para implementar en el futuro');
    }

    // +modificarProducto(): void
    async modificarProducto(nuevosData) {
        // Por ahora vacío - para interactuar con base de datos
        console.log('modificarProducto() - Método para implementar en el futuro');
    }

    // +eliminarProducto(): void
    async eliminarProducto() {
        // Por ahora vacío - para interactuar con base de datos
        console.log('eliminarProducto() - Método para implementar en el futuro');
    }

    // +listarProductos(): Array (método estático)
    static async listarProductos() {
        try {
            // Usar DATABASE para obtener productos
            const productosData = await window.DATABASE.obtenerProductos();
            
            // Convertir datos a instancias de Producto
            return productosData.map(data => new Producto(data));
        } catch (error) {
            console.error('Error al listar productos:', error);
            return [];
        }
    }
}

// Exportar la clase para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Producto;
}

// Hacer disponible globalmente para compatibilidad
window.Producto = Producto;