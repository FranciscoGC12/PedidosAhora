// js/classes/EspecificacionDePedido.js - Clase EspecificacionDePedido siguiendo el diagrama

class EspecificacionDePedido {
    constructor(idProducto, idPedido, producto, cantidad = 1, precioUnitario = 0, ingredientesPersonalizados = null) {
        this.idPedido = idPedido;
        this.idProducto = idProducto;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        
        // NUEVO: Array de ingredientes personalizados
        this.ingredientes = ingredientesPersonalizados || this.copiarIngredientesOriginales(producto);
        
        // Información adicional del producto para mostrar
        this.nombreProducto = producto.nombre || '';
        this.imagenProducto = producto.imgSrc || producto.imagen || '';
        this.stockDisponible = producto.stock || 0;
        this.ingredientesOriginales = this.copiarIngredientesOriginales(producto); // Backup de ingredientes originales
    }

    // Copiar ingredientes originales del producto
    copiarIngredientesOriginales(producto) {
        if (!producto.ingredientes) return [];
        
        if (Array.isArray(producto.ingredientes)) {
            return [...producto.ingredientes]; // Copia del array
        }
        
        if (typeof producto.ingredientes === 'string') {
            try {
                const ingredientesArray = JSON.parse(producto.ingredientes);
                return Array.isArray(ingredientesArray) ? [...ingredientesArray] : [];
            } catch {
                return [];
            }
        }
        
        return [];
    }

    // Métodos del diagrama de clases

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

    // Métodos para gestionar ingredientes

    // Verificar si un ingrediente está incluido
    tieneIngrediente(ingrediente) {
        return this.ingredientes.includes(ingrediente);
    }

    // Agregar ingrediente (si no está)
    agregarIngrediente(ingrediente) {
        if (!this.tieneIngrediente(ingrediente)) {
            this.ingredientes.push(ingrediente);
        }
    }

    // Remover ingrediente
    removerIngrediente(ingrediente) {
        const index = this.ingredientes.indexOf(ingrediente);
        if (index > -1) {
            this.ingredientes.splice(index, 1);
        }
    }

    // Obtener ingredientes excluidos (los que están en original pero no en actual)
    getIngredientesExcluidos() {
        return this.ingredientesOriginales.filter(ing => !this.tieneIngrediente(ing));
    }

    // Obtener texto de personalización para mostrar
    getTextoPersonalizacion() {
        const excluidos = this.getIngredientesExcluidos();
        if (excluidos.length === 0) return '';
        
        return `Sin ${excluidos.join(', Sin ')}`;
    }

    // Obtener nombre completo con personalización
    getNombreCompleto() {
        const personalizacion = this.getTextoPersonalizacion();
        return personalizacion ? `${this.nombreProducto} (${personalizacion})` : this.nombreProducto;
    }

    // Verificar si esta especificación es igual a otra (mismo producto + mismos ingredientes)
    esIgualA(otraEspecificacion) {
        if (this.idProducto !== otraEspecificacion.idProducto) {
            return false;
        }
        
        // Comparar ingredientes
        if (this.ingredientes.length !== otraEspecificacion.ingredientes.length) {
            return false;
        }
        
        // Verificar que todos los ingredientes coincidan
        const misIngredientesOrdenados = [...this.ingredientes].sort();
        const otrosIngredientesOrdenados = [...otraEspecificacion.ingredientes].sort();
        
        return misIngredientesOrdenados.every((ing, index) => ing === otrosIngredientesOrdenados[index]);
    }

    // Métodos adicionales

    // Método para validar si se puede agregar cierta cantidad
    puedeAgregarCantidad(cantidad) {
        return (this.cantidad + cantidad) <= this.stockDisponible;
    }

    // Validar que la especificación sea válida
    esValida() {
        return this.cantidad > 0 && 
               this.cantidad <= this.stockDisponible && 
               this.precioUnitario > 0;
    }

    // Obtener información formateada para mostrar
    getInfoFormateada() {
        return {
            nombre: this.getNombreCompleto(),
            nombreBase: this.nombreProducto,
            personalizacion: this.getTextoPersonalizacion(),
            cantidad: this.cantidad,
            precioUnitario: this.precioUnitario,
            subtotal: this.calcularCosto(),
            precioFormateado: `${this.precioUnitario.toLocaleString('es-AR')}`,
            subtotalFormateado: `${this.calcularCosto().toLocaleString('es-AR')}`,
            ingredientes: [...this.ingredientes],
            ingredientesExcluidos: this.getIngredientesExcluidos()
        };
    }

