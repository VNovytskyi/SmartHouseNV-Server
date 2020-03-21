const wifi = require("Wifi");

//----------------------------------------------------------
class MyPin{
  constructor(pin, reverse){
    this.pin = pin;
    this.reverse = reverse;
    this.low();
  }

  high(){
    if(this.reverse)
      this.pin.reset();
    else
      this.pin.set();

    this.state = "on";
  }

  low(){
    if(this.reverse)
      this.pin.set();
    else
      this.pin.reset();

    this.state = "off";
  }

  getState(){
    return this.state;
  }

  setState(state){
    this.state = state;
    if(state == "off")
      this.low();
    else
      this.high();
  }
}

const buildInLed = new MyPin(D2, true); // D2 = NodeMCU.D4

//------------------------- NRF часть -------------------------








//------------------------- Серверная часть -------------------------


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
        case "buildInLed": buildInLed.setState(element.value); break;

        default: console.log("Input message name error: " + element.name);
      }
    });
  });

  ws.on('close', evt => {
    let x = clients.indexOf(ws);
    if (x > -1) {
      clients.splice(x, 1);
    }
  });

  ws.on('error', event => {
    console.log(event);
  });

  bringUpToDate(ws);
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
	value: buildInLed.getState()
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
      console.log("Server Ready!");
      startServer();
    }
  });
});


console.log(process.memory());
