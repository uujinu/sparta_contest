from app.extension import db
from model.models import User, generate_password_hash
from .user_form import RegisterForm


# 회원 생성
def save_new_user(data):
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        form = RegisterForm()
        print(form.validate_on_submit())
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


# 모든 회원 get
def get_all_users():
    return User.query.all()


# 특정 회원 get
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
