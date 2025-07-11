# base.py - Backend Flask mejorado para PedidosAhora
from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from datetime import datetime
import traceback

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configurar Supabase
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

# Verificar que las variables existen
if not url or not key:
    print("Error: SUPABASE_URL y SUPABASE_KEY deben estar configuradas en .env")
    exit(1)

# Debug: imprimir los valores (sin mostrar la key completa por seguridad)
print(f"URL: {url}")
print(f"Key exists: {bool(key)}")
print(f"Key length: {len(key) if key else 0}")

# Crear cliente Supabase
try:
    supabase: Client = create_client(url, key)
    print("Cliente Supabase creado exitosamente")
    
    # Probar conexión
    test_response = supabase.table('productos').select("count", count="exact").execute()
    print(f"Conexión exitosa. Productos en BD: {test_response.count}")
    
except Exception as e:
    print(f"Error al crear cliente Supabase: {e}")
    print(f"Traceback: {traceback.format_exc()}")
    exit(1)

# ================== RUTAS DE PRODUCTOS ==================

@app.route('/api/productos', methods=['GET'])
def get_productos():
    """Obtener todos los productos"""
    try:
        response = supabase.table('productos').select("*").execute()
        
        if response.data:
            return jsonify(response.data), 200
        else:
            return jsonify([]), 200
            
    except Exception as e:
        print(f"Error al obtener productos: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": "Error interno del servidor", "details": str(e)}), 500

@app.route('/api/productos/<int:idproducto>', methods=['GET'])
def get_producto(idproducto):
    """Obtener un producto específico por ID"""
    try:
        response = supabase.table('productos').select("*").eq('idproducto', idproducto).execute()
        
        if response.data and len(response.data) > 0:
            return jsonify(response.data[0]), 200
        else:
            return jsonify({"error": "Producto no encontrado"}), 404
            
    except Exception as e:
        print(f"Error al obtener producto {idproducto}: {e}")
        return jsonify({"error": "Error interno del servidor", "details": str(e)}), 500

@app.route('/api/productos', methods=['POST'])
def crear_producto():
    """Crear un nuevo producto"""
    try:
        data = request.json
        
        # Validar datos requeridos
        if not data:
            return jsonify({"error": "No se enviaron datos"}), 400
            
        campos_requeridos = ['nombre', 'precio']
        for campo in campos_requeridos:
            if campo not in data:
                return jsonify({"error": f"Campo requerido faltante: {campo}"}), 400
        
        # Preparar datos para inserción
        producto_data = {
            'nombre': data['nombre'],
            'precio': float(data['precio']),
            'stock': int(data.get('stock', 0)),
            'descripcion': data.get('descripcion', ''),
            'ingredientes': data.get('ingredientes', ''),
            'imagen': data.get('imagen', 'img/default.jpg')
        }
        
        response = supabase.table('productos').insert(producto_data).execute()
        
        if response.data:
            return jsonify(response.data[0]), 201
        else:
            return jsonify({"error": "Error al crear producto"}), 500
            
    except ValueError as e:
        return jsonify({"error": f"Error en formato de datos: {str(e)}"}), 400
    except Exception as e:
        print(f"Error al crear producto: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": "Error interno del servidor", "details": str(e)}), 500

@app.route('/api/productos/<int:idproducto>', methods=['PUT'])
def actualizar_producto(idproducto):
    """Actualizar un producto existente"""
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No se enviaron datos"}), 400
        
        # Preparar datos para actualización (solo campos enviados)
        producto_data = {}
        
        if 'nombre' in data:
            producto_data['nombre'] = data['nombre']
        if 'precio' in data:
            producto_data['precio'] = float(data['precio'])
        if 'stock' in data:
            producto_data['stock'] = int(data['stock'])
        if 'descripcion' in data:
            producto_data['descripcion'] = data['descripcion']
        if 'ingredientes' in data:
            producto_data['ingredientes'] = data['ingredientes']
        if 'imagen' in data:
            producto_data['imagen'] = data['imagen']
            
        if not producto_data:
            return jsonify({"error": "No hay datos válidos para actualizar"}), 400
        
        response = supabase.table('productos').update(producto_data).eq('idproducto', idproducto).execute()
        
        if response.data and len(response.data) > 0:
            return jsonify(response.data[0]), 200
        else:
            return jsonify({"error": "Producto no encontrado"}), 404
            
    except ValueError as e:
        return jsonify({"error": f"Error en formato de datos: {str(e)}"}), 400
    except Exception as e:
        print(f"Error al actualizar producto {idproducto}: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": "Error interno del servidor", "details": str(e)}), 500

