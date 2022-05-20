from flask_restx import fields, Model


class LikesNumGet(fields.Raw):
    def format(self, value):
        return len(value)


class ImageGet(fields.Raw):
    def format(self, value):
        res = []
        for img in value:
            res.append(img.img_path)
        return res


user_base = Model('user_base', {
    'id': fields.Integer(required=True, description='회원 식별자'),
    'email': fields.String(required=True, description='회원 이메일'),
    'nickname': fields.String(required=True, description='회원 닉네임'),
    'profile_image': fields.String(required=False, description='회원 프로필 이미지')
})

recipe_base = Model('recipe_base', {
    'id': fields.Integer(required=True, description='레시피 식별자'),
    'author': fields.Nested(user_base, required=True, description='레시피 작성자', attribute='user'),
    'title': fields.String(required=True, description='레시피 제목'),
    'thumbnail': fields.String(required=False, description='레시피 썸네일 이미지'),
    'likes': LikesNumGet(attribute='like_users', required=False, description='레시피 좋아요 수')
})
