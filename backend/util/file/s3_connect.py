import os
import boto3

Bucket = os.getenv('AWS_STORAGE_BUCKET_NAME')


def s3_connect():
    try:
        s3 = boto3.client(
            service_name='s3',
            region_name='ap-northeast-2',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
        )
    except Exception as e:
        print(e)
    else:
        print('********** s3 bucket connected! **********')
        return s3


s3 = s3_connect()
