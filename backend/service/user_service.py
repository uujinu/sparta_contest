from app.extension import db, login_manager
from model.models import User, generate_password_hash
from .user_form import *
from flask_restx import abort
from flask_login import current_user, login_user, logout_user, login_required
from flask import request


# 회원 생성
def save_new_user(data):
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        form = RegisterForm()
        if form.validate_on_submit():
            # hash the password
            hashed_pw = generate_password_hash(form.password.data, 'sha256')

            new_user = User(
                email=form.email.data,
                nickname=form.nickname.data,
                password_hashed=hashed_pw
            )
            save_changes(new_user)

            response_object = {
                'status': 'success',
                'message': '회원가입이 완료되었습니다.'
            }
            return response_object, 201
    else:
        abort(409, '이미 존재하는 회원입니다. 로그인해주세요.')


# 회원 로그인
def sign_in_user(data):
    if current_user.is_authenticated:
        abort(400, '이미 로그인된 사용자입니다.')

    user = User.query.filter_by(email=data['email']).first()
    if user:
        form = LoginForm()
        if form.validate_on_submit():
            # check the password
            if user.check_password(password=form.password.data):  # 로그인 성공
                login_user(user)
                response_object = {
                    'status': 'login success',
                    'message': '로그인에 성공하였습니다.'
                }
                return response_object, 200
            else:  # 로그인 실패
                abort(401, '로그인에 실패하였습니다.')
    else:
        abort(401, '등록되지 않은 사용자입니다. 회원가입하세요.')


# 회원 로그아웃
@login_required
def sign_out_user():
    logout_user()
    response_object = {
        'status': 'logout success',
        'message': '로그아웃 되었습니다.'
    }
    return response_object, 200


# 모든 회원 get
@login_required
def get_all_users():
    return User.query.all()


# 특정 회원 get(user_loader)
@login_required
@login_manager.user_loader
def get_a_user(id):
    return User.query.filter_by(id=id).first()


# 특정 회원 get
@login_required
def user_get(id):
    user = User.query.filter_by(id=id).first()
    if user:
        return user
    return abort(404, '존재하지 않는 회원입니다.')


# 이메일/닉네임 중복 검사
def duplicate_check(data):
    _t = '이메일'
    _res = {
        'status': 'success',
        'message': f'사용 가능한 {_t}입니다.'
    }
    try:  # 이메일 중복검사
        email = request.json['email']
        if User.query.filter_by(email=email).first():
            return abort(409, f'중복된 {_t}입니다.')
        else:
            return _res, 200
    except KeyError:  # 닉네임 중복검사
        _t = '닉네임'
        nickname = request.json['nickname']
        if User.query.filter_by(nickname=nickname).first():
            return abort(409, f'중복된 {_t}입니다.')
        else:
            return _res, 200


# 회원 생성
def save_changes(data):
    db.session.add(data)
    db.session.commit()


# 데이터 삭제
@login_required
def delete_data(data):
    db.session.delete(data)
    db.session.commit()
