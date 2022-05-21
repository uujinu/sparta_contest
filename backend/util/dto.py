from flask_restx import Namespace, fields
from .dto_base import *


class UserDto:
    api = Namespace('Users', description='회원 관리 operation을 담당하는 API입니다.')
    api.models[user_base.name] = user_base
    api.models[recipe_base.name] = recipe_base

    user_login = api.model('user_login', {
        'email': fields.String(required=True, description='회원 이메일'),
        'password': fields.String(required=True, description='회원 비밀번호', attribute='password_hashed'),
    })
    user_auth = api.clone('user_auth', {
        'nickname': fields.String(required=True, description='회원 닉네임'),
        'password2': fields.String(required=True, description='회원 비밀번호2'),
    })
    user_ingre = api.model('user_ingre', {
        'id': fields.Integer(required=False, description='회원 냉장고 재료 식별자'),
        'ingre_id': fields.Integer(required=False, description='재료 식별자(재료 테이블 참조용)'),
        'name': fields.String(required=True, description='회원 냉장고 재료명'),
        'memo': fields.String(required=False, description='회원 냉장고 재료 메모'),
        'created_at': fields.DateTime(required=False, description='회원 냉장고 재료 등록 날짜')
    })
    user_refrige = api.model('user_refrige', {
        'id': fields.Integer(requied=True, description='회원 냉장고 식별자'),
        'ingredients': fields.List(fields.Nested(user_ingre), description='회원 냉장고 재료 리스트')
    })
    user_profile = api.clone('user_profile', user_base, {
        'refrige': fields.List(fields.Nested(user_refrige), required=False, description='회원 냉장고'),
        'posts': fields.List(fields.Nested(recipe_base), required=False, description='회원 작성글 리스트'),
        'likes': fields.List(fields.Nested(recipe_base), required=False, description='회원 좋아요 리스트')
    })


class RecipeDto:
    api = Namespace('Recipes',  description='레시피 관리 operation을 담당하는 API입니다.')
    api.models[recipe_base.name] = recipe_base

    info = api.model('recipe_info', {
        'portion_info': fields.String(required=True, description='레시피 몇 인분'),
        'time_info': fields.String(required=True, description='레시피 조리 시간'),
        'degree_info': fields.String(required=True, description='레시피 난이도')
    })
    ingredients = api.model('recipe_ingre', {
        'name': fields.String(required=True, description='레시피 재료명'),
        'quantity': fields.String(required=True, description='레시피 재료 용량')
    })
    steps = api.model('recipe_steps', {
        'step_num': fields.Integer(required=True, description='레시피 순서 번호'),
        'step_desc': fields.String(required=True, description='레시피 순서 설명'),
        'step_image': fields.String(required=False, description='레시피 순서 이미지')
    })
    images = api.model('recipe_images', {
        'img_path': ImageGet(required=False, description='레시피 완성 이미지')
    })
    recipe = api.clone('recipe', recipe_base, {
        'description': fields.String(required=False, description='레시피 소개'),
        'info': fields.Nested(info, required=True, description='레시피 정보'),
        'ingredients': fields.List(fields.Nested(ingredients), required=True, description='레시피 재료'),
        'steps': fields.List(fields.Nested(steps), required=True, description='레시피 순서'),
        'images': ImageGet(attribute='images', required=False, description='레시피 이미지 리스트')
    })
