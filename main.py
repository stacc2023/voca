from flask import Flask, render_template, request
from sheet import check, update, reset, sheets
from speach import tts
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/sheets')
def get_sheets() :
    return sheets()

@app.route('/words', methods=['POST'])
def words() :
    data = json.loads(request.get_data())
    return check(data["sheet"], 'A' + str(data["start"]) + ':C' + str(data['end']))

@app.route('/reset', methods=['POST'])
def reset_word() :
    data = json.loads(request.get_data())
    reset(data["sheet"], 'A' + str(data["start"]) + ':A' + str(data['end']), data["start"], data["end"])
    return ['ok']

@app.route('/erase', methods=['POST'])
def erase() :
    data = json.loads(request.get_data())
    update(data["sheet"], 'A' + str(data["start"]) + ':C' + str(data['end']), data['data'])
    return ['ok']

@app.route('/speach', methods=['POST'])
def speach() :
    data = json.loads(request.get_data())
    return tts(data['word'], data['code'])


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)

