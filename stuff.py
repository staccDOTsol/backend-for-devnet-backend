import csv
import sys
import datetime
import requests
from time import sleep
from bs4 import BeautifulSoup
import pandas as pd



import requests
import json
headers = {
    'authority': 'api.thegraph.com',
    'accept': '*/*',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    # Already added when you pass json=
    # 'content-type': 'application/json',
    'origin': 'https://pancakeswap.finance',
    'referer': 'https://pancakeswap.finance/',
    'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Mobile Safari/537.36',
}

user_id='hello'


json_data_1 = {
    'query': '\n      query getUser($id: ID!) {\n        user(id: $id) {\n          \n  id\n  createdAt\n  updatedAt\n  block\n  totalBets\n  totalBetsBull\n  totalBetsBear\n  totalBNB\n  totalBNBBull\n  totalBNBBear\n  totalBetsClaimed\n  totalBNBClaimed\n  winRate\n  averageBNB\n  netBNB\n\n        }\n      }\n  ',
    'variables': {
        'id': user_id,
    },
    'operationName': 'getUser',
}
# might need to run json_data_1 first if the address has never had a leaderboard lookup
#before in order to run below json_data_2 to get the score

#also make sure lowercase id


json_data_2 = {
    'query': '\n      query getBetHistory($first: Int!, $skip: Int!, $where: Bet_filter) {\n        bets(first: $first, skip: $skip, where: $where, order: createdAt, orderDirection: desc) {\n          \n id\n hash  \n amount\n position\n claimed\n claimedAt\n claimedHash\n claimedBlock\n claimedBNB\n claimedNetBNB\n createdAt\n updatedAt\n\n          round {\n            \n  id\n  epoch\n  position\n  failed\n  startAt\n  startBlock\n  startHash\n  lockAt\n  lockBlock\n  lockHash\n  lockPrice\n  lockRoundId\n  closeAt\n  closeBlock\n  closeHash\n  closePrice\n  closeRoundId\n  totalBets\n  totalAmount\n  bullBets\n  bullAmount\n  bearBets\n  bearAmount\n\n          }\n          user {\n            \n  id\n  createdAt\n  updatedAt\n  block\n  totalBets\n  totalBetsBull\n  totalBetsBear\n  totalBNB\n  totalBNBBull\n  totalBNBBear\n  totalBetsClaimed\n  totalBNBClaimed\n  winRate\n  averageBNB\n  netBNB\n\n          }\n        }\n      }\n    ',
    'variables': {
        'first': 5,
        'skip': 0,
        'where': {
            'user': user_id,
        },
    },
    'operationName': 'getBetHistory',
}


















h = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'}




