from flask import Flask
from config.flask_config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()


def create_app():
    # 앱 설정
    app = Flask(__name__)
    app.config.from_object((get_flask_env()))

    db.init_app(app)
    migrate.init_app(app, db)
    from model import models

    return app


def get_flask_env():
    # dev/prod 환경
    if Config.ENV == 'prod':
        return 'config.flask_config.prodConfig'
    elif Config.ENV == 'dev':
        return 'config.flask_config.devConfig'
