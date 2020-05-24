
this.clients = [];

exports.init = function(){
    console.log("[ INFO ] Init server");
    return this;
}

exports.addServer = function(server){
    console.log("[ INFO ] Init webSocket server");
    this.server = server;
    this.server.on('websocket', webSocketHandler);
    this.server.listen(80);
}

exports.getServer = function(){
    return this.server;
}

exports.httpHandler = function(req, res){
    res.writeHead(200, {'Content-Type': 'text/html'});

    let urlObj = url.parse(req.url, true);

    switch(urlObj.pathname)
    {
        case "/":
        case "/home":
        res.end("Home Page");
        break;

        case "/settings":
        res.end("Settings Page");
        break;

        default:
        res.end("404");
        break;
    }
}


function webSocketHandler(ws){
    clients.push(ws);

    ws.on('message', message => {
        console.log("[ INFO ] New webSocket message:");
        console.log(message);
        
        currentMessage = message;
        let arrMessage = JSON.parse(message);

        for(let i = 0; i < arrMessage.length; ++i){
            let port = arrMessage[i].name[0];
            let pin = Number(arrMessage[i].name.slice(1));
            let cmd = 0x00;
    
            switch(port){
                case 'A':
                    cmd = 3 + 2 * pin;
        
                    if(arrMessage[i].value == "off"){
                        ++cmd;
                        //portA &= ~(1 << pin);
                    }
                    else{
                        //portA |= (1 << pin);
                    }
        
                    if(typeof nrf !== 'undefined'){
                        nrf.send([0x01, cmd]);
                    }
                    
                    currentCommand = cmd;
                    break;
        
                case 'B':
                    cmd = 0x23 + 0x02 * pin;
        
                    if(arrMessage[i].value == 0){
                        if(typeof nrf !== 'undefined'){
                            nrf.send([0x01, ++cmd]);
                        }

                        currentCommand = cmd;
                        //portB[pin] = 0;
                    }
                    else{
                    let value = arrMessage[i].value * 655;
                    //portB[pin] = arrMessage[i].value;
                    
                    if(typeof nrf !== 'undefined'){
                        nrf.send([0x03, cmd, value >> 8, value & 0xFF]);
                    }

                    currentCommand = [cmd, value >> 8, value & 0xFF];
                    }
                    break;
        
                case 'C':
                    let red = parseInt("0x" + arrMessage[i].value[1] + arrMessage[i].value[2]) * 257;
                    let green = parseInt("0x" + arrMessage[i].value[3] + arrMessage[i].value[4]) * 257;
                    let blue = parseInt("0x" + arrMessage[i].value[5] + arrMessage[i].value[6]) * 257;  
                    
                    let cmdArr = [];    
                    
                    if(red < 1000){
                        cmdArr.push(0x24);
                    }
                    else{
                        cmdArr.push(0x23, red >> 8, red & 0xFF);
                    }   
                    
                    if(green < 1000){
                        cmdArr.push(0x26);
                    }
                    else{
                        cmdArr.push(0x25, green >> 8, green & 0xFF);
                    }   
                    
                    if(blue < 1000){
                        cmdArr.push(0x28);
                    }
                    else{
                        cmdArr.push(0x27, blue >> 8, blue & 0xFF);
                    }   
                    
                    cmdArr.unshift(cmdArr.length); 
                    
                    if(typeof nrf !== 'undefined'){
                        nrf.send(cmdArr);
                    }

                    cmdArr.shift();
                    currentCommand = cmdArr;
                break;
        
                default:
                    console.log("Input message name error: " + arrMessage[i].name + " -> " + arrMessage[i].value);
            }
        }
    });

    ws.on('close', evt => {
        let x = clients.indexOf(ws);
        
        if (x > -1) {
            clients.splice(x, 1);
        }
        
        console.log("[ INFO ] Client left. Memory: " + process.memory().free + " / " + process.memory().total);
    });

    ws.on('error', event => {
        console.log("[ ERROR ] WebSocket error:");
        console.log(event);
    });

    bringUpToDate(ws);
    
    console.log("[ INFO ] New webSocket client. Memory: " + process.memory().free + " / " + process.memory().total);
}



/*
  Отсылает всем подключенным пользователям сообщение
*/
function broadcast(msg) {
  clients.forEach(cl => cl.send(msg));
}





/*
  Отправляет новому клиенту текущее состояние системы
*/
//TODO: обновить при переходе на файловую систему
function bringUpToDate(ws)
{
  let commandsArr = [];

  for(let i = 0; i < 16; ++i){
    commandsArr.push({
      name: "A" + i,
      value: portA & (1 << i)? "on": "off"
    });
  }

  for(let i = 0; i < 6; ++i){
    commandsArr.push({
      name: "B" + i,
      value: portB[i]
    });
  }

  ws.send(JSON.stringify(commandsArr));
}
