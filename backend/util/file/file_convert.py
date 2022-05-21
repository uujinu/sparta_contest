from PIL import Image
from io import BytesIO


def image_to_bytes(self, img):
    res = BytesIO()  # 파일 객체(BytesIO)로 컨버팅
    img.save(res, format='JPEG')
    res.seek(0)  # 바이트 스트림의 offset을 0으로 변경
    return res


def convert_image(self, img, w, h):
    _t = Image.open(img).copy()
    temp = _t.convert('RGB')
    temp.thumbnail((w, h), Image.ANTIALIAS)
    return image_to_bytes(temp)
