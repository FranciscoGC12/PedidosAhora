# base.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client, Client
import os
from dotenv import load_dotenv

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


# Crear cliente
try:
    supabase: Client = create_client(url, key)
    print("Cliente creado exitosamente")
except Exception as e:
    print(f"Error al crear cliente: {e}")

print(f"Conectando a Supabase: {url}")
supabase: Client = create_client(url, key)

@app.route('/api/productos', methods=['GET'])
def get_productos():
    try:
        response = supabase.table('productos').select("*").execute()
        return jsonify(response.data)
    except Exception as e:
        print(f"Error al obtener productos: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/productos', methods=['POST'])
def crear_producto():
    try:
        data = request.json
        response = supabase.table('productos').insert(data).execute()
        return jsonify(response.data), 201
    except Exception as e:
        print(f"Error al crear producto: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/productos/<int:idproducto>', methods=['PUT'])
def actualizar_producto(id):
    try:
        data = request.json
        response = supabase.table('productos').update(data).eq('idproducto', id).execute()
        return jsonify(response.data)
    except Exception as e:
        print(f"Error al actualizar producto: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/productos/<int:idproducto>', methods=['DELETE'])
def eliminar_producto(id):
    try:
        response = supabase.table('productos').delete().eq('idproducto', id).execute()
        return jsonify({"message": "Producto eliminado"})
    except Exception as e:
        print(f"Error al eliminar producto: {e}")
        return jsonify({"error": str(e)}), 500

# Ruta de prueba
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "API funcionando correctamente"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)