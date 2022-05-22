from flask import jsonify, request
from flask_restx import abort
from http.client import HTTPException
from werkzeug.exceptions import HTTPException, _aborter, default_exceptions
from app.extension import login_manager


msg_dict = {
    400: '잘못된 요청입니다.',
    401: '인증에 실패했습니다.',
    403: '권한이 없습니다.',
    404: '존재하지 않는 리소스입니다.',
    409: '서버의 상태와 요청이 충돌됩니다.'
}


@login_manager.unauthorized_handler
def unauthorized():
    if request.blueprint == 'api':
        abort(401)


def app_error_handler(app):
    def error_handling(error):
        if isinstance(error, HTTPException):  # HTTPException의 경우
            keys = list(msg_dict.keys())
            result = {
                'code': error.code,
                'description': error.description,
                'message': str(error)
            }
            if error.code in keys:
                result['message'] = msg_dict[error.code]
        else:
            description = _aborter.mapping[500].description  # 나머지 exception
            result = {
                'code': 500,
                'description': '[Internal Server Error] 서버 오류\n' + description,
                'message': str(error)
            }
        res = jsonify(result)
        res.status_code = result['code']
        return res

    for code in default_exceptions.keys():  # 에러 핸들러 등록
        app.register_error_handler(code, error_handling)

    return app


def api_error_handler(api):
    @api.errorhandler(HTTPException)
    def handle_error(e):
        try:  # custom message data가 있는 경우
            e.data.update({'status': e.name, 'description': e.description})
            return e.data, e.code

        except AttributeError:  # # custom message data가 없는 경우
            try:
                msg = msg_dict[e.code]
                return {'status': e.name, 'message': msg, 'description': e.description}, e.code
            except KeyError:
                return abort(e.code)
