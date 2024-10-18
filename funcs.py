import requests
import json
import pandas as pd
import numpy as np


def check_ip(checked_ips, blacklist_count, find_regime, proxy_type):
    ips = []
    with open('static/blacklist.json', 'r') as f:
        data_json = json.load(f)
    data = pd.Series(data_json[blacklist_count])
    for i in range(len(checked_ips)):
        login = checked_ips[i][0]
        password = checked_ips[i][1]
        ip = checked_ips[i][2]
        port = checked_ips[i][3]
        proxy_url = f"{proxy_type}://{login}:{password}@{ip}:{port}"

        proxies = {
            "http": proxy_url,
            "https": proxy_url
        }
        response = requests.get("https://api.ipify.org", proxies=proxies)

        ip_address = response.text.strip()
        if find_regime == 1:
            if not np.isin(ip_address, data):
                ips.append([ip_address, checked_ips[i][0], checked_ips[i][1], checked_ips[i][2], checked_ips[i][3]])
        elif find_regime == 0:
            ip_address_slice = ip_address.rsplit(('.', 1)[0])
            ip_address = ip_address_slice[0] + '.' + ip_address_slice[1] + '.' + ip_address_slice[2]
            if not data.str.contains(ip_address).any():
                ip_address = ip_address + '.' + ip_address_slice[3]
                ips.append([ip_address, checked_ips[i][0], checked_ips[i][1], checked_ips[i][2], checked_ips[i][3]])
    return ips


def check_proxy(proxy, api_key, user_proxies, strictness, public_access, mobile, fast, checked_ips, api_key_count_mult,
                api_key_use_count_mult, proxy_count_mult, user_proxy_count_mult):
    api_key_count = api_key_count_mult.value
    api_key_use_count = api_key_use_count_mult.value
    proxy_count = proxy_count_mult.value
    user_proxy_count = user_proxy_count_mult.value

    params = {
            'strictness': strictness,
            'allow_public_access_points': public_access,
            'mobile': mobile,
            'fast': fast
    }
    change_proxy = int(len(proxy) / len(user_proxies))
    for i in range(len(proxy)):
        use_api_key = api_key[api_key_count].replace(' ', '')
        url = f'https://ipqualityscore.com/api/json/ip/{use_api_key}/{proxy[i][2]}'

        proxy_url = f"{user_proxies[user_proxy_count][4]}://{user_proxies[user_proxy_count][0]}:{user_proxies[user_proxy_count][1]}@{user_proxies[user_proxy_count][2]}:{user_proxies[user_proxy_count][3]}"

        proxies = {
            "http": proxy_url,
            "https": proxy_url
        }
        response = requests.get(url, proxies=proxies, params=params)
        IQS_data = response.json()

        if IQS_data['message'] == 'Error: You have exceeded your request quota of 200 per day. Please upgrade to ' \
                                      'increase your request quota.' or api_key_use_count >= 200:
            api_key_count += 1
            api_key_use_count = 0
        if proxy_count >= change_proxy and user_proxy_count < len(user_proxies) - 1:
                proxy_count = 0
                user_proxy_count += 1

        if response.status_code == 200 and IQS_data['success'] == True:
            if IQS_data['proxy'] == False:
                checked_ips.append([proxy[i][0], proxy[i][1], proxy[i][2], proxy[i][3]])
        proxy_count += 1
        api_key_use_count += 1
    return checked_ips


def remove_keys_and_renumber(dictionary, key):
    dictionary.pop(key, None)
    new_dictionary = {}
    for new_key, old_key in enumerate(sorted(dictionary.keys()), start=1):
        new_dictionary[new_key] = dictionary[old_key]
    return new_dictionary


def delete_blacklist(key):
    with open('static/blacklist.json', 'r+') as f:
        data_json = json.load(f)
        new_keys = []
        for i in range(len(data_json)):
            new_keys.append(str(i + 1))
        updated_dict = remove_keys_and_renumber(data_json, key)
        f.seek(0)
        json.dump(updated_dict, f, indent=4)
        f.truncate()
        f.close()


def save(key, ip):
    with open('static/blacklist.json', 'r+') as f:
        data_json = json.load(f)
        data_json[f'{key}'].append(str(ip))
        f.seek(0)
        json.dump(data_json, f, indent=4)
        f.truncate()
        f.close()


def append_blacklist():
    with open('static/blacklist.json', 'r+') as f:
        data_json = json.load(f)
        data_json.update({str(len(data_json) + 1): []})
        blacklists_len = len(data_json)
        f.seek(0)
        json.dump(data_json, f, indent=4)
        f.truncate()
        f.close()
    return blacklists_len


def delete_ip_from_blacklist(ip, key):
    with open('static/blacklist.json', 'r+') as file:
        data_json = json.load(file)
        data_json[key].remove(ip)
        file.seek(0)
        json.dump(data_json, file, indent=4)
        file.truncate()
        file.close()
