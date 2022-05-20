from flask import request
from flask_restx import Resource
from service.user_service import *
from util.dto import UserDto, user_base


api = UserDto.api
_user = user_base
_user_auth = UserDto.user_auth
_user_profile = UserDto.user_profile


def is_user(id):
    user = get_a_user(id)
    if not user:
        api.abort(404)
    return user


@api.route('/signup')
class Signup(Resource):
    @api.expect(_user_auth, validate=True)
    @api.response(201, '회원가입 완료')
    @api.response(500, '회원가입 실패')
    def post(self):
        '''새로운 회원을 생성합니다.'''
        data = request.json
        return save_new_user(data=data)


@api.route('/login')
class Login(Resource):
    @api.response(200, '로그인에 성공하였습니다.')
    @api.response(401, '로그인에 실패하였습니다.')
    @api.expect(_user_auth, validate=True, skip_null=True)
    def post(self):
        '''회원 로그인 로직 입니다.'''
        data = request.json
        return sign_in_user(data=data)


@api.route('/')
class UserManagement(Resource):
    @api.response(401, '권한이 없습니다.')
    @api.marshal_list_with(_user)
    def get(self):
        '''회원 리스트를 불러옵니다.'''
        return get_all_users()


@api.route('/<int:id>')
@api.param('id', '회원 식별자')
class User(Resource):
    @api.marshal_with(_user_profile)
    @api.response(404, '존재하지 않는 회원')
    def get(self, id):
        '''회원 정보를 불러옵니다.'''
        return is_user(id)

    def delete(self, id):
        '''회원 정보를 삭제합니다.'''
        user = is_user(id)
        delete_data(user)

        return {
            'status': 'success',
            'msg': '탈퇴되었습니다.'
        }
