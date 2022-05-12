import os
from dotenv import load_dotenv

load_dotenv(verbose=True)


class Config(object):
    ENV = os.getenv('ENV')
    CSRF_ENABLED = True
    SECRET_KEY = os.getenv('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class devConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'mysql://{user}:{pw}@{url}:{port}/{db}'.format(
        user=os.getenv('DB_USERNAME'),
        pw=os.getenv('DB_PASSWORD'),
        url=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        db=os.getenv('DB_DATABASE'))


class prodConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = 'mysql://{user}:{pw}@{url}:{port}/{db}'.format(
        user=os.getenv('DB_USERNAME'),
        pw=os.getenv('DB_PASSWORD'),
        url=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        db=os.getenv('DB_DATABASE'))
