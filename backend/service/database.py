import os
import csv
import json
import MySQLdb
from datetime import datetime
from random import randint
from MySQLdb._exceptions import DataError
from pathlib import Path

script_location = Path(__file__).absolute().parent


# DB 연결
conn = MySQLdb.connect(
    user=os.getenv('DB_USERNAME'),
    passwd=os.getenv('DB_PASSWORD'),
    host=os.getenv('DB_HOST'),
    db=os.getenv('DB_DATABASE')
)
cursor = conn.cursor()


# 1. DB에 회원 데이터 입력

with open(f'{script_location}/db_data/user_mock_data.json', encoding='utf-8') as json_file:
    json_data = json.load(json_file)
    for d in json_data:
        created_at = datetime.today().strftime("%Y/%m/%d %H:%M:%S")
        sql = 'INSERT INTO user(email, nickname, password, created_at) VALUES (%s, %s, %s, %s)'
        val = (d['email'], d['nickname'], d['password'], created_at)

        cursor.execute(sql, val)
        conn.commit()


# 2. DB에 재료 데이터 입력

ingre_list = []
f = open(f'{script_location}/db_data/ingredients.csv', 'r', encoding='utf-8')
rdr = csv.reader(f)
for line in rdr:
    ingre_list.append(line)
f.close()

sql = 'INSERT INTO ingredient(name) VALUES (%s)'
cursor.executemany(sql, ingre_list)
conn.commit()


# 3. Ingredient 테이블에서 재료 id, 재료명 불러오기

sql = 'select * from ingredient'
cursor.execute(sql)
result = cursor.fetchall()
ingre_dict = dict(map(reversed, result))  # tuple to dict (type(result)=tuple)


# 4. DB에 레시피 데이터 입력

random_num = []
for i in range(981):  # 레시피 작성자를 무작위로 뽑음
    random_num.append(randint(1, 31))

count = 0  # random_num의 인덱스
for i in range(1, 6):  # recipe1.json ~ recipe5.json
    json_path = f'{script_location}/db_data/recipe{i}.json'
    with open(json_path, encoding='utf-8') as json_file:
        json_data = json.load(json_file)
        for d in json_data:
            user_id = random_num[count]
            sql = 'INSERT INTO recipe(title, description, created_at, user_id) VALUES (%s, %s, %s, %s)'
            created_at = datetime.today().strftime("%Y/%m/%d %H:%M:%S")
            val = (d['title'], d['description'], created_at, user_id)

            try:
                cursor.execute(sql, val)
            except DataError:
                print(d['title'])

            conn.commit()

            sql = 'SELECT id FROM recipe where user_id = %s'
            cursor.execute(sql, (user_id,))
            recipe_id = cursor.fetchall()[0][0]

            # 레시피-재료 데이터 입력
            sql = 'INSERT INTO recipe_ingre(name, quantity, recipe_id, ingre_id) VALUES (%s, %s, %s, %s)'

            for ing in d['ingre_list']:
                ingre_id = ingre_dict[ing['name']]
                val = (ing['name'], ing['quantity'], recipe_id, ingre_id)
                cursor.execute(sql, val)
                conn.commit()

            # 레시피 정보 데이터 입력
            info = d['info']
            sql = 'INSERT INTO recipeInfo(portion_info, time_info, degree_info, recipe_id) VALUES (%s, %s, %s, %s)'
            val = (info['info1'], info['info2'], info['info3'], recipe_id)
            cursor.execute(sql, val)
            conn.commit()

            # 레시피 조리 순서 데이터 입력
            steps = d['step_list']
            sql = 'INSERT INTO recipeStep(step_num, step_desc, step_image, recipe_id) VALUES (%s, %s, %s, %s)'
            for n, step in enumerate(steps):
                val = (n + 1, step['desc'], step['img'], recipe_id)
                cursor.execute(sql, val)
                conn.commit()

            # 이미지 데이터 입력
            imgs = d['imgs']
            if len(imgs):
                sql = 'INSERT INTO recipeImage(img_path, recipe_id) VALUES (%s, %s)'
                for img in imgs:
                    val = (img, recipe_id)
                    cursor.execute(sql, val)
                    conn.commit()
            count += 1
conn.close()
