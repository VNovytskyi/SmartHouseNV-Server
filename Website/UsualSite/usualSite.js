//var ws = new WebSocket('ws://192.168.1.106', 'protocolOne');
var ws = new WebSocket('ws://192.168.1.102:80', 'protocolOne');

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


document.addEventListener("click", eventsHandler, false);
document.addEventListener("input", eventsHandler, false);
document.addEventListener("change", eventsHandler, false);


/*
    Обработчик исходящего сообщения
*/

var currentTarget;
function eventsHandler(event)
{
    currentTarget = event.target;
    let homeLocation = null;

    //TODO: Массив локаций дома, который будет получен при bringUpToDate
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