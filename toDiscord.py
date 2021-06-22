import requests
import secrets
import random
import time

link_file = open("urls.txt", "r")
entries = link_file.readlines()
link_file.close()

number_of_posts = random.randint(10,30)
print(number_of_posts)

i = 0
while i < number_of_posts:
    random_link = random.choice(entries)
    send_to_discord = f"{random_link}"
    data = {"content": send_to_discord,
            "username": "reddit"
        }
    requests.post(secrets.Discord_Webhook, data=data)
    time.sleep(5)
    i += 1
