from flask_restx import Resource
from util.dto import RecipeDto, recipe_base
from service.recipe_service import get_a_recipe, get_all_recipes, save_new_recipe, edit_recipe, search_recipe


api = RecipeDto.api
_recipe = RecipeDto.recipe
_recipe_card = recipe_base


@api.route('')
class RecipeList(Resource):
    @api.doc('쩝쩝박사에 등록된 레시피 리스트')
    @api.marshal_list_with(_recipe_card)
    def get(self):
        '''등록된 레시피 리스트입니다.'''
        return get_all_recipes()

    @api.doc('새로운 레시피 작성')
    @api.response(201, '레시피 등록이 완료되었습니다.')
    @api.response(401, '인증되지 않은 회원')
    @api.response(500, '서버 오류')
    def post(self):
        '''새로운 레시피를 작성합니다.'''
        return save_new_recipe()


@api.route('/<int:id>')
@api.param('id', '레시피 식별자')
@api.response(404, 'Recipe not found')
class Recipe(Resource):
    @api.marshal_with(_recipe)
    @api.response(200, 'Success', _recipe)
    def get(self, id):
        '''레시피 상세 정보입니다.'''
        recipe = get_a_recipe(id=id)
        return recipe

    def put(self, id):
        '''레시피를 수정합니다.'''
        return edit_recipe(id=id)


@api.route('/search')
class RecipeSearch(Resource):
    def get(self):
        '''레시피 및 재료를 검색합니다.'''
        return search_recipe()
