from flask import Flask
from config.flask_config import Config
from model.models import *


def create_app():
    # 앱 설정
    app = Flask(__name__)
    app.config.from_object((get_flask_env()))

    db.init_app(app)
    migrate.init_app(app, db)

    return app


def get_flask_env():
    # dev/prod 환경
    if Config.ENV == 'prod':
        return 'config.flask_config.prodConfig'
    elif Config.ENV == 'dev':
        return 'config.flask_config.devConfig'
