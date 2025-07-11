// js/utils/api.js - API simplificada que usa DATABASE

// Configuración global de la API
window.API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3
};

// API simplificada que usa la clase DATABASE
window.api = {
    // =================== PRODUCTOS ===================
    productos: {
        obtener: () => window.DATABASE.obtenerProductos(),
        crear: (producto) => window.DATABASE.insertProducto(producto),
        actualizar: (id, producto) => window.DATABASE.updateProducto(id, producto),
        eliminar: (id) => window.DATABASE.deleteProducto(id)
    },

    // =================== PEDIDOS ===================
    pedidos: {
        obtener: (filtros) => window.DATABASE.obtenerPedidos(filtros),
        crear: (pedido) => window.DATABASE.insertPedido(pedido),
        actualizar: (id, pedido) => window.DATABASE.updatePedido(id, pedido)
    },

    // =================== USUARIOS ===================
    usuarios: {
        crear: (usuario) => window.DATABASE.createUser(usuario),
        actualizar: (id, usuario) => window.DATABASE.updateUsuario(id, usuario),
        validar: (usuario, contraseña) => window.DATABASE.validacion(usuario, contraseña),
        autenticar: (usuario, contraseña) => window.DATABASE.autenticar(usuario, contraseña)
    },

    // =================== CONEXIÓN ===================
    async verificarConexion() {
        try {
            await window.DATABASE.obtenerProductos();
            console.log('✅ DATABASE: Conexión verificada');
            return true;
        } catch (error) {
            console.warn('⚠️ DATABASE: Error de conexión');
            return false;
        }
    }
};

// Auto-verificar conexión al cargar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(async () => {
        if (window.DATABASE) {
            await window.api.verificarConexion();
        }
    }, 1000);
});