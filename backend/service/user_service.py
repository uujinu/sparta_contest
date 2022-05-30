import string
import random
from app.extension import db, login_manager
from model.models import User, generate_password_hash
from .user_form import *
from flask_restx import abort
from flask_login import current_user, login_user, logout_user, login_required
from flask import request, session
from util.file.file_upload import s3_upload_obj, s3_delete_image
from util.file.file_convert import convert_image
from .user_email import send_auth_email


# 회원 생성
def save_new_user(data):
    user = User.query.filter_by(email=data['email']).first()
    nickname = User.query.filter_by(nickname=data['nickname']).first()
    if not user and not nickname:
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
            abort(400, '올바르지 않은 입력 형식입니다. 다시 시도해주세요.')
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
                session.permanent = True
                return user, 200
            else:  # 로그인 실패
                abort(401, '로그인에 실패하였습니다.')
        else:
            abort(400, '입력 양식이 잘못되었습니다.')
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
    _res = {
        'status': 'success',
    }
    try:  # 이메일 중복검사
        email = data['email']
        if User.query.filter_by(email=email).first():
            return abort(409, '중복된 이메일입니다.')
        else:
            _res['message'] = '사용 가능한 이메일입니다.'
            return _res, 200
    except KeyError:  # 닉네임 중복검사
        nickname = data['nickname']
        if User.query.filter_by(nickname=nickname).first():
            return abort(409, '중복된 닉네임입니다.')
        else:
            _res['message'] = '사용 가능한 닉네임입니다.'
            return _res, 200


# 프로필 사진 변경
@login_required
def update_image(new_pf):
    img = ''
    if new_pf == 'null':
        img = new_pf
    else:
        img = request.files['profile_image']
    id = current_user.get_id()
    user = get_a_user(id)
    _url = user.profile_image  # 이전 프로필 이미지 url
    prefix = f'profile/{id}/'

    try:
        if img != 'null':
            # 파일 컨버팅
            converted_img = convert_image(img, 150, 150)
            new_url = s3_upload_obj(converted_img, prefix)  # s3 이미지 업로드
            # db 업데이트
            user.profile_image = new_url
        else:
            user.profile_image = None

        if _url != None:  # 이전 프로필 이미지 삭제
            s3_delete_image(_url.split('amazonaws.com/')[1])
        return new_url
    except Exception as e:
        print(e)
        return False


# 회원 정보 수정(비밀번호 제외)
@login_required
def update_user(user):
    new_nick = request.form.get('nickname')
    new_pf = request.form.get('profile_image')
    new_url = ''

    if len(request.files) or new_pf:
        new_url = update_image(new_pf)
        if not new_url:
            return {
                'status': 'failed',
                'message': '회원 정보 수정 중 오류가 발생했습니다.'
            }, 500

    if new_nick:  # 닉네임 변경
        user.nickname = request.form['nickname']

    try:
        db.session.commit()
    except Exception as e:
        print(e)
        return abort(500, '오류가 발생했습니다.')

    response_object = {
        'status': 'success',
        'message': '회원 정보 수정이 완료되었습니다.'
    }

    if len(request.files) or new_pf == 'null':  # 이미지 변경시 변경된 url 함께 리턴
        response_object['profile_url'] = '' if new_pf == 'null' else new_url
    return response_object, 200


# 회원 비밀번호 초기화
def managy_pw(email):
    user = User.query.filter_by(email=email).first()
    if not user:
        return abort(404, '존재하지 않는 회원입니다.')

    # 랜덤 비밀번호 생성
    new_pw_len = 9
    pw_candidate = [string.ascii_letters, string.digits, string.punctuation]
    new_pw = ""
    for i in range(new_pw_len):
        idx = int(i / len(pw_candidate))
        new_pw += random.choice(pw_candidate[idx])

    # 새 비밀번호로 변경
    hashed_pw = generate_password_hash(new_pw, 'sha256')
    user.password_hashed = hashed_pw
    db.session.commit()

    # 비밀번호 초기화 이메일 전송
    return send_auth_email(user.email, new_pw)


# 회원 비밀번호 변경
@login_required
def managy_edit_pw(data):
    email = data['email']
    user = User.query.filter_by(email=email).first()
    if not user:
        abort(404, '존재하지 않는 회원입니다.')
    if user != current_user:
        abort(403, '권한이 없습니다.')

    # 비밀번호 확인
    form = PasswordManageForm()
    if form.validate_on_submit():
        # hash the password
        hashed_pw = generate_password_hash(form.password.data, 'sha256')
        user.password_hashed = hashed_pw
        db.session.commit()

        # 세션 삭제
        logout_user()
        response_object = {
            'status': 'success',
            'message': '비밀번호가 변경되었습니다. 다시 로그인해주세요.'
        }
        return response_object, 200
    else:
        abort(400)


# 회원 생성
def save_changes(data):
    db.session.add(data)
    db.session.commit()


# 데이터 삭제
@login_required
def delete_data(data):
    db.session.delete(data)
    db.session.commit()
