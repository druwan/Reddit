import requests
import requests.auth
import secrets

# Save a txt of all urls
def save_urls(list1):
    link_file = open("urls.txt", "w")
    for link in list1:
        link_file.write(f"{link}\n")
    link_file.close()

def save_subreddits(list1):
    link_file = open("subreddits.txt", "w")
    for link in list1:
        link_file.write(f"{link}\n")
    link_file.close()

def save_titles(list1):
    link_file = open("titles.txt", "w", encoding="utf-8")
    for link in list1:
        link_file.write(f"{link}\n")
    link_file.close()

def save_urls_overridden(list1):
    link_file = open("url_overridden_by_dest.txt", "w")
    for link in list1:
        link_file.write(f"{link}\n")
    link_file.close()

def first_page(first_request):
    i = 0
    while i < first_request.json()["data"]["dist"]:
        for key, value in first_request.json()["data"]["children"][i]["data"].items():
            if key == "subreddit_name_prefixed":
                subreddit_name_prefixed.append(first_request.json()["data"]["children"][i]["data"][key])
            if key == "title":
                title.append(first_request.json()["data"]["children"][i]["data"][key])
            if key == "url_overridden_by_dest":
                url_overridden_by_dest.append(first_request.json()["data"]["children"][i]["data"][key])
            if key == "url":
                url.append(first_request.json()["data"]["children"][i]["data"][key])
        i += 1

def after_pages(next_after_id):
    if next_after_id == None:
        return "Last page"
    else:
        print(next_after_id)
        response = requests.get(f"https://oauth.reddit.com/user/{secrets.username}/upvoted/?count=100&after={next_after_id}", headers=headers)
        next_after = response.json()["data"]["after"]
        # Extract results here
        i = 0
        while i < response.json()["data"]["dist"]:
            for key, value in response.json()["data"]["children"][i]["data"].items():
                if key == "subreddit_name_prefixed":
                    subreddit_name_prefixed.append(response.json()["data"]["children"][i]["data"][key])
                if key == "url_overridden_by_dest":
                    url_overridden_by_dest.append(response.json()["data"]["children"][i]["data"][key])
                if key == "title":
                    title.append(response.json()["data"]["children"][i]["data"][key])
                if key == "url":
                    url.append(response.json()["data"]["children"][i]["data"][key])
            i += 1   
        return after_pages(next_after)
    


## Get the first page of upvotes
client_auth = requests.auth.HTTPBasicAuth(secrets.oAuth_client_id, secrets.oAuth_client_secret)
post_data = {"grant_type": "password", "username": secrets.username, "password":secrets.password}
headers = {"User-Agent": "ChangeMeClient/0.1 by YourUsername"}
getAuth = requests.post("https://www.reddit.com/api/v1/access_token", auth=client_auth, data=post_data, headers=headers)
access_token = getAuth.json()["access_token"]
headers = {"Authorization": "bearer" + " " + access_token, "User-Agent": "ChangeMeClient/0.1 by YourUsername"}
base = requests.get(f"https://oauth.reddit.com/user/{secrets.username}/upvoted/", headers=headers)

second_page_id = base.json()["data"]["after"]
subreddit_name_prefixed, title, url_overridden_by_dest, url = [], [], [], []

first_page(base)
after_pages(second_page_id)



copy_of_url = url[:]
copy_of_subreddit_name_prefixed = subreddit_name_prefixed[:]
copy_of_title = title[:]
copy_of_url_overridden_by_dest = url_overridden_by_dest[:]
# Save a txt of all urls
save_urls(copy_of_url)
save_subreddits(copy_of_subreddit_name_prefixed)
save_titles(copy_of_title)
save_urls_overridden(copy_of_url_overridden_by_dest)