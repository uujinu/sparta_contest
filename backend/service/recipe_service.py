from app.extension import db
from model.models import Ingredient, Recipe, RecipeImage, RecipeInfo, RecipeIngredient, RecipeStep
from flask import request
from flask_restx import abort
from flask_login import login_required, current_user
from util.file.file_upload import s3_upload_obj
from util.file.file_convert import convert_image


# 레시피 필수 요소 입력 검사
def check_element(t, d, f, i, s):
    info_ch = f['portion_info'] and f['time_info'] and f['degree_info']
    ingre_ch = True
    for x in i:
        if not (x['name'] and x['quantity']):
            ingre_ch = False
            break
    step_ch = True
    for x in s:
        if not x['step_desc']:
            step_ch = False
            break
    return t and d and info_ch and ingre_ch and step_ch


# 레시피 생성
@login_required
def save_new_recipe():
    title = request.form.get('title')
    description = request.form.get('description')
    info = eval(request.form.get('info'))
    ingredients = eval(request.form.get('ingredients'))
    steps = eval(request.form.get('steps'))

    # 필수 항목 검사
    if (check_element(title, description, info, ingredients, steps)):
        new_recipe = Recipe(
            title=title,
            description=description,
            user=current_user,
            user_id=current_user.id
        )
        save_changes(new_recipe)
        recipe = Recipe.query.filter_by(title=title).first()

        if recipe is None:
            return abort(500, '레시피 저장에 실패하였습니다.')
        prefix = f'recipe/{recipe.id}/'

        # info
        new_info = RecipeInfo(
            recipe_id=recipe.id,
            portion_info=info['portion_info'],
            time_info=info['time_info'],
            degree_info=info['degree_info']
        )
        save_changes(new_info)

        # ingredients
        for i in ingredients:
            # 등록이 안된 재료라면 먼저 등록하기
            ingre_id = i['id']
            if ingre_id == '':
                new_ingredient = Ingredient(name=i['name'])
                save_changes(new_ingredient)
                ingre_id = Ingredient.query.filter_by(
                    name=i['name']).first().id

            new_ingre = RecipeIngredient(
                name=i['name'],
                quantity=i['quantity'],
                recipe_id=recipe.id,
                ingre_id=ingre_id
            )
            save_changes(new_ingre)

        # steps
        for n, i in enumerate(steps):
            img_url = None
            if i['step_image'] == 'img':
                filename = f'img_{n}'
                img = request.files.get(filename)
                if img:
                    img_url = s3_upload_obj(img, prefix)
            new_step = RecipeStep(
                recipe_id=recipe.id,
                step_num=n+1,
                step_desc=i['step_desc'],
                step_image=img_url
            )
            save_changes(new_step)

        # thumbnail
        thumbnail = request.files.get('thumbnail')
        if thumbnail:
            converted_img = convert_image(thumbnail, 750, 400)
            new_url = s3_upload_obj(converted_img, prefix)
            recipe.thumbnail = new_url

        # images
        imgs = request.files.getlist('images')
        if len(imgs):
            for i in imgs:
                new_url = s3_upload_obj(i, prefix)
                new_img = RecipeImage(
                    recipe_id=recipe.id,
                    img_path=new_url
                )
                save_changes(new_img)

        return {
            'status': 'success',
            'message': '레시피가 저장되었습니다.'
        }, 201

    else:
        return {
            'status': 'failed',
            'message': '레시피 저장에 실패했습니다.'
        }, 400


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
