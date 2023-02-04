from oauth2client.service_account import ServiceAccountCredentials
import gspread

scope = [
    "https://spreadsheets.google.com/feeds",
    "https://www.googleapis.com/auth/drive",
]

json_key_path = "./credentials.json"

credential = ServiceAccountCredentials.from_json_keyfile_name(json_key_path, scope)
gc = gspread.authorize(credential)

spreadsheet_key = "1yKugg1CoQyZgfy5zgo_VbcuE2NLxEZ-QQi84iKdQjbk"
doc = gc.open_by_key(spreadsheet_key)

def sheets() :
    return [{'title': sheet.title, 'id': sheet.id} for sheet in doc.worksheets()]

def check(sheet_name, range) :
    sheet = doc.worksheet(sheet_name)
    return sheet.get(range)

def update(sheet_name, area, data) :
    sheet = doc.worksheet(sheet_name)
    for row in data :
        for i in range(len(row)) :
            if row[i] == 'TRUE' :
                row[i] = True
            elif row[i] == 'FALSE' :
                row[i] = False
    sheet.update(area, data)

def reset(sheet_name, area, start, end) :
    sheet = doc.worksheet(sheet_name)
    sheet.update(area, [[False] for i in range(len(sheet.get(area)))])