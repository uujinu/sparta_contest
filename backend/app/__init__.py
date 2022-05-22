from flask import Flask, Blueprint
from config.flask_config import Config
from model.models import *
from flask_restx import Api
from flask_wtf.csrf import CSRFProtect
from router.recipes import api as Recipe_ns
from router.users import api as User_ns
from util.errors.error_handling import app_error_handler, api_error_handler


blueprint = Blueprint('api', __name__)


def create_app():
    # 앱 설정
    app = Flask(__name__)
    app.config.from_object((get_flask_env()))

    csrf = CSRFProtect()
    csrf.init_app(app)

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    api = Api(blueprint,
              title='쩝쩝박사 Project API',
              version='1.0',
              description='JJBS project flask server')

    # 에러 핸들러 등록
    app_error_handler(app)
    api_error_handler(User_ns)
    api_error_handler(Recipe_ns)

    api.add_namespace(User_ns, path='/users')
    api.add_namespace(Recipe_ns, path='/recipes')
    return app


def get_flask_env():
    # dev/prod 환경
    if Config.ENV == 'prod':
        return 'config.flask_config.prodConfig'
    elif Config.ENV == 'dev':
        return 'config.flask_config.devConfig'
