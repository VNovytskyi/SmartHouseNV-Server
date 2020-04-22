var editMode = false;


//var ws = new WebSocket('ws://192.168.1.106', 'protocolOne');
var ws = new WebSocket('ws://192.168.1.102:88', 'protocolOne');

ws.onopen = (event) => {
    console.log("WebSocket open");
}

ws.onerror = (event) => {
    console.log("WebSocket error");
    console.log(event);
}

/*
    Обработчик входящего сообщения
*/
var elements;
ws.onmessage = event => {
    let commandArr = JSON.parse(event.data);
    console.log("Input");
    console.log(commandArr);
  
    commandArr.forEach(element => {
        elements = document.getElementsByName(element.name);
        
        if(element.name ==  "body"){
            document.body.innerHTML = element.value;
            document.getElementById("editMode").checked = editMode;

            if(editMode){
                setEditMode();
            }
            else{
                unsetEditMode();
            }

            console.log("New body");
        }

        if(elements.length == 0){
            console.log("Not elements!");
            return;
        }

        
        
        let target = null;
        
        elements.forEach(el => {
            if(el.closest("#" + element.homeLocation)){
                target = el;
            }
        });

        if(target != null){
            switch(target.type){
                case "button":
                    buttonToggle(target, element.value);
                break;

                case "range":
                case "color":
                    target.value = element.value;
                    console.log("New body");
                break;

                default:
                    console.log("Not handler: " + target.type + " -> " + target.value);
            }
        }else{
            console.log("[ ERROR ] Target = null");
        }
    });
};

ws.onclose = event => {
    console.log("WebSocket close");
};

//TODO: Fix bug - for one object eventsHandler() may be called several time
document.addEventListener("click", eventsHandler, false);
document.addEventListener("input", eventsHandler, false);
document.addEventListener("change", eventsHandler, false);

var testArr;
var test;


/*
    Обработчик исходящего сообщения
*/
var lastTarget = null;
function eventsHandler(event)
{
    let currentTarget = event.target;

    //Чтобы для одного элемента обработчик не вызывался несколько раз
    if(lastTarget == currentTarget){
        return;
    }
    else{
        lastTarget = currentTarget;
        //console.log(currentTarget);
    }

    

    //Спустя 200мс разрешаем тому же элементу вызывать обработчик
    setTimeout(()=>{
        lastTarget = null;
    }, 200);

    //Определяем в какой локации находится элемент, вызвавший обработчик
    let homeLocation = null;
    if(currentTarget.closest("#Bedroom")){
        homeLocation = "Bedroom";
    }
    else if(currentTarget.closest("#Hall")){
        homeLocation = "Hall";
    }
    else if(currentTarget.closest("#Bathroom")){
        homeLocation = "Bathroom";
    }
    else if(currentTarget.closest("#Kitchen")){
        homeLocation = "Kitchen";
    }
    else{
        //console.log("Home location not selected!");
    }

    //Если объект, вызвавший обработчик, является ссылкой, то это кнопки редактирования
    if(event.target.tagName == "I" || event.target.tagName == "A"){
        
        //console.log(event.target);
        
        if(event.target.title == "edit"){
            let title =  event.target.parentElement.parentElement.parentElement.children[1].textContent;
            console.log("Edit: " + homeLocation + " - " + title);
        }
        else if(event.target.title == "delete"){
            let title =  event.target.parentElement.parentElement.parentElement.children[1].textContent;
            console.log("Delete: " + homeLocation + " - " + title);
            deleteLocationElementFromDB(homeLocation, title)
        }
        else if(event.target.title == "add"){
            //Добавление
            console.log("Add");
            
            let currentTitle = getCurrentElementByName("title", homeLocation);
            let currentSelect = getCurrentElementByName("selectType", homeLocation);
            let currentPort = getCurrentElementByName("port", homeLocation);

            addNewLocationElementToDB(homeLocation, currentTitle.value, currentSelect.value, currentPort.value);

            currentTitle.value = "";
            currentSelect.value = "";  
        }
        else{
            //console.log("Unhandled title!");
        }

        return;
    }
    
    /*
        Если элемент имеет id, то это системное сообщение, не нужно его отсылать остальным
    */
    //TODO: Переместить button к ссылка, наверх.
    if(currentTarget.id){

        if(currentTarget.type == "checkbox"){
            editMode = !editMode;

            if(editMode){
                setEditMode();
            }
            else{
                unsetEditMode();
            }

            let windowWidht = document.documentElement.clientWidth;

            if(windowWidht >= 760){
                document.getElementById("dropDownToggle").click();
            }
            else{
                document.getElementById("toggleNavBarS").click();
            }
            
            return;
        }  
    }
    else{
        /* 
            Сюда попадают элементы управления, состояние которых, следует передать всем клиентам
        */

        if(currentTarget.name == ""){
            console.log("Name not set");
            return;
        }
    
        let commandsArr = [];
        switch(currentTarget.type){
            case "button":		
                commandsArr.push({
                    "homeLocation": homeLocation,
                    "name": currentTarget.name,
                    "value": currentTarget.innerHTML == "Выключить" ? "off":"on"
                });
                break;
    
            case "range":
                commandsArr.push({
                    "homeLocation": homeLocation,
                    "name": currentTarget.name,
                    "value": currentTarget.value < 5? 0: currentTarget.value
                });
                break;
    
            case "color":
                commandsArr.push({
                    "homeLocation": homeLocation,
                    "name": currentTarget.name,
                    "value": currentTarget.value
                });
                break;
    
            case "checkbox":
                commandsArr.push({
                    "homeLocation": homeLocation,
                    "name": currentTarget.name,
                    "value": currentTarget.value
                });
                break;
   
            default:
                console.log("Not handler: id:" + event.target.id + " targetType: " + event.target.type);
                //console.log(event.target);  
                return;
        }

        commandsArrJSON = JSON.stringify(commandsArr);
        ws.send(commandsArrJSON);

        console.log("Output:");
        console.log(commandsArrJSON);
    }
}