@app.route('/api/productos/<int:idproducto>', methods=['DELETE'])
def eliminar_producto(idproducto):
    """Eliminar un producto"""
    try:
        # Verificar que el producto existe
        check_response = supabase.table('productos').select("idproducto").eq('idproducto', idproducto).execute()
        
        if not check_response.data or len(check_response.data) == 0:
            return jsonify({"error": "Producto no encontrado"}), 404
        
        # Eliminar producto
        response = supabase.table('productos').delete().eq('idproducto', idproducto).execute()
        
        return jsonify({"message": "Producto eliminado exitosamente", "id": idproducto}), 200
        
    except Exception as e:
        print(f"Error al eliminar producto {idproducto}: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": "Error interno del servidor", "details": str(e)}), 500

# ================== RUTAS DE PEDIDOS ==================

@app.route('/api/pedidos', methods=['GET'])
def get_pedidos():
    """Obtener todos los pedidos"""
    try:
        cliente_id = request.args.get('cliente')
        
        query = supabase.table('pedidos').select("*")
        
        if cliente_id:
            query = query.eq('idcliente', cliente_id)
            
        response = query.execute()
        
        return jsonify(response.data if response.data else []), 200
        
    except Exception as e:
        print(f"Error al obtener pedidos: {e}")
        return jsonify({"error": "Error interno del servidor", "details": str(e)}), 500

@app.route('/api/pedidos', methods=['POST'])
def crear_pedido():
    """Crear un nuevo pedido"""
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No se enviaron datos"}), 400
        
        # Preparar datos del pedido
        pedido_data = {
            'idcliente': data.get('idcliente'),
            'fecha': datetime.now().isoformat(),
            'total': float(data.get('total', 0)),
            'estado': data.get('estado', 'pendiente'),
            'comentario': data.get('comentario', ''),
            'puntuacion': data.get('puntuacion')
        }
        
        response = supabase.table('pedidos').insert(pedido_data).execute()
        
        if response.data:
            return jsonify(response.data[0]), 201
        else:
            return jsonify({"error": "Error al crear pedido"}), 500
            
    except Exception as e:
        print(f"Error al crear pedido: {e}")
        return jsonify({"error": "Error interno del servidor", "details": str(e)}), 500

# ================== RUTAS DE USUARIOS ==================

@app.route('/api/usuarios', methods=['POST'])
def crear_usuario():
    """Crear un nuevo usuario"""
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No se enviaron datos"}), 400
        
        # Validar campos requeridos
        campos_requeridos = ['usuario', 'contraseña', 'email']
        for campo in campos_requeridos:
            if campo not in data:
                return jsonify({"error": f"Campo requerido faltante: {campo}"}), 400
        
        # Preparar datos del usuario
        usuario_data = {
            'usuario': data['usuario'],
            'contraseña': data['contraseña'],  # En producción, hashear la contraseña
            'email': data['email'],
            'fechacreacion': datetime.now().isoformat()
        }
        
        response = supabase.table('usuarios').insert(usuario_data).execute()
        
        if response.data:
            # No devolver la contraseña
            usuario_creado = response.data[0]
            usuario_creado.pop('contraseña', None)
            return jsonify(usuario_creado), 201
        else:
            return jsonify({"error": "Error al crear usuario"}), 500
            
    except Exception as e:
        print(f"Error al crear usuario: {e}")
        return jsonify({"error": "Error interno del servidor", "details": str(e)}), 500

# ================== RUTAS AUXILIARES ==================

@app.route('/api/test', methods=['GET'])
def test():
    """Ruta de prueba para verificar que la API funciona"""
    try:
        # Probar conexión con Supabase
        response = supabase.table('productos').select("count", count="exact").execute()
        
        return jsonify({
            "message": "API funcionando correctamente",
            "timestamp": datetime.now().isoformat(),
            "database_connection": "OK",
            "productos_count": response.count if response.count else 0
        }), 200
        
    except Exception as e:
        return jsonify({
            "message": "API funcionando pero hay problemas con la base de datos",
            "timestamp": datetime.now().isoformat(),
            "database_connection": "ERROR",
            "error": str(e)
        }), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check para monitoreo"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "PedidosAhora API"
    }), 200

# ================== MANEJO DE ERRORES ==================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint no encontrado"}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({"error": "Método no permitido"}), 405

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Error interno del servidor"}), 500

# ================== INICIALIZACIÓN ==================

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 Iniciando PedidosAhora API")
    print("=" * 50)
    print(f"🔗 Supabase URL: {url}")
    print(f"🔑 Key configurada: ✅")
    print("📡 CORS habilitado para desarrollo")
    print("🐛 Modo debug: ON")
    print("=" * 50)
    
    app.run(debug=True, port=5000, host='0.0.0.0')