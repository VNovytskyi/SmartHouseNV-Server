console.log("Launching...");

var portD = 0x00;

//------------------------- NRF часть -------------------------

SPI1.setup({sck: NodeMCU.D5, miso: NodeMCU.D6, mosi: NodeMCU.D7});

//TODO: добавить IRQ пин
const nrf = require("NRF24L01P").connect( SPI1, NodeMCU.D8, NodeMCU.D2);

function InitNRF() {
  //rx tx
  nrf.init(['2', 'N', 'o', 'd', 'e'], ['1', 'N', 'o', 'd', 'e']);
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
      let data = nrf.getData();
      console.log(data);
    }
  }, 50);

  console.log("NRF Ready");
}

InitNRF();


//nrf.sendString([0x01, 0x01]);
//nrf.send([0x01, 0x02]);






//------------------------- Серверная часть -------------------------

const wifi = require("Wifi");

//Массив клиентов
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
    broadcast(message);

    let arrMessage = JSON.parse(message);

    arrMessage.forEach(element => {
      switch(element.name)
      {
        case "buildInLed":
          if(element.value == "off"){
             nrf.send([0x01, 0x02]);
             portD &= ~(1 << 0);
          }
          else{
            nrf.send([0x01, 0x01]);
            portD |= (1 << 0);
          }

        break;

        default: console.log("Input message name error: " + element.name);
      }
    });
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
  Отправляет новому клиенту текущее состояние системы (вводит его в курс дела)
*/
function bringUpToDate(ws)
{
  let commandsArr = [];

  commandsArr.push({
    name: "buildInLed",
	value: portD & (1 << 0)? "on": "off"
  });

  ws.send(JSON.stringify(commandsArr));
}

/*
  Подключение к точке доступа
*/
wifi.connect("MERCUSYS_7EBA", {password: "3105vlad3010vlada"}, err => {
  if (err !== null) {
    throw err;
  }

  wifi.getIP((err, info) => {
    if (err !== null) {
      throw err;
    }else {
      startServer();
      console.log("Server Ready");
      console.log("Launch completed");
    }
  });
});