// Возобновляет видимость элементов редактирования
function setEditMode(){
    let elements = document.getElementsByName("editButtons");
    for(let i = 0; i < elements.length; ++i){
        removeClass(elements[i],"d-none");
        addClass(elements[i], "mt-n4");
        addClass(elements[i], "mr-n3");
    }

    elements = document.getElementsByName("addForm");
    for(let i = 0; i < elements.length; ++i){
        removeClass(elements[i],"d-none");
    }
}

// Отменяет видимость элементов редактирования
function unsetEditMode(){
    let elements = document.getElementsByName("editButtons");
    for(let i = 0; i < elements.length; ++i){
        addClass(elements[i],"d-none");
        removeClass(elements[i], "mr-n3");
        removeClass(elements[i], "mr-n3");
    }

    elements = document.getElementsByName("addForm");
    for(let i = 0; i < elements.length; ++i){
        addClass(elements[i],"d-none");
    }
}

//Удаляет заданный элемент из БД
function deleteLocationElementFromDB(homeLocation, title){
    executeAsyncRequest('http://192.168.1.102:88/deleteLocationElement?homeLocation='+ homeLocation + '&title=' + title);
}

//Добавляет новый элемент локации в БД
function addNewLocationElementToDB(homeLocation, title, type, port){
    executeAsyncRequest('http://192.168.1.102:88/addNewLocationElement?homeLocation='+ homeLocation + '&title=' + title + "&type=" + type + "&port=" + port);
}

//Выполняет заданный запрос асинхронно
function executeAsyncRequest(request){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', request, true);
    
    xhr.send();

    xhr.onreadystatechange = function() {
        if(xhr.readyState != 4) return;

        if(xhr.status != 200){
            console.log(xhr.status + ': ' + xhr.statusText);
        }
    }
}

//Возвращает элемент с заданым именем, который находится в той же области, что и элемент вызвавший событие
function getCurrentElementByName(name, homeLocation){
    let arr = document.getElementsByName(name);
    for(let i = 0; i < arr.length; ++i){
        if(arr[i].closest("#" + homeLocation)){
            return arr[i];
        }
    }
}






/************* Визуальная часть *************/

function hasClass(elem, className) {
    return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
}

function addClass(elem, className) {
    if (!hasClass(elem, className)) {
        elem.className += ' ' + className;
    }
}	

function removeClass(elem, className) {
    var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ') + ' ';
    if (hasClass(elem, className)) {
        while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
            newClass = newClass.replace(' ' + className + ' ', ' ');
        }
        elem.className = newClass.replace(/^\s+|\s+$/g, '');
    }
} 

function toggleClass(elem, className) {
    var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ' ) + ' ';
    if (hasClass(elem, className)) {
        while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
            newClass = newClass.replace( ' ' + className + ' ' , ' ' );
        }
        elem.className = newClass.replace(/^\s+|\s+$/g, '');
    } else {
        elem.className += ' ' + className;
    }
}

function buttonToggle(button, buttonMode){
    if(buttonMode == "off"){
        removeClass(button, "btn-danger");
        addClass(button, "btn-success");
        button.innerHTML = "Включить";
    } else{
        removeClass(button, "btn-success");
        addClass(button, "btn-danger");
        button.innerHTML = "Выключить";
    }
}

