console.log("Launching...");


//------------------------- Storage часть -------------------------

const storage = require("Storage");

//TODO: Создать класс для каждой локации дома (localHub)
// 16и разрядное число
var portA = 0;

// Массив значений порта B
var portB = [0, 0, 0, 0, 0, 0];

var currentCommand;
var currentMessage;

//------------------------- NRF часть -------------------------

SPI1.setup({sck: NodeMCU.D5, miso: NodeMCU.D6, mosi: NodeMCU.D7});

const nrf = require("NRF24L01P").connect( SPI1, NodeMCU.D8, NodeMCU.D1);

function nrfGetMessage(data){
  let dataLength = data[0];
  let arr = [];

  for(let i = 1; i < dataLength + 1; ++i)
    arr.push(data[i]);

  return arr;
}

function InitNRF() {
  //rx, tx
  nrf.init([1, 1, 1, 1, 1], [2, 1, 1, 1, 1]);
  nrf.setReg(0x01, 0x3F);
  nrf.setReg(0x02, 0x03);
  nrf.setReg(0x03, 0x03);
  nrf.setReg(0x04, 0x5F);
  nrf.setChannel(0x60);
  nrf.setReg(0x06, 0x27);
  nrf.setReg(0x1C, 0x3F);
  nrf.setReg(0x1D, 0x06);

  setInterval(function() {
    while (nrf.getDataPipe() !== undefined) {
      let dataPipe = nrf.getDataPipe();
      let data = nrf.getData();

      let msg = nrfGetMessage(data);
      //console.log(dataPipe + ": " + msg);

      if(currentCommand.toString() == msg.toString()){
        broadcast(currentMessage);
      }else{
        console.log("[ ERROR ] Received command did not match with transmitted!");
        console.log(currentCommand + " | " + msg);
      }
    }
  }, 50);

  console.log("NRF Ready");
}

InitNRF();


// BuildInLed off: nrf.send([0x01, 0x02]);
// BuildInLed on: nrf.send([0x01, 0x01]);

//P0
//nrf.send([0x03, 0x23, 0xff, 0xff]);
//nrf.send([0x01, 0x24]);

//P1
//nrf.send([0x03, 0x25, 0xff, 0xff]);
//nrf.send([0x01, 0x26]);

//P2
//nrf.send([0x03, 0x27, 0xff, 0xff]);
//nrf.send([0x01, 0x28]);




//------------------------- Серверная часть -------------------------

const wifi = require("Wifi");

//Массив клиентов
//TODO: выяснить не встроен ли этот массив
var clients = [];

//Счетчик клиентов. Для ограничения к-ва подлюченных клиентов
var clientsCounter = 0;


/*
  Обработчик web-socket'a
*/
function wsHandler(ws)
{
  clients.push(ws);

  ws.on('message', message => {
    //TODO:установить доступный интервал ответа
    currentMessage = message;

    let arrMessage = JSON.parse(message);

    console.log(arrMessage);

    for(let i = 0; i < arrMessage.length; ++i){

      //Не работает
      if(arrMessage[i].name == "homeLocation" && arrMessage[i].value == "bedroom"){
        console.log("Set home location: bedroom");
        continue;
      }

      let port = arrMessage[i].name[0];
      let pin = Number(arrMessage[i].name.slice(1));
      let cmd = 0x00;

      switch(port){
        case 'A':
          cmd = 3 + 2 * pin;

          if(arrMessage[i].value == "off"){
             ++cmd;
             portA &= ~(1 << pin);
          }
          else{
             portA |= (1 << pin);
          }

          nrf.send([0x01, cmd]);
          currentCommand = cmd;
          break;

        case 'B':
          cmd = 0x23 + 0x02 * pin;

          if(arrMessage[i].value == 0){
            nrf.send([0x01, ++cmd]);
            currentCommand = cmd;
             portB[pin] = 0;
          }
          else{
            let value = arrMessage[i].value * 655;
            portB[pin] = arrMessage[i].value;
            nrf.send([0x03, cmd, value >> 8, value & 0xFF]);
            currentCommand = [cmd, value >> 8, value & 0xFF];
          }
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
    console.log("Free memory: " + process.memory().free);
  });

  ws.on('error', event => {
    console.log(event);
  });

  bringUpToDate(ws);

  console.log("Free memory: " + process.memory().free);
}

/*
  Обработчик http-сервера
*/
function httpServerHandler(req, res)
{
  res.writeHead(200, {'Content-Type': 'text/html'});

  let urlObj = url.parse(req.url, true);

  switch(urlObj.pathname)
  {
    case "/":
    case "/home":
      //TODO: Загрузить новую страницу
      //res.end(storage.read("MainPage"));
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

/*
  Отсылает всем подключенным пользователям сообщение
*/
function broadcast(msg) {
  clients.forEach(cl => cl.send(msg));
}

/*
  Запуск http-сервера и web-socket'а
*/
function startServer()
{
  const s = require('ws').createServer(httpServerHandler);
  s.on('websocket', wsHandler);
  s.listen(80);
}

/*
  Отправляет новому клиенту текущее состояние системы
*/
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

/*
  Подключение к точке доступа
*/
console.log("Connecting to access point...");
wifi.connect("MERCUSYS_7EBA", {password: "3105vlad3010vlada"}, err => {
  if (err !== null) {
    throw err;
  }

  wifi.getIP((err, info) => {
    if (err !== null) {
      throw err;
    }else {
      console.log("Connecting to access point successfully");
      startServer();
      console.log("Server Ready");
      console.log("Launch completed");

      setInterval(()=>{
       D2.toggle();
      }, 1000);
    }
  });
});