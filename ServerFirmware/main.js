console.log("Launching...");

var portA = 0x00;

//------------------------- NRF часть -------------------------

SPI1.setup({sck: NodeMCU.D5, miso: NodeMCU.D6, mosi: NodeMCU.D7});

//TODO: добавить IRQ пин
const nrf = require("NRF24L01P").connect( SPI1, NodeMCU.D8, NodeMCU.D1);

function InitNRF() {
  //rx tx
  nrf.init([0, 'N', 'o', 'd', 'e'], [1, 'N', 'o', 'd', 'e']);
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
      console.log(dataPipe + ": " + data);
    }
  }, 50);

/*
  pinMode(D0, 'input');
  setWatch(()=>{
    let dataPipe = nrf.getDataPipe();
    let data = nrf.getData();
    console.log(dataPipe + ": " + data);

  }, D0, {repeat:true, edge: 'falling'});
*/
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
      let port = element.name[0];
      let pin = Number(element.name.slice(1));
      let cmd = 0x00;
      switch(port){
        case 'A':
          cmd = 3 + 2 * pin;

          if(element.value == "off"){
             ++cmd;
             portA &= ~(1 << pin);
          }
          else{
             portA |= (1 << pin);
          }

          nrf.send([0x01, cmd]);
          break;

        case 'B':
          cmd = 0x23 + 0x02 * pin;

          if(element.value == 0){
            nrf.send([0x01, ++cmd]);
          }
          else{
            let value = element.value * 655;
            nrf.send([0x03, cmd, value >> 8, value & 0b0000000011111111]);
            console.log(cmd + ", " + (value >> 8) + ", " + value & 0b0000000011111111);
          }
          break;

        default:
          console.log("Input message name error: " + element.name + " -> " + element.value);
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
  Отправляет новому клиенту текущее состояние системы (вводит его в курс дела)
*/
function bringUpToDate(ws)
{
  let commandsArr = [];

  for(let i = 0; i < 16; ++i){
    let str = "A";

    commandsArr.push({
      name: str + i,
      value: portA & (1 << 0)? "on": "off"
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