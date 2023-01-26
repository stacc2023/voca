import requests
from bs4 import BeautifulSoup as bs

src_url = 'https://dictionary.cambridge.org/ko/%EC%82%AC%EC%A0%84/%EC%98%81%EC%96%B4-%ED%95%9C%EA%B5%AD%EC%96%B4/'
media_url = 'https://dictionary.cambridge.org'

word = "landscape"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36"
}


def cambridge(word, type) :
    # 미국영어, 영국영어 이외는 거르기
    if type not in ['en-US', 'en-GB'] :
        return False

    # 단어 페이지 불러오기
    res = requests.get(src_url + word, headers=headers)
    soup = bs(res.text, "html.parser")
    
    # 영어 발음 또는 영국 발음
    if type == 'en-US' :
        el = soup.select_one('#audio2 source')
    elif type == 'en-GB' :
        el = soup.select_one('#audio1 source')

    # 단어 추출
    if el :
        src = el.attrs['src']
        res = requests.get(media_url + src, headers=headers)
        return res.content
    # 단어가 없으면 실패
    else :
        return False