var globalJsonData;
var json_len;
var len;
var old_data_lenght;


function fetchData() {
const xhr = new XMLHttpRequest();
xhr.open('GET', 'static/blacklist.json', false); // false - синхронный режим
xhr.send();

if (xhr.status === 200) {
    globalJsonData = JSON.parse(xhr.responseText);
    len = Object.keys(globalJsonData).length;
    console.log(len);
} else {
    console.error('Ошибка:', xhr.statusText);
}
}
function processData() {
if (globalJsonData) {
    console.log('Данные JSON:', globalJsonData);
} else {
    console.log('Данные JSON не загружены');
}
}

fetchData();
console.log('Данные JSON:', len);

function add_blacklist_to_table(len) {
    const blacklist_body = document.getElementById("blacklist_body");
     for(let i = 0; i < len; i++){
        const row = document.createElement("tr");
        const choice_blacklist_cell = document.createElement("td");
        const choice_radio_button = document.createElement("input");
        choice_radio_button.setAttribute("type", "radio");
        choice_radio_button.setAttribute("name", "choice_blacklist");
        choice_radio_button.setAttribute("checked", "checked");
        choice_radio_button.setAttribute("value", i);
        choice_blacklist_cell.appendChild(choice_radio_button);
        const blacklist_cell = document.createElement("td");
        let text = `Черный список ${i+1}`
        blacklist_cell.textContent = text;
        console.log(blacklist_cell.textContent);
        const deleteCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Удалить";
        deleteButton.setAttribute("class", "table_button")
        deleteButton.onclick = () => delete_blacklist(text);
        deleteCell.appendChild(deleteButton);
        const editCell = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.textContent = "Редактировать";
        editButton.setAttribute("class", "table_button")
        editButton.onclick = () => edit_blacklist(text);
        editCell.appendChild(editButton);
        row.appendChild(choice_blacklist_cell);
        row.appendChild(blacklist_cell);
        row.appendChild(deleteCell);
        row.appendChild(editCell);
        blacklist_body.appendChild(row);
    };
}
function delete_blacklist(text) {
    
    const blacklist_body = document.getElementById("blacklist_body");
    const rows = blacklist_body.children;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const blacklist_cell = row.children[1]; // Используем индекс 1, так как first child - choice_blacklist_cell
        if (blacklist_cell.textContent === text) {
            const choice_radio_button = row.children[0].firstChild; // Получаем первый дочерний элемент (input)
            var value = Number(choice_radio_button.getAttribute("value")) + 1;
            console.log(value);
            blacklist_body.removeChild(row);
            break;
        }
    }
    delete_data = {
        blacklist: value
    }
    $.ajax({
        type: 'POST',
        url: '/delete_blacklist',
        data: JSON.stringify(delete_data),
        contentType: 'application/json',
        success: function(data) {
        }
    });
}

function edit_blacklist(text) {
    
    const blacklist_body = document.getElementById("blacklist_body");
    
    const rows = blacklist_body.children;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const blacklist_cell = row.children[1]; 
        if (blacklist_cell.textContent === text) {
            const choice_radio_button = row.children[0].firstChild;
            var value = Number(choice_radio_button.getAttribute("value")) + 1;
            console.log(value);
            break;
        }
    }

    
    delete_data = {
        blacklist: value
    }
    $.ajax({
        type: 'POST',
        url: '/edit_blacklist',
        data: JSON.stringify(delete_data),
        contentType: 'application/json',
        success: function(data) {
            console.log(data)
            document.getElementById("account_input").style.display = 'none';
                document.getElementById("IQS_proxy_input").style.display = 'none';
                document.getElementById("main_funcs").style.display = 'none';
                document.getElementById("blacklist_editor").style.display = 'block';
                function addIpsToEditTable(ips) {
                    const blacklist_body = document.getElementById("edit_body");
                    const row = blacklist_body.children;
                    console.log(row.length);
                    if(row.length > 0){
                        while (blacklist_body.firstChild) {
                            blacklist_body.removeChild(blacklist_body.firstChild);
                        }
                }
                    ips.forEach((ip) => {
                        const row = document.createElement("tr");
                        const ipCell = document.createElement("td");
                        ipCell.textContent = ip;
                        const deleteCell = document.createElement("td");
                        const deleteButton = document.createElement("button");
                        deleteButton.textContent = "Удалить";
                        deleteButton.onclick = () => delete_ip_from_blacklist(ip, value);
                        deleteCell.appendChild(deleteButton);
                        row.appendChild(ipCell);
                        row.appendChild(deleteCell);
                        blacklist_body.appendChild(row);
                    });
                }
                function delete_ip_from_blacklist(ip, value) {
                    save_data = {
                       ip: ip,
                       value: value     
                    }
                    $.ajax({
                        type: 'POST',
                        url: '/delete_ip_from_blacklist',
                        data: JSON.stringify(save_data),
                        contentType: 'application/json',
                        success: function(data) {
                            const edit_body = document.getElementById("edit_body");
                            const rows = edit_body.children;
                            for (let i = 0; i < rows.length; i++) {
                                const row = rows[i];
                                const ip_cell = row.children[0];
                                if (ip_cell.textContent == ip) {
                                    edit_body.removeChild(row);
                                    break;
                                }
                            }
                        }
                    });
                }
                addIpsToEditTable(data);        
        }
    });
}
add_blacklist_to_table(len)

$('#blacklist_add').on('click', function(){

    $.ajax({
        type: 'POST',
        url: '/new_blacklist',
        data: JSON.stringify("data: update blacklist"),
        contentType: 'application/json',
        success: function(response) {
            var parentElement = document.getElementById('blacklist_body');
            var childElement = parentElement.firstChild;
            while (childElement) {
            parentElement.removeChild(childElement);
            childElement = parentElement.firstChild;
            }
            
            let len1 = response;
            console.log(len1);
            console.log(typeof(len1));
            add_blacklist_to_table(len1)

        }
    })

});