var checker = false;
var run_checker = false;
var API_keys = [];
var proxies = [];
var rand_ip = [];
var load_file = false;
var ips=[];
var checked_proxy = [];
$('#settings_button').on('click', function(){
    if(checker == false){
        document.getElementById("parsing_settings_panels").style.display = 'flex';
        checker = true;
    } else{
        document.getElementById("parsing_settings_panels").style.display = 'none';
        checker = false;
    }
});

$('#run').on('click', function(){
    let public_access = document.getElementById('public_access');
    let mobile_device = document.getElementById('mobile_device');
    let lighter_penalties = document.getElementById('lighter_penalties');
    let strictness_level_data = document.getElementById('strictness_level').value;
    let find_regime = document.getElementsByName('Oktet');
    let blacklist_choice = document.getElementsByName('choice_blacklist');
    let proxy_type = document.getElementsByName('proxy_type');
    let find_regime_data
    let blacklist_data;
    let public_access_data;
    let mobile_device_data;
    let lighter_penalties_data;
    var proxy_type_data;
    let mult = document.getElementById('mult').value;
    console.log(mult);

    if(load_file == true & API_keys.length != 0 & proxies.length != 0 & mult != 0 & run_checker == false){
        document.getElementById('load_panel').style.display = 'block';
        document.getElementById('main_funcs').style.display = 'none';
        if (public_access.checked){
            console.log('pa true');
            public_access_data = 'true';
        }else{
            console.log('pa false')
            public_access_data = 'false';
        }
    
        if (mobile_device.checked){
            console.log('md true');
            mobile_device_data = 'true';
        }else{
            console.log('md false')
            mobile_device_data = 'false';
        }
    
        if (lighter_penalties.checked){
            console.log('lp true');
            lighter_penalties_data = 'true';
        }else{
            console.log('lp false')
            lighter_penalties_data = 'false';
        }
        
        run_checker = true;

        console.log(strictness_level_data);
    
        console.log(blacklist_choice);
        for (let i = 0; i < blacklist_choice.length; i++) {
            if (blacklist_choice[i].checked) {
                console.log(`Выбран черный список ${Number(blacklist_choice[i].value) + 1}`);
                blacklist_data = Number(blacklist_choice[i].value) + 1
            }
        }
        for (let i = 0; i < find_regime.length; i++) {
            if (find_regime[i].checked) {
                console.log(`Выбран режим ${find_regime[i].value}`);
                find_regime_data = Number(find_regime[i].value)
            }
        }
        for (let i = 0; i < proxy_type.length; i++) {
            if (proxy_type[i].checked) {
                console.log(`Выбран тип прокси ${proxy_type[i].value}`);
                proxy_type_data = proxy_type[i].value
            }
        }
    
        let data = {
            public_access: public_access_data,
            mobile_device: mobile_device_data,
            lighter_penalties: lighter_penalties_data,
            strictness_level: Number(strictness_level_data),
            blacklist: blacklist_data,
            find_regime: find_regime_data,
            proxy_type: proxy_type_data,
            accounts: API_keys,
            proxies: proxies,
            file: rand_ip,
            mult: mult
        };


        $.ajax({
            type: 'POST',
            url: '/run_script',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                console.log(response);
                if (response.message === 'Fail'){
                    document.getElementById("load_panel").style.display = 'none';
                    document.getElementById("main_funcs").style.display = 'block';
                    run_checker = false;
                } else{
                    ips = response.ips;
                    console.log(ips);
                    document.getElementById("account_input").style.display = 'none';
                    document.getElementById("IQS_proxy_input").style.display = 'none';
                    document.getElementById("load_panel").style.display = 'none';
                    document.getElementById("ip_blacklist_appender").style.display = 'block';
                    run_checker = false;
                    function addIpsToTable(ips) {
                        let ips1 = ips;
                        const ipBody = document.getElementById("ip-body");
                        ips.forEach((ip) => {
                            const row = document.createElement("tr");
                            const proxyCell = document.createElement("td");
                            const ipCell = document.createElement("td");
                            proxyCell.textContent = ip[3] + ':' + ip[4];
                            const deleteCell = document.createElement("td");
                            const deleteButton = document.createElement("button");
                            const checkCell = document.createElement("td");
                            const checkButton = document.createElement("button");
                            ipCell.textContent = ip[0];
                            deleteButton.textContent = "Добавить в черный список";
                            deleteButton.onclick = () => deleteIp(ip);
                            deleteCell.appendChild(deleteButton);
                            checkButton.textContent = "Проверить IP";
                            checkButton.onclick = () => check_ip(ips1);
                            checkCell.appendChild(checkButton);
                            row.appendChild(proxyCell);
                            row.appendChild(ipCell);
                            row.appendChild(deleteCell);
                            row.appendChild(checkCell);
                            ipBody.appendChild(row);
                        });
                    }
    
                    function check_ip(ips){
                        document.getElementById('ip_blacklist_appender').style.display = "none"
                        document.getElementById('load_panel').style.display = "block"
                        let check_data = {
                            ips: ips,
                            blacklist: blacklist_data,
                            find_regime: find_regime_data,
                            proxy_type_data: proxy_type_data
                        }
                        $.ajax({
                            type: 'POST',
                            url: '/check_ip',
                            data: JSON.stringify(check_data),
                            contentType: 'application/json',
                            success: function(response) {
                                console.log(response)
                                ips = response;
                                let ipBody = document.getElementById("ip-body");
                                let childElement = ipBody.firstChild;
                                while (childElement) {
                                    ipBody.removeChild(childElement);
                                    childElement = ipBody.firstChild;
                                }
                                document.getElementById('load_panel').style.display = "none"
                                document.getElementById('ip_blacklist_appender').style.display = "block"
                                addIpsToTable(response.ips)
                            }
                        });
                    }
                    function deleteIp(ip) {
                        let save_data = {
                           ip: ip,
                           blacklist: blacklist_data     
                        }
                        $.ajax({
                            type: 'POST',
                            url: '/delete_ip',
                            data: JSON.stringify(save_data),
                            contentType: 'application/json',
                            success: function(data) {
                                const ipBody = document.getElementById("ip-body");
                                const rows = ipBody.children;
                                for (let i = 0; i < rows.length; i++) {
                                    const row = rows[i];
                                    const ipCell = row.children[0];
                                    if (ipCell.textContent === ip) {
                                        ipBody.removeChild(row);
                                        break;
                                    }
                                }
                            }
                        });
                    }
                    addIpsToTable(ips);
                }
                }
            });
                }
                

    
});





