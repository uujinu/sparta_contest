from app.extension import db, login_manager
from model.models import User, generate_password_hash
from .user_form import *
from flask_login import current_user, login_user


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
        response_object = {
            'status': 'fail',
            'message': '이미 존재하는 회원입니다. 로그인해주세요.',
        }
        return response_object, 409


# 회원 로그인
def sign_in_user(data):
    if current_user.is_authenticated:
        return {
            'status': 'fault',
            'message': '이미 로그인된 사용자입니다.'
        }

    user = User.query.filter_by(email=data['email']).first()
    if user:
        form = LoginForm()
        if form.validate_on_submit():
            # check the password
            if user.check_password(password=form.password.data):  # 로그인 성공
                login_user(user)
                return {
                    'status': 'login success',
                    'message': '로그인에 성공하였습니다.'
                }

        else:  # 로그인 실패
            return {
                'status': 'login failed',
                'message': '로그인에 실패하였습니다.'
            }

    else:
        return {
            'status': 'login failed',
            'message': '등록되지 않은 사용자입니다. 회원가입하세요.'
        }


# 모든 회원 get
def get_all_users():
    return User.query.all()


# 특정 회원 get
@login_manager.user_loader
def get_a_user(id):
    return User.query.filter_by(id=id).first()


# 회원 생성
def save_changes(data):
    db.session.add(data)
    db.session.commit()


# 데이터 삭제
def delete_data(data):
    db.session.delete(data)
    db.session.commit()
