from flask import request
from functools import wraps
from flask_restx import abort
from flask_login import login_required
from app.extension import db
from model.models import Refrige, Refrige_ingre
from .user_service import get_a_user, save_changes, delete_data


# 냉장고가 없는 경우 생성해주는 데코레이터
def user_refrige_exists(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        id = (args or args[0]) or kwargs.get('id', None)
        user = get_a_user(id)
        if not user.refrige:  # 냉장고 생성
            new_refrige = Refrige(
                user_id=user.id
            )
            save_changes(new_refrige)
        return f(*args, **kwargs)
    return wrapper


# 냉장고 보관된 모든 재료 get
@login_required
@user_refrige_exists
def all_refrige_ingre(user_id):
    return Refrige.query.filter_by(user_id=user_id).first()


# 냉장고 재료 추가
@login_required
@user_refrige_exists
def save_new_ingre(id):
    refrige = Refrige.query.filter_by(user_id=id).first()
    data = request.json

    new_ingre = Refrige_ingre(
        refrige_id=refrige.id,
        ingre_id=data['ingre_id'] if data['ingre_id'] else None,
        name=data['name'],
        memo=data['memo']
    )
    save_changes(new_ingre)
    return new_ingre, 201


# 냉장고 재료 수정/삭제
@login_required
def managy_ingre(refrige_id, ingre_idx):  # 재료의 id(ingre_id X)
    ingre = Refrige_ingre.query.filter_by(
        refrige_id=refrige_id, id=ingre_idx).first()
    if not ingre:
        abort(404)

    _f = '수정'
    if request.method == 'DELETE':
        delete_data(ingre)
        _f = '삭제'
    else:
        data = request.json
        ingre.ingre_id = data['ingre_id']
        ingre.name = data['name']
        ingre.memo = data['memo']
        ingre.created_at = data['created_at']
        db.session.commit()

    response_object = {
        'status': 'success',
        'message': f'재료가 {_f}되었습니다.'
    }

    return response_object, 200
