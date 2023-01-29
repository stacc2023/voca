from google.cloud import texttospeech
from speach.cambridge import cambridge
import os
import re

# api 인증 파일 환경변수에 등록
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.dirname(__file__) + '/credentials-tts.json'

# 폴더명과 국가코드를 매칭시키기 위한 변수
nations = {'en-us': 'us', 'en-gb': 'uk', 'ko-kr': 'kr'}

# Instantiates a client
client = texttospeech.TextToSpeechClient()

def make_voice(word, nation) :

    # Instantiates a client
    client = texttospeech.TextToSpeechClient()

    # Set the text input to be synthesized
    synthesis_input = texttospeech.SynthesisInput(text=word)

    # Build the voice request, select the language code ("en-US") and the ssml
    # voice gender ("neutral")
    voice = texttospeech.VoiceSelectionParams(
        language_code=nation, ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
    )

    # Select the type of audio file you want returned
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    # Perform the text-to-speech request on the text input with the selected
    # voice parameters and audio file type
    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )

    # The response's audio_content is binary.
    with open(os.getcwd() + f"/static/{nations[nation]}/{word}.mp3", "wb") as out:
        # Write the response to the output file.
        out.write(response.audio_content)

    return response.audio_content

def check_voice(data) :

    # 유효성 검사
    # 1. code 필드가 존재하는지 확인
    if 'code' not in data :
        err = 'code 필드가 존재하지 않습니다'
        return { 'error': err }, 400
    nation = data['code'].lower()
    # 2. code 필드가 유효한 값인지 확인
    if nation not in nations :
        err = '해당 code가 존재하지 않습니다'
        return { 'error': err }, 400
    # 3. word 필드에서 허용되는 특수문자를 제외하고 삭제
    word = ' '.join(re.sub(r"[^0-9a-zA-Z\uAC00-\uD7A3\-\=\,\(\) ]", " ", str(data['word'])).strip().split())


    # 보이스 파일이 존재하는지 확인
    uri = os.getcwd() + f'/static/{nations[nation]}/{word}.mp3'
    # 존재
    if os.path.exists(uri) :
        with open(uri, 'rb') as f :
            return f.read()
    #존재 안함
    data = make_voice(word, nation)
    return data