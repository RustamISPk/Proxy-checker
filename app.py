from flask import Flask, request, render_template
from flask_cors import CORS
from flask import jsonify
import json
import numpy as np
import multiprocessing
from funcs import check_proxy, check_ip, delete_ip_from_blacklist, delete_blacklist, \
    save, append_blacklist
import logging

app = Flask(__name__)
CORS(app)
logger = logging.getLogger('app')
logger.setLevel(logging.ERROR)
file_handler = logging.FileHandler('error.log')
file_handler.setLevel(logging.ERROR)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)


@app.route('/')
def index():
    try:
        return render_template("index.html")
    except Exception as e:
        logger.error(f"An error occurred: {e}")


@app.route('/run_script', methods=['POST'])
def run_script():
    try:
        processes = []
        data = request.get_json()
        blacklist_count = str(data['blacklist'])
        api_keys = data['accounts']
        proxy_type = data['proxy_type']
        user_proxies = data['proxies']
        api_key_count = multiprocessing.Value('i', 0)
        api_key_use_count = multiprocessing.Value('i', 0)
        proxy_count = multiprocessing.Value('i', 0)
        user_proxy_count = multiprocessing.Value('i', 0)
        for user_proxy in user_proxies:
            for i in range(len(user_proxy)):
                user_proxy[i] = user_proxy[i].replace(' ', '')
        strictness = data['strictness_level']
        public_access = data['public_access']
        mobile = data['mobile_device']
        fast = data['lighter_penalties']
        count = int(data['mult'])
        proxy = data['file']
        checked_ips = multiprocessing.Manager().list()
        if len(proxy) % count == 0:
            chunks = np.array_split(proxy, count)
        else:
            chunks = np.array_split(proxy, count)
        for i in range(count):
            process = multiprocessing.Process(target=check_proxy, args=(
                chunks[i], api_keys, user_proxies, strictness, public_access, mobile, fast, checked_ips, api_key_count,
                api_key_use_count, proxy_count, user_proxy_count))
            processes.append(process)
            process.start()
        for process in processes:
            process.join()
        if len(checked_ips) == 0:
            response = jsonify({'message': 'Fail'})
            return response
        find_regime = data['find_regime']
        ips = check_ip(checked_ips, blacklist_count, find_regime, proxy_type)
        response = jsonify({'message': 'Data processed!', 'ips': ips})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        response = jsonify({'message': 'Fail'})
        return response


@app.route('/check_ip', methods=['POST'])
def recheck_proxy():
    try:
        data = request.get_json()
        print(f'data {data}')
        ips = data['ips']
        print(type(ips))
        print(f'ips {ips}')
        proxy_type = data['proxy_type_data']
        print(proxy_type)
        for i in range(len(ips)):
            del ips[i][0]
            print(f'ips {ips}')
        send_data = check_ip(ips, str(data['blacklist']), data['find_regime'], proxy_type)
        response = jsonify({'message': 'Data processed!', 'ips': send_data})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    except Exception as e:
        logger.error(f"An error occurred: {e}")


@app.route('/new_blacklist', methods=['POST'])
def new_blacklist():
    try:
        data = request.get_json()
        blacklists_len = append_blacklist()
        response = jsonify(blacklists_len)
        return response
    except Exception as e:
        logger.error(f"An error occurred: {e}")


@app.route('/delete_blacklist', methods=['POST'])
def delete_blacklist_response():
    try:
        data = request.get_json()
        key = str(data['blacklist'])
        delete_blacklist(key)
        response = jsonify('Data deleted')
        return response
    except Exception as e:
        logger.error(f"An error occurred: {e}")


@app.route('/delete_ip', methods=['POST'])
def delete_ip():
    try:
        data = request.get_json()
        key = data['blacklist']
        ip = data['ip']
        save(key, ip)
        return jsonify({'message': 'IP-адрес удален'})
    except Exception as e:
        logger.error(f"An error occurred: {e}")


@app.route('/edit_blacklist', methods=['POST'])
def get_blacklist():
    try:
        data = request.get_json()
        key = str(data['blacklist'])
        with open('static/blacklist.json', 'r') as file:
            data_json = json.load(file)
            blacklist = data_json[key]
            response = jsonify(blacklist)
        return response
    except Exception as e:
        logger.error(f"An error occurred: {e}")


@app.route('/delete_ip_from_blacklist', methods=['POST'])
def delete_from_blacklist():
    try:
        data = request.get_json()
        ip = data['ip']
        key = str(data['value'])
        delete_ip_from_blacklist(ip, key)
        response = jsonify('blacklist')
        return response
    except Exception as e:
        logger.error(f"An error occurred: {e}")


@app.route('/logs')
def logs():
    with open('error.log', 'r') as f:
        log_content = f.read()
    return render_template('logs.html', log_content=log_content)


if __name__ == '__main__':
    app.run()
