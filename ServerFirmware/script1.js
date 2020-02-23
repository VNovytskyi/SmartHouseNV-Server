const wifi = require("Wifi");
const storage = require("Storage");
const WebSocket = require("ws");


/*
  NodeMCU ESPRUINO
    D0      D16
    D1      D5
    D4      D2

*/

//----------------------------------------------------------
class MyPin{
  constructor(pin, reverse){
    this.pin = pin;
    this.reverse = reverse;
    this.off();
  }

  on(){
    if(this.reverse)
      this.pin.reset();
    else
      this.pin.set();

    this.state = "on";
  }

  off(){
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
      this.off();
    else
      this.on();
  }
}

const buildInLed = new MyPin(D2, true);
const lamp = new MyPin(D16);
const vent = new MyPin(D5);


//----------------------------------------------------------

const WIFI_NAME = "MERCUSYS_7EBA";
const WIFI_OPTIONS = {
  password: "3105vlad3010vlada"
};

var counter = 0;
var clients = [];

function wsHandler(ws)
{
  clients.push(ws);

  //console.log("New client");

  ws.on('message', message => {
    broadcast(message);

    let arrMessage = JSON.parse(message);
    //console.log(arrMessage);

    arrMessage.forEach(element => {
      switch(element.name)
      {
        case "buildInLed": buildInLed.setState(element.value); break;
        case "lamp":  lamp.setState(element.value); break;

        case "myRange":
          let value = element.value / 100.0;

          if(value < 0.1)
            value = 0;
          if(value > 0.9)
            value = 1;

          analogWrite(vent, value);

          break;

        default: console.log("Input message name error: " + element.name);
      }
    });
  });

  ws.on('close', evt => {
    //console.log("Disconnect client");
    var x = clients.indexOf(ws);
    if (x > -1) {
      clients.splice(x, 1);
    }
  });

  ws.on('error', event => {
    console.log(event);
  });

  //TODO: отправить новому клиенту состояние всех 'ножек' (ввести его в курс дела)
  bringUpToDate(ws);
}

function serverHandler(req, res)
{
  console.log(" ");
  console.log("################## " + ++counter + " ##################");

  res.writeHead(200, {'Content-Type': 'text/html'});

  const urlObj = url.parse(req.url, true);
  console.log(urlObj.pathname);

  switch(urlObj.pathname)
  {
    case "/":
    case "/home":
      //TODO: залить новый файл
      res.end(storage.read("MainPage"));
      break;

    case "/settings":
      res.end("Settings Page");
      break;

    default:
      res.end("404");
      break;
  }
}

function broadcast(msg) {
  clients.forEach(cl => cl.send(msg));
}

function startServer()
{
  const s = require('ws').createServer(serverHandler);
  s.on('websocket', wsHandler);
  s.listen(80);
}

function bringUpToDate(ws)
{
  let commandsArr = [];

  commandsArr.push({
    name: "buildInLed",
	value: buildInLed.getState()
  });

  commandsArr.push({
    name: "lamp",
	value: lamp.getState()
  });

  //TODO: Send range value

  let commandsArrJSON = JSON.stringify(commandsArr);
  //console.log("Send bringUpToDate: " + commandsArrJSON);
  ws.send(commandsArrJSON);
}

wifi.connect(WIFI_NAME, WIFI_OPTIONS, err => {
  if (err !== null) {
    throw err;
  }

  wifi.getIP((err, info) => {
    if (err !== null) {
      throw err;
    }else {
      print("http://" + info.ip);
      startServer();
    }
  });
});
