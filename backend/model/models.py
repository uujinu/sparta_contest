from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extension import *


# Recipe-User 좋아요
recipe_user = db.Table('recipe_user_like',
                       db.Column('recipe_id', db.Integer, db.ForeignKey(
                           'recipe.id', ondelete='CASCADE'), primary_key=True),
                       db.Column('user_id', db.Integer, db.ForeignKey(
                           'user.id', ondelete='CASCADE'), primary_key=True),
                       db.Column('created_at', db.DateTime,
                                 default=datetime.utcnow)
                       )


class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    nickname = db.Column(db.String(100), unique=True, nullable=False)
    password_hashed = db.Column(db.String(100), unique=False, nullable=False)
    profile_image = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    refrige = db.relationship('Refrige', backref='user', uselist=False)
    likes = db.relationship(
        'Recipe', secondary=recipe_user, backref='like_users')
    posts = db.relationship('Recipe', backref='user', lazy=True)

    @property
    def password(self):
        raise AttributeError('password is not a readable attribute!')

    @password.setter
    def password(self, password):
        '''Create hashed password'''
        self.password_hashed = generate_password_hash(
            password,
            method='sha256'
        )

    def get_id(self):
        return str(self.id)

    def check_password(self, password):
        '''Check hashed password'''
        return check_password_hash(self.password_hashed, password)

    def is_authenticated(self):
        '''Return True if the user is authenticated'''
        return True

    def is_active(self):
        '''All users are active'''
        return True

    def is_anonymous(self):
        '''False, as anonymous users aren't supported'''
        return False

    def __repr__(self):
        return f'User({self.id}| {self.nickname} | {self.email})'


class Refrige(db.Model):
    __tablename__ = 'refrige'

    id = db.Column(db.Integer, primary_key=True)
    ingredients = db.relationship(
        'Refrige_ingre', backref='user_refrige', lazy=True)
    user_id = db.Column(db.Integer, db.ForeignKey(
        'user.id', ondelete='CASCADE'))


class Refrige_ingre(db.Model):
    __tablename__ = 'refrige_ingre'

    id = db.Column(db.Integer, primary_key=True)
    refrige_id = db.Column(db.Integer, db.ForeignKey(
        'refrige.id', ondelete='CASCADE'))
    ingre_id = db.Column(db.Integer, unique=False, nullable=True)
    name = db.Column(db.String(100), unique=False, nullable=False)
    memo = db.Column(db.String(200), unique=False, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Recipe(db.Model):
    __tablename__ = 'recipe'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), unique=False, nullable=False)
    description = db.Column(db.Text(), unique=False, nullable=True)
    thumbnail = db.Column(db.String(200), unique=False, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey(
        'user.id', ondelete='CASCADE'))
    ingredients = db.relationship(
        'RecipeIngredient', backref='recipe', lazy=True)
    info = db.relationship('RecipeInfo', backref='recipe', uselist=False)
    steps = db.relationship('RecipeStep', backref='recipe', lazy=True)
    images = db.relationship('RecipeImage', backref='recipe', lazy=True)

    def __repr__(self):
        return f"<Recipe('{self.id}', '{self.title}')>"


class RecipeInfo(db.Model):
    __tablename__ = 'recipeInfo'

    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey(
        'recipe.id', ondelete='CASCADE'))
    portion_info = db.Column(db.String(50), nullable=False)
    time_info = db.Column(db.String(50), nullable=False)
    degree_info = db.Column(db.String(50), nullable=False)


class Ingredient(db.Model):
    __tablename__ = 'ingredient'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)


class RecipeIngredient(db.Model):
    __tablename__ = 'recipe_ingre'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.String(50), nullable=False)

    recipe_id = db.Column(db.Integer, db.ForeignKey(
        'recipe.id', ondelete='CASCADE'), nullable=False)
    ingre_id = db.Column(db.Integer, nullable=True)


class RecipeStep(db.Model):
    __tablename__ = 'recipeStep'

    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey(
        'recipe.id', ondelete='CASCADE'))
    step_num = db.Column(db.Integer, unique=False, nullable=False)
    step_desc = db.Column(db.Text(), unique=False, nullable=False)
    step_image = db.Column(db.String(200), unique=False, nullable=True)


class RecipeImage(db.Model):
    __tablename__ = 'recipeImage'

    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey(
        'recipe.id', ondelete='CASCADE'))
    img_path = db.Column(db.String(200), unique=False, nullable=True)
