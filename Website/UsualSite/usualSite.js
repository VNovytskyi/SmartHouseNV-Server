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

/*
    Обработчик исходящего сообщения
*/
var lastTarget = null;
function eventsHandler(event)
{
    let currentTarget = event.target;
    let homeLocation = null;    

    if(lastTarget == currentTarget){
        return;
    }

    setTimeout(()=>{
        lastTarget = null
        console.log("Cleat lastTarget");
    }, 200);

    lastTarget = currentTarget;

    if(currentTarget.closest("#Bedroom")){
        homeLocation = "Bedroom";
    }

    if(currentTarget.closest("#Hall")){
        homeLocation = "Hall";
    }

    if(currentTarget.closest("#Bathroom")){
        homeLocation = "Bathroom";
    }

    if(currentTarget.closest("#Kitchen")){
        homeLocation = "Kitchen";
    }
    
    //Если элемент имеет id, то это системное сообщение, не нужно его отсылать остальным
    if(currentTarget.id || currentTarget.name == "addButton"){

        if(currentTarget.type == "checkbox"){
            editMode = !editMode;

            if(editMode){
                setEditMode();
            }
            else{
                unsetEditMode();
            }
        }  
        
        if(currentTarget.type == "button"){
            testArr = document.getElementsByName("title");
            let currentTitle;
            testArr.forEach(el => {
                if(el.closest("#" + homeLocation)){
                    currentTitle = el;
                }
            })


            testArr = document.getElementsByName("selectType");
            let currentSelect;
            testArr.forEach(el => {
                if(el.closest("#" + homeLocation)){
                    currentSelect = el;
                }
            })

            testArr = document.getElementsByName("port");
            let currentPort;
            testArr.forEach(el => {
                if(el.closest("#" + homeLocation)){
                    currentPort = el;
                }
            })
            
            console.log(homeLocation + " - " + currentTitle + " - " + currentSelect.value);

            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://192.168.1.102:88/addNewLocationElement?homeLocation='+ homeLocation + '&title=' + currentTitle.value + "&type=" + currentSelect.value + "&port=" + currentPort.value, false);
            xhr.send();
            if (xhr.status != 200) {
                alert( xhr.status + ': ' + xhr.statusText ); 
            } 
            else{
                console.log( xhr.responseText );
            }

            currentTitle.value = "";
            currentSelect.value = "";

            
        }
    }
    else{
        
    
    
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
                console.log("Not handler: " + event.target + " - " + event.target.type);
        }
    
        if(commandsArr.length > 0){
            commandsArrJSON = JSON.stringify(commandsArr);
    
            console.log("Output:");
            console.log(commandsArrJSON);
            ws.send(commandsArrJSON);
        }
    }
}


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

