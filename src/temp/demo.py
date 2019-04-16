import sys
import requests
from bs4 import BeautifulSoup

url = 'https://github.com/session' 
res_session = requests.session()
loginPage = res_session.get(url)
loginHtml = BeautifulSoup(loginPage.text, 'html.parser')
token = loginHtml.find('input',{'name':'authenticity_token'})['value'] 
login_url = 'https://github.com/session'

data = {
        'authenticity_token':token, 
        'commit':'Sign+in',
        'login':'sewerganger',
        'password':'************',
        'utf8':'✓'
    }
res2 = res_session.post(login_url, data=data) 
demo =  open('./demo.html', 'w', encoding='utf-8')
demo.write(res2.text)