from flask_restx import Resource
from util.dto import RecipeDto, recipe_base
from service.recipe_service import get_a_recipe, get_all_recipes


api = RecipeDto.api
_recipe = RecipeDto.recipe
_recipe_card = recipe_base


@api.route('/')
class RecipeList(Resource):
    @api.doc('쩝쩝박사에 등록된 레시피 리스트')
    @api.marshal_list_with(_recipe_card)
    def get(self):
        '''등록된 레시피 리스트입니다.'''
        recipe_list = get_all_recipes()

        return {
            'status': 'success',
            'result': recipe_list
        }


@api.route('/<int:id>')
@api.param('id', '레시피 식별자')
@api.response(404, 'Recipe not found')
class Recipe(Resource):
    @api.marshal_with(_recipe)
    def get(self, id):
        '''레시피 상세 정보입니다.'''
        recipe = get_a_recipe(id=id)

        return {
            'status': 'success',
            'result': recipe
        }
