from app.extension import db
from model.models import Ingredient, Recipe, RecipeImage, RecipeInfo, RecipeIngredient, RecipeStep
from flask import request
from flask_restx import abort
from flask_login import login_required, current_user
from util.file.file_upload import s3_upload_obj, s3_delete_image
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
            db.session.commit()

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


# 레시피 수정
@login_required
def edit_recipe(id):
    recipe = Recipe.query.filter_by(id=id).first()
    if not recipe:
        abort(404, '존재하지 않는 레시피입니다.')
    prefix = f'recipe/{recipe.id}/'

    title = request.form.get('title')
    description = request.form.get('description')
    info = eval(request.form.get('info'))
    ingredients = eval(request.form.get('ingredients'))
    steps = eval(request.form.get('steps'))
    images = eval(request.form.get('imgs'))

    if (check_element(title, description, info, ingredients, steps)):
        # title
        if title != recipe.title:
            recipe.title = title
            db.session.commit()

        # description
        if description != recipe.description:
            recipe.description = description
            db.session.commit()

        # info
        recipe_info = recipe.info
        for key, value in info.items():
            setattr(recipe_info, key, value)
            db.session.commit()

        # ingredients
        recipe_ingre = recipe.ingredients
        for n, i in enumerate(ingredients):
            ingre_id = i['ingre_id']
            if ingre_id == '':
                new_ingredient = Ingredient(name=i['name'])
                save_changes(new_ingredient)
                ingre_id = Ingredient.query.filter_by(
                    name=i['name']).first().id
                i['ingre_id'] = ingre_id

            if len(recipe_ingre) > n:
                for key, value in i.items():
                    setattr(recipe_ingre[n], key, value)
                    db.session.commit()
            else:
                new_ingre = RecipeIngredient(
                    name=i['name'],
                    quantity=i['quantity'],
                    recipe_id=recipe.id,
                    ingre_id=ingre_id
                )
                save_changes(new_ingre)

        if len(ingredients) < len(recipe_ingre):
            for i in recipe_ingre[len(ingredients):]:
                delete_data(i)

        # steps
        recipe_steps = recipe.steps
        for n, i in enumerate(steps):
            img_url = ''
            if i['step_image'] == 'img':
                filename = f'img_{n}'
                img = request.files.get(filename)
                if img:
                    img_url = s3_upload_obj(img, prefix)

            if len(recipe_steps) > n:
                i['step_image'] = img_url
                i['step_num'] = n + 1
                for key, value in i.items():
                    setattr(recipe_steps[n], key, value)
                    db.session.commit()
            else:  # 새로운 스텝 추가
                new_step = RecipeStep(
                    recipe_id=recipe.id,
                    step_num=n+1,
                    step_desc=i['step_desc'],
                    step_image=img_url
                )
                save_changes(new_step)

        if len(steps) < len(recipe_steps):
            for i in recipe_steps[len(steps):]:
                delete_data(i)

        # thumbnail
        thumbnail = request.form.get('thumbnail')
        if not thumbnail and recipe.thumbnail:  # 썸네일 삭제
            recipe.thumbnail = ''
            s3_delete_image(recipe.thumbnail.split('amazonaws.com/')[1])
            db.session.commit()

        thumbnail = request.files.get('thumbnail')  # 새로운 썸네일
        if thumbnail:
            converted_img = convert_image(thumbnail, 750, 400)
            new_url = s3_upload_obj(converted_img, prefix)
            recipe.thumbnail = new_url
            db.session.commit()

        # images
        for i in recipe.images:
            if i.img_path not in images:  # 이미지 삭제
                s3_delete_image(i.img_path.split('amazonaws.com/')[1])
                delete_data(i)

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
            'message': '레시피가 수정되었습니다.'
        }, 200

    else:
        return {
            'status': 'failed',
            'message': '레시피 저장에 실패했습니다.'
        }, 400


# 모든 레시피 get
def get_all_recipes():
    qs = str(request.query_string, 'utf-8')
    if qs != '':
        user_id = qs.split('=')[1]
        return Recipe.query.filter_by(user_id=user_id).all()
    return Recipe.query.all()


# 특정 레시피 get
def get_a_recipe(id):
    qs = str(request.query_string, 'utf-8')
    recipe = Recipe.query.filter_by(id=id).first()
    if not recipe:
        return abort(404, '존재하지 않는 레시피입니다.')

    if qs != '':
        if not current_user or recipe.user_id != current_user.id:
            return abort(403, '권한이 없습니다.')
    return recipe


# 레시피 생성
def save_changes(data):
    db.session.add(data)
    db.session.commit()


# 데이터 삭제
@login_required
def delete_data(data):
    db.session.delete(data)
    db.session.commit()
