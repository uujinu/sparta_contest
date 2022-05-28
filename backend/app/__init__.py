from flask import Flask, Blueprint
from config.flask_config import Config
from model.models import *
from flask_restx import Api
from flask_wtf.csrf import CSRFProtect
from router.recipes import api as Recipe_ns
from router.users import api as User_ns
from util.errors.error_handling import app_error_handler, api_error_handler
from flask_cors import CORS, cross_origin
from flask_session import Session
from datetime import timedelta


blueprint = Blueprint('api', __name__)


def create_app():
    # 앱 설정
    app = Flask(__name__)
    app.config.from_object((get_flask_env()))
    app.config['CORS_HEADERS'] = 'Content-Type'
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=360)
    app.config['SESSION_TYPE'] = 'filesystem'

    # whether to send to the browser session cookie value to encrypt
    app.config['SESSION_USE_SIGNER'] = True

    # app.config['SESSION_REDIS'] = redis.Redis(host='3.34.181.171')
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
    app.config["SESSION_COOKIE_SECURE"] = True
    Session(app)

    CORS(app, resources={
         r'/api/*': {'origins': ['http://127.0.0.1:8080', 'http://3.34.181.171:8080']}}, supports_credentials=True)
    csrf = CSRFProtect()
    csrf.init_app(app)

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    api = Api(blueprint,
              title='쩝쩝박사 Project API',
              version='1.0',
              description='JJBS project flask server',
              decorators=[cross_origin()])

    # 에러 핸들러 등록
    app_error_handler(app)
    api_error_handler(User_ns)
    api_error_handler(Recipe_ns)

    api.add_namespace(User_ns, path='/users')
    api.add_namespace(Recipe_ns, path='/recipes')

    # cors 오류 해결
    @app.after_request
    def after_request_cors(resp):
        resp.access_control_allow_credentials = True
        origin = 'http://127.0.0.1:8080' if Config.ENV == 'dev' else 'http://3.34.181.171:8080'
        resp.access_control_allow_origin = origin
        resp.access_control_allow_methods = [
            'GET', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'POST', 'HEAD']
        return resp

    return app


def get_flask_env():
    # dev/prod 환경
    if Config.ENV == 'prod':
        return 'config.flask_config.prodConfig'
    elif Config.ENV == 'dev':
        return 'config.flask_config.devConfig'
