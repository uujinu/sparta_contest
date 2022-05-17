import csv
import json
import requests
from bs4 import BeautifulSoup as bs


def to_json(recipe_dict):
    with open('recipe.json', 'w', encoding='utf-8') as file:
        json.dump(recipe_dict, file, ensure_ascii=False, indent='\t')


def to_csv(recipe_list):
    with open('ingredients.csv', 'w', encoding='utf-8', newline='') as file:
        csvfile = csv.writer(file)
        for row in recipe_list:
            csvfile.writerow(row)


orig_url = 'https://www.10000recipe.com/recipe/list.html?order=reco&page='

url_list = []

for i in range(1, 26):
    html = requests.get(orig_url + str(i)).text
    soup = bs(html, 'html.parser')

    sp_list = soup.select('ul.common_sp_list_ul > li > div > a')
    for li in sp_list:
        url_list.append(li['href'])

recipe_list = []
ingre_set = set()
count = 0

for n, m in enumerate(url_list):  # /recipe/xxxxxxx
    url = 'https://www.10000recipe.com'
    url += m

    html = requests.get(url).text
    soup = bs(html, 'html.parser')

    # 썸네일 url
    if soup.select_one('#main_thumbs') is None:  # 썸네일 없는 레시피 제외
        print('썸네일 없음 || ', m)
        continue
    thumb_url = soup.select_one('#main_thumbs')['src']

    # 레시피 서머리(제목, 서론, 정보)
    summary = soup.select_one('div.view2_summary')

    # 제목
    title = summary.select_one('h3').text

    # 서론(없는 경우 ''처리)
    description = ''
    t = summary.select_one('div.view2_summary_in')
    if t is not None:
        description = t.text.replace('\n', '').strip()
    else:
        description = ''

    # 정보(몇인분,조리시간,난이도)
    info_dict = {}
    info_list = summary.select('div.view2_summary_info > span')

    if len(info_list) < 3:  # 정보 3개 모두 적지 않은 레시피 제외
        continue

    for n, info in enumerate(info_list):
        info_dict[f'info{str(n+1)}'] = info.text  # key: info1, info2, info3
        if n == 1 and info.text == '120분 이내':
            info_dict[f'info{str(n+1)}'] = '2시간 이내'

    # 재료
    if soup.select_one('div.ready_ingre3') is None:  # 재료 안적은 레시피 제외
        continue

    ings = soup.select_one('div.ready_ingre3').find_all('li')

    ingre_list = []  # 재료 리스트

    # 재료명, 용량
    for ing in ings:
        t = ing.text.split('\n')
        name, quantity = t[0].strip(), t[1].strip()
        if ' '*56 in name:
            t = name.replace(' '*56, '\n').split('\n')
            name, quantity = t[0], t[1]

        if quantity == '':  # 재료량 미입력시 '적당량' 처리
            quantity = '적당량'

        ingre_dict = {
            'name': name,
            'quantity': quantity
        }
        ingre_list.append(ingre_dict)
        ingre_set.add(name)  # 재료만 저장(중복 제외)

    # 조리 순서(recipe)
    step_list = []

    steps = soup.select('div.view_step > div.view_step_cont')
    for n, step in enumerate(steps):
        desc = step.select_one('div').text

        img = step.select_one('div:nth-child(2) > img')
        if img is not None:
            img = img['src']
        else:
            img = ''

        step_dict = {
            'desc': desc,
            'img': img
        }
        step_list.append(step_dict)

    # 완성 이미지
    img_list = []

    imgs = soup.select_one('div#completeimgs')
    if imgs is not None:  # 이미지가 있는 경우
        img_item = imgs.select('div.carouItem > img')
        for item in img_item:
            t = item['src']
            img_list.append(t)

    count += 1
    recipe_dict = {
        'id': count,
        'title': title,
        'description': description,
        'info': info_dict,
        'ingre_list': ingre_list,
        'step_list': step_list,
        'imgs': img_list
    }
    recipe_list.append(recipe_dict)

# 레시피 리스트 json으로 변환
to_json(recipe_list)

# 재료 리스트 csv로 변환
ingre_list_csv = []
for i in ingre_set:
    tmp_l = []
    tmp_l.append(i)
    ingre_list_csv.append(tmp_l)

to_csv(ingre_list_csv)