$('#account_add').on('click', function(){
        document.getElementById("account_input").style.display = 'flex';
        document.getElementById("main_funcs").style.display = 'none';
});
$('#edit_blacklist_back').on('click', function(){
    document.getElementById("account_input").style.display = 'none';
    document.getElementById("IQS_proxy_input").style.display = 'none';
    document.getElementById("main_funcs").style.display = 'block';
    document.getElementById("blacklist_editor").style.display = 'none';
});

$('#add_account_confirm').on('click', function(){
    if(document.getElementById("API_key_input").value != ''){
        let API_key = document.getElementById("API_key_input").value;
        API_keys.push(API_key);
        document.getElementById("API_key_input").value = '';
        const account_body = document.getElementById("account_body");
        const row = document.createElement("tr");
        const account_num_cell = document.createElement("td");
        account_num_cell.textContent = API_keys.length;
        let API_key_id = API_key;
        const deleteCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Удалить";
        deleteButton.setAttribute("class", "table_button")
        deleteButton.onclick = () => delete_proxy(API_key);
        deleteCell.appendChild(deleteButton);
        row.appendChild(account_num_cell);
        row.appendChild(deleteCell);
        account_body.appendChild(row);
        function delete_proxy(API_key) {
                const account_body = document.getElementById("account_body");
                const rows = account_body.children;
                for (let i = 0; i < API_keys.length; i++) {
                    const row = rows[i];
                    if (API_keys[i] == API_key) {
                        API_keys.splice(i, 1);
                        account_body.removeChild(row);
                        break;
                    }
                }
                console.log(API_keys)
        }
        document.getElementById("account_input").style.display = 'none';
        document.getElementById("API_key_input").value = '';
        document.getElementById("main_funcs").style.display = 'block';
    }
});

$('#log').on('click', function(){
    window.open('/logs', '_blank');
    console.log('hello');
});

