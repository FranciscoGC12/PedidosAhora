// js/classes/Database.js - Clase DATABASE exactamente según el diagrama UML

class DATABASE {
    constructor() {
        this.conexionDB = window.API_CONFIG?.BASE_URL || 'http://localhost:5000/api';
    }

    // +createUser()
    async createUser(datosUsuario) {
        const response = await fetch(`${this.conexionDB}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosUsuario)
        });
        
        if (!response.ok) {
            throw new Error('Error al crear usuario');
        }
        
        return await response.json();
    }

    // +validacion()
    async validacion(usuario, contraseña) {
        try {
            const response = await fetch(`${this.conexionDB}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, contraseña })
            });
            
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // +autenticar()
    async autenticar(usuario, contraseña) {
        const esValido = await this.validacion(usuario, contraseña);
        
        if (esValido) {
            // Buscar el usuario para devolver sus datos
            const response = await fetch(`${this.conexionDB}/usuarios?usuario=${usuario}`);
            if (response.ok) {
                const usuarios = await response.json();
                return usuarios.length > 0 ? usuarios[0] : null;
            }
        }
        
        return null;
    }

    // +updateUsuario()
    async updateUsuario(idUsuario, nuevosData) {
        const response = await fetch(`${this.conexionDB}/usuarios/${idUsuario}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevosData)
        });
        
        if (!response.ok) {
            throw new Error('Error al actualizar usuario');
        }
        
        return await response.json();
    }

    // +insertProducto()
    async insertProducto(datosProducto) {
        const response = await fetch(`${this.conexionDB}/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosProducto)
        });
        
        if (!response.ok) {
            throw new Error('Error al insertar producto');
        }
        
        return await response.json();
    }

    // +updateProducto()
    async updateProducto(idProducto, nuevosData) {
        const response = await fetch(`${this.conexionDB}/productos/${idProducto}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevosData)
        });
        
        if (!response.ok) {
            throw new Error('Error al actualizar producto');
        }
        
        return await response.json();
    }

    // +deleteProducto()
    async deleteProducto(idProducto) {
        const response = await fetch(`${this.conexionDB}/productos/${idProducto}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar producto');
        }
        
        return true;
    }

    // +obtenerProductos()
    async obtenerProductos() {
        const response = await fetch(`${this.conexionDB}/productos`);
        
        if (!response.ok) {
            throw new Error('Error al obtener productos');
        }
        
        return await response.json();
    }

    // +insertPedido()
    async insertPedido(datosPedido) {
        const response = await fetch(`${this.conexionDB}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPedido)
        });
        
        if (!response.ok) {
            throw new Error('Error al insertar pedido');
        }
        
        return await response.json();
    }

    // +updatePedido()
    async updatePedido(idPedido, nuevosData) {
        const response = await fetch(`${this.conexionDB}/pedidos/${idPedido}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevosData)
        });
        
        if (!response.ok) {
            throw new Error('Error al actualizar pedido');
        }
        
        return await response.json();
    }

    // +obtenerPedidos()
    async obtenerPedidos(filtros = {}) {
        let endpoint = `${this.conexionDB}/pedidos`;
        
        if (Object.keys(filtros).length > 0) {
            const params = new URLSearchParams(filtros);
            endpoint += `?${params.toString()}`;
        }
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error('Error al obtener pedidos');
        }
        
        return await response.json();
    }
}

// Crear instancia global
window.DATABASE = new DATABASE();

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DATABASE;
}

// Crear instancia global
window.DATABASE = new DATABASE();

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DATABASE;
}