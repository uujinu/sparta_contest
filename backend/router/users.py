from flask import request
from flask_restx import Resource
from service.user_service import *
from service.refrige_service import *
from util.dto import UserDto, user_base


api = UserDto.api
_user = user_base
_user_auth = UserDto.user_auth
_user_profile = UserDto.user_profile
_user_refrige = UserDto.user_refrige
_user_ingre = UserDto.user_ingre
_user_login = UserDto.user_login


# 회원가입
@api.route('/signup')
class Signup(Resource):
    @api.expect(_user_auth, validate=True)
    @api.response(201, '회원가입 완료')
    @api.response(500, '회원가입 실패')
    def post(self):
        '''새로운 회원을 생성합니다.'''
        data = request.json
        return save_new_user(data=data)


# 로그인
@api.route('/login')
class Login(Resource):
    @api.response(200, '로그인에 성공하였습니다.')
    @api.response(401, '로그인에 실패하였습니다.')
    @api.expect(_user_login, validate=True, skip_null=True)
    def post(self):
        '''회원 로그인 로직 입니다.'''
        data = request.json
        return sign_in_user(data=data)


# 로그아웃
@api.route('/logout')
class Logout(Resource):
    @api.response(200, '로그아웃 성공')
    @api.response(401, '로그아웃 실패')
    def get(self):
        '''회원 로그아웃 로직 입니다.'''
        return sign_out_user()


# 회원 리스트
@api.route('/')
class UserManagement(Resource):
    @api.response(401, '인증되지 않은 회원')
    @api.marshal_list_with(_user)
    def get(self):
        '''회원 리스트를 불러옵니다.'''
        return get_all_users()


# 회원 관리
@api.route('/<int:id>')
@api.param('id', '회원 식별자')
@api.response(404, '존재하지 않는 회원')
@api.response(500, '서버 오류')
class User(Resource):
    @api.marshal_with(_user_profile)
    def get(self, id):
        '''회원 정보를 불러옵니다.'''
        return user_get(id)


    def patch(self, id):
        '''회원 정보를 수정합니다.'''
        user = user_get(id)
        return update_user(user)


    def delete(self, id):
        '''회원 정보를 삭제합니다.'''
        user = user_get(id)
        delete_data(user)

        return {
            'status': 'success',
            'message': '탈퇴되었습니다.'
        }, 204


# 이메일, 닉네임 중복 검사
@api.route('/auth/check')
@api.response(409, '중복 오류')
@api.response(500, '서버 오류')
class UserManagy(Resource):
    def post(self):
        '''이메일, 닉네임 중복검사 로직입니다.'''
        data = request.json
        return duplicate_check(data)


# 회원 냉장고 관리
@api.route('/<int:id>/refrige')
@api.param('id', '회원 식별자')
@api.response(401, '인증되지 않은 회원')
@api.response(404, '존재하지 않는 회원')
class UserRefrige(Resource):
    @api.marshal_with(_user_refrige)
    def get(self, id):
        '''회원 냉장고 정보를 불러옵니다.'''
        return all_refrige_ingre(id)

    @api.expect(_user_ingre, skip_null=True)
    @api.response(201, '냉장고에 재료가 추가되었습니다.')
    def post(self, id):
        '''회원 냉장고에 재료를 추가합니다.'''
        if user_get(id):
            return save_new_ingre(id)


@api.route('/<int:id>/refrige/<int:ingre_idx>')
@api.param('id', '회원 식별자')
@api.param('ingre_idx', '재료 식별자')
@api.response(401, '인증되지 않은 회원')
@api.response(404, '존재하지 않는 회원')
class UserRefrige(Resource):
    @api.expect(_user_ingre, skip_null=True)
    @api.response(200, '재료가 수정되었습니다.')
    def put(self, id, ingre_idx):
        '''회원 냉장고의 재료를 수정합니다.'''
        refrige = user_get(id).refrige
        return managy_ingre(refrige.id, ingre_idx)

    @api.response(204, '재료가 삭제되었습니다.')
    def delete(self, id, ingre_idx):
        '''회원 냉장고의 재료를 삭제합니다.'''
        refrige = user_get(id).refrige
        return managy_ingre(refrige.id, ingre_idx)