def scraper(num_pages=1, req_delay=0.1):
 try:
  list_of_bets=[]
  timestamp = datetime.datetime.now().strftime ("%Y%m%d_%H%M%S")

  #print("%d pages to parse with delay of %f seconds between each page" % (num_pages, req_delay))
  api_url = "https://bscscan.com/txs?a=0x18b2a687610328590bc8f2e5fedde3b582a49cda&ps=25"

  with open('VerifiedContracts-'+timestamp+'.csv', 'w') as csvfile:
    fieldnames = ['txn_hash','method','block','age','from','to','value','txn_fee']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

    for i in range(1, num_pages+1):
      url = api_url
      sleep(req_delay)
      response = requests.get(url, headers=h)
      #print(response.content)
      #print("URL: %s, Status: %s" % (url, response.status_code))

      content = response.content
      soup = BeautifulSoup(content, 'html.parser')

      for row in soup.select('table.table-hover tbody tr'):
        #print(row)
        cells = row.findAll('td')
        #print(cells)
        row_list=[]
        cells= map(lambda x:x.text, cells)
        #print(list(cells))
        r=list(cells)
        #print(r)
        user_id=r[6]

        json_data_1 = {
            'query': '\n      query getUser($id: ID!) {\n        user(id: $id) {\n          \n  id\n  createdAt\n  updatedAt\n  block\n  totalBets\n  totalBetsBull\n  totalBetsBear\n  totalBNB\n  totalBNBBull\n  totalBNBBear\n  totalBetsClaimed\n  totalBNBClaimed\n  winRate\n  averageBNB\n  netBNB\n\n        }\n      }\n  ',
            'variables': {
                'id': user_id,
            },
            'operationName': 'getUser',
        }
        # might need to run json_data_1 first if the address has never had a leaderboard lookup
        #before in order to run below json_data_2 to get the score

        #also make sure lowercase id


        json_data_2 = {
            'query': '\n      query getBetHistory($first: Int!, $skip: Int!, $where: Bet_filter) {\n        bets(first: $first, skip: $skip, where: $where, order: createdAt, orderDirection: desc) {\n          \n id\n hash  \n amount\n position\n claimed\n claimedAt\n claimedHash\n claimedBlock\n claimedBNB\n claimedNetBNB\n createdAt\n updatedAt\n\n          round {\n            \n  id\n  epoch\n  position\n  failed\n  startAt\n  startBlock\n  startHash\n  lockAt\n  lockBlock\n  lockHash\n  lockPrice\n  lockRoundId\n  closeAt\n  closeBlock\n  closeHash\n  closePrice\n  closeRoundId\n  totalBets\n  totalAmount\n  bullBets\n  bullAmount\n  bearBets\n  bearAmount\n\n          }\n          user {\n            \n  id\n  createdAt\n  updatedAt\n  block\n  totalBets\n  totalBetsBull\n  totalBetsBear\n  totalBNB\n  totalBNBBull\n  totalBNBBear\n  totalBetsClaimed\n  totalBNBClaimed\n  winRate\n  averageBNB\n  netBNB\n\n          }\n        }\n      }\n    ',
            'variables': {
                'first': 5,
                'skip': 0,
                'where': {
                    'user': user_id,
                },
            },
            'operationName': 'getBetHistory',
        }



            #user_id='0x242860828a899d3f6772d1638e7f0fb4f5'
        if 'Bet' in r[2]:

            response = requests.post('https://api.thegraph.com/subgraphs/name/pancakeswap/prediction-v2', headers=headers, json=json_data_1)
            result=response.json()
            #print(result)

            sleep(0.2)
            #response = requests.post('https://api.thegraph.com/subgraphs/name/pancakeswap/prediction-v2', headers=headers, json=json_data_2)

            try:
                total_bets=int(result['data']['user']['totalBetsBear'])+int(result['data']['user']['totalBetsBull'])
                win_rate=result['data']['user']['winRate']
                txn_hash=r[1]
                method=r[2]
                #block=r[3]
                age=r[5]
                f=r[6]
                #to=
                value=r[9]
                #txn_fee=
                win_rate=win_rate

                list_of_bets.append([txn_hash,method,age,f,value,win_rate,total_bets])

            except Exception as e:
                print(e)
                total_bets=0
                win_rate=0
                txn_hash=r[1]
                method=r[2]
                #block=r[3]
                age=r[5]
                f=r[6]
                #to=
                value=r[9]
                #txn_fee=
                win_rate=win_rate

                list_of_bets.append([txn_hash,method,age,f,value,win_rate,total_bets])

                continue




            #result=response.json()

            #print(result)
            count=0

            #for item in result['data']['bets']:
                #count=count+1
                #print(count)
                #print(item)










    #print(list_of_bets)
    with open('stuff.json', 'w' ) as f:
        f.write(json.dumps(list_of_bets))
    df = pd.DataFrame(list_of_bets, columns=[['txn_hash','method','age','from','value','win_rate','total_bets']])
    print(df)
    #sleep(1000)
        #print(vars(cells))
        #blah,txn_hash,method,block,age,f,to,value,txn_fee= cells
 except:
    abc=123

def main():
    try:
        if len(sys.argv) > 2:
            scraper(int(sys.argv[1]), float(sys.argv[2]))
        elif len(sys.argv) == 2:
            scraper(int(sys.argv[1]))
        else:
            scraper()
    except:
        abc=123
if __name__ == "__main__":
    while True:
        try:
            main()
        except:
            abc=123






#First run query 1


#Then run Query 2
#print(response)
