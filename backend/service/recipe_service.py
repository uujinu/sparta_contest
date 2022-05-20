from app.extension import db
from model.models import Recipe


# 모든 레시피 get
def get_all_recipes():
    return Recipe.query.all()


# 특정 레시피 get
def get_a_recipe(id):
    return Recipe.query.filter_by(id=id).first()


# 레시피 생성
def save_changes(data):
    db.session.add(data)
    db.session.commit()
