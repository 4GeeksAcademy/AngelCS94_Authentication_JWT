"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, User
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_cors import CORS

from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager
from flask_bcrypt import Bcrypt

# Configuración de entorno
ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../public/')

# Inicialización de la app Flask
app = Flask(__name__)
CORS(app)
app.url_map.strict_slashes = False

# Setup de JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT-KEY")  # Cambia esto con una clave segura
jwt = JWTManager(app)

# Instanciar Bcrypt
bcrypt = Bcrypt(app)

# Configuración de la base de datos
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicialización de migraciones y base de datos
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# Configuración de administrador y comandos
setup_admin(app)
setup_commands(app)

# Registrar las rutas del API con el prefijo "/api"
app.register_blueprint(api, url_prefix='/api')

# Manejador de errores personalizados
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# Generar el sitemap con todos los endpoints
@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# Cualquier otra ruta intentará servir un archivo estático
@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # Evitar la caché
    return response

# Ruta de login
@app.route('/login', methods=['POST'])
def login():
    body = request.get_json(silent=True)
    if 'username' not in body:
        return jsonify({'msg':'debes enviar el campo username'}), 400
    if 'email' not in body:
        return jsonify({'msg':'debes enviar el campo email'}), 400
    if 'password' not in body:
        return jsonify({'msg':'debes enviar el campo password'}), 400
    
    user = User.query.filter_by(username=body['username']).first()
    if user is None:
        return jsonify({'msg':'Usuario, email o contraseña incorrecta'}), 400

    password_db = bcrypt.check_password_hash(user.password, body['password'])
    if not password_db or user.email != body['email']:
        return jsonify({'msg':'Usuario, email o contraseña incorrecta'}), 400

    access_token = create_access_token(identity=user.username)
    return jsonify({
        'Msg':'Todos los datos están ok',
        'jwt_token': access_token
    }), 200

# Ruta de registro (signup)
@app.route('/signup', methods=['POST'])
def signup():
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({
            'msg': 'Debes enviar los siguientes campos:',
            'campos': {
                'username': 'requerido',
                'email': 'requerido',
                'password': 'requerido'
            }
        }), 400

    if 'username' not in body:
        return jsonify({'msg':'debes enviar el campo username'}), 400
    if 'email' not in body:
        return jsonify({'msg':'debes enviar el campo email'}), 400
    if 'password' not in body:
        return jsonify({'msg':'debes enviar el campo password'}), 400

    new_user = User()
    new_user.username = body['username']
    new_user.email = body['email']
    new_user.is_active = True

    pw_hash = bcrypt.generate_password_hash(body['password']).decode('utf-8')
    new_user.password = pw_hash

    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=new_user.username)
    return jsonify({
        'Msg': 'Tu usuario ha sido creado!',
        'jwt_token': access_token
    }), 201

# Ruta privada protegida por JWT
@app.route('/private', methods=['GET'])
@jwt_required()
def private_user():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

# Ejecutar el servidor
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
