import uuid
from .s3_connect import Bucket, s3
from flask_restx import reqparse
from werkzeug.datastructures import FileStorage


def reqparser():
    parser = reqparse.RequestParser()
    parser.add_argument('images', type=FileStorage,
                        location='files', action='append')
    parser.add_argument('thumbnail', type=FileStorage,
                        location='files')
    parser.add_argument('profile_image', type=FileStorage,
                        location='files')

    args = parser.parse_args()
    return args


def s3_upload_obj(file, prefix):
    # 업로드 성공 시 업로드된 이미지 주소, 실패 시 False 리턴
    try:
        f_type = file.mimetype.split('/')[1]
        full_path = prefix + str(uuid.uuid4().hex) + f'.{f_type}'

        s3.upload_fileobj(file, Bucket, full_path, ExtraArgs={
            'ACL': 'public-read',
            'ContentType': file.content_type
        })
    except Exception as e:
        print(e)
        return False
    return s3_img_path(full_path)


def s3_img_path(s3_path):
    location = s3.get_bucket_location(Bucket=Bucket)['LocationConstraint']
    image_url = f'https://{Bucket}.s3.{location}.amazonaws.com/{s3_path}'
    return image_url


def s3_delete_image(file_path):
    s3.delete_object(Bucket=Bucket, Key=file_path)