$('#log1').on('click', function(){
    window.open('/logs', '_blank');
    console.log('hello');
});

$('#return_to_main_menu').on('click', function(){
    document.getElementById('ip_blacklist_appender').style.display = 'none';
    document.getElementById('main_funcs').style.display = 'block'
    let ipBody = document.getElementById("ip-body");
    let childElement = ipBody.firstChild;
    while (childElement) {
        ipBody.removeChild(childElement);
        childElement = ipBody.firstChild;
    }

})

$('#cancle_add_account').on('click', function(){
        document.getElementById("account_input").style.display = 'none';
        document.getElementById("API_key_input").value = '';
        document.getElementById("main_funcs").style.display = 'block';
});

$('#proxy_add').on('click', function(){
    document.getElementById("IQS_proxy_input").style.display = 'flex';
    document.getElementById("main_funcs").style.display = 'none';
});

$('#add_proxy_confirm').on('click', function(){
    let login = document.getElementById("Proxy_login_input").value;
    let password = document.getElementById("Proxy_password_input").value;
    let ip = document.getElementById("Proxy_ip_input").value;
    let port = document.getElementById("Proxy_port_input").value;
    let proxy_type = document.getElementsByName('user_proxy_type')
    let user_proxy_type_data;
    for (let i = 0; i < proxy_type.length; i++) {
        if (proxy_type[i].checked) {
            console.log(`Выбран тип ${proxy_type[i].value}`);
            user_proxy_type_data = proxy_type[i].value
        }
    }
    if(login != '' & password != '' & ip != '' & port != ''){
        document.getElementById("Proxy_login_input").value = '';
        document.getElementById("Proxy_password_input").value = '';
        document.getElementById("Proxy_ip_input").value = '';
        document.getElementById("Proxy_port_input").value = '';
        let proxy = [login, password, ip, port, user_proxy_type_data];
        console.log(proxy);
        proxies.push(proxy);
        const proxy_body = document.getElementById("proxy_body");
        const row = document.createElement("tr");
        const proxy_num_cell = document.createElement("td");
        proxy_num_cell.textContent = proxies.length;
        let proxy_id = proxy;
        const deleteCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Удалить";
        deleteButton.setAttribute("class", "table_button");
        deleteButton.onclick = () => delete_proxy(proxy_id);
        deleteCell.appendChild(deleteButton);
        row.appendChild(proxy_num_cell);
        row.appendChild(deleteCell);
        proxy_body.appendChild(row);
        function delete_proxy(proxy_id) {
                const proxy_body = document.getElementById("proxy_body");
                const rows = proxy_body.children;
                for (let i = 0; i < proxies.length; i++) {
                    const row = rows[i];
                    if (proxies[i] == proxy_id) {
                        proxies.splice(i, 1);
                        proxy_body.removeChild(row);
                        break;
                    }
                }
        }

        document.getElementById("IQS_proxy_input").style.display = 'none';
        document.getElementById("main_funcs").style.display = 'block';
    }
});

$('#cancle_add_proxy').on('click', function(){
        document.getElementById("IQS_proxy_input").style.display = 'none';
        document.getElementById("main_funcs").style.display = 'block';
        document.getElementById("Proxy_login_input").value = '';
        document.getElementById("Proxy_password_input").value = '';
        document.getElementById("Proxy_ip_input").value = '';
        document.getElementById("Proxy_port_input").value = '';
});

const fileInput = document.getElementById('fileInput');

fileInput.addEventListener('change', (e) => {
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const fileContent = reader.result;
    const lines = fileContent.split('\n');
    if(rand_ip.length > 0){
        rand_ip = [];
    }
    lines.forEach((line) => {
      const loginMatch = line.match(/login:(.*) password:/);
      const passwordMatch = line.match(/password:(.*) ip/);
      const ipMatch = line.match(/ip:(.*) port/);
      const portMatch = line.match(/port:(.*)/);
      if (loginMatch && passwordMatch && ipMatch && portMatch) {
        const login = loginMatch[1].trim();
        const password = passwordMatch[1].trim();
        const ip = ipMatch[1].trim();
        const port = portMatch[1].trim();

        rand_ip.push([login, password, ip, port]);
        load_file = true;
      }
    });
    console.log(rand_ip);
  };
  reader.readAsText(file);
});