    // Generar HTML para mostrar en el carrito
    generarHTML(index) {
        const info = this.getInfoFormateada();
        
        return `
            <div class="carro-item" data-index="${index}" data-id-producto="${this.idProducto}">
                <div class="carro-imagen">
                    <img src="${this.imagenProducto}" alt="${this.nombreProducto}" 
                         onerror="this.src='css/img/default.jpg'">
                </div>
                <div class="carro-detalle">
                    <h4 class="item-nombre">${info.nombreBase}</h4>
                    ${info.personalizacion ? `<p class="item-personalizacion">${info.personalizacion}</p>` : ''}
                    <p class="carro-precio">${info.precioFormateado} x ${this.cantidad}</p>
                    <p class="carro-total">Subtotal: ${info.subtotalFormateado}</p>
                    <div class="carro-controles">
                        <button class="btn-cantidad btn-disminuir" 
                                onclick="window.pedidoActual.disminuirCantidad(${index})"
                                ${this.cantidad <= 1 ? 'disabled' : ''}>-</button>
                        <span class="cantidad">${this.cantidad}</span>
                        <button class="btn-cantidad btn-aumentar" 
                                onclick="window.pedidoActual.aumentarCantidad(${index})"
                                ${!this.puedeAgregarCantidad(1) ? 'disabled' : ''}>+</button>
                        <button class="btn-eliminar" 
                                onclick="window.pedidoActual.eliminarEspecificacion(${index})"
                                title="Eliminar producto">🗑️</button>
                    </div>
                    <small class="stock-info">Stock disponible: ${this.stockDisponible}</small>
                </div>
            </div>
        `;
    }

    // Generar HTML simplificado para resúmenes
    generarHTMLResumen() {
        const info = this.getInfoFormateada();
        
        return `
            <div class="item-pedido-resumen">
                <img src="${this.imagenProducto}" alt="${this.nombreProducto}" class="item-imagen-small">
                <div class="item-detalle-resumen">
                    <div class="item-nombre">${info.nombre}</div>
                    <div class="item-cantidad-precio">${this.cantidad} x ${info.precioFormateado} = ${info.subtotalFormateado}</div>
                </div>
            </div>
        `;
    }

    // Convertir a objeto para almacenamiento
    toObject() {
        return {
            idPedido: this.idPedido,
            idProducto: this.idProducto,
            nombreProducto: this.nombreProducto,
            imagenProducto: this.imagenProducto,
            cantidad: this.cantidad,
            precioUnitario: this.precioUnitario,
            stockDisponible: this.stockDisponible,
            ingredientes: [...this.ingredientes], // Copia del array
            ingredientesOriginales: [...this.ingredientesOriginales]
        };
    }

    // Crear desde objeto almacenado
    static fromObject(obj) {
        const especificacion = new EspecificacionDePedido(
            obj.idProducto,
            obj.idPedido,
            {
                nombre: obj.nombreProducto,
                imgSrc: obj.imagenProducto,
                stock: obj.stockDisponible,
                ingredientes: obj.ingredientesOriginales || []
            },
            obj.cantidad,
            obj.precioUnitario,
            obj.ingredientes || []
        );
        
        return especificacion;
    }

    // Clonar especificación
    clonar() {
        return EspecificacionDePedido.fromObject(this.toObject());
    }

    // Actualizar información del producto (precio, nombre, etc.)
    actualizarInfoProducto(nuevoProducto) {
        if (nuevoProducto.nombre) this.nombreProducto = nuevoProducto.nombre;
        if (nuevoProducto.precio) this.precioUnitario = nuevoProducto.precio;
        if (nuevoProducto.imagen) this.imagenProducto = nuevoProducto.imagen;
        if (nuevoProducto.stock !== undefined) this.stockDisponible = nuevoProducto.stock;
    }
}

// Exportar la clase para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EspecificacionDePedido;
}

// Hacer disponible globalmente para compatibilidad
window.EspecificacionDePedido = EspecificacionDePedido;

// Exportar la clase para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EspecificacionDePedido;
}

// Hacer disponible globalmente para compatibilidad
window.EspecificacionDePedido = EspecificacionDePedido;