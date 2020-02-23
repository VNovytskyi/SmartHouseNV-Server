const wifi = require("Wifi");
const storage = require("Storage");
const WebSocket = require("ws");

/*
  NodeMCU ESPRUINO
    D0      D16
    D1      D5
    D4      D2

*/

const buildInLed = D2;
const lamp = D16;
const vent = D5;

const WIFI_NAME = "MERCUSYS_7EBA";
const WIFI_OPTIONS = {
  password: "3105vlad3010vlada"
};

var counter = 0;
var clients = [];

function wsHandler(ws)
{
  clients.push(ws);

  console.log("New client");

  //TODO: отправить новому клиенту состояние всех 'ножек' (ввести его в курс дела)

  ws.on('message', message => {
    broadcast(message);

    let arrMessage = JSON.parse(message);
    console.log(arrMessage);

    arrMessage.forEach(element => {
      switch(element.name)
      {
        case "buildInLed": digitalWrite(buildInLed, element.value != "on"); break;
        case "lamp": digitalWrite(lamp, element.value == "on"); break;

        case "myRange":
          let value = element.value / 100.0;
          console.log(value);

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
    console.log("Disconnect client");
    var x = clients.indexOf(ws);
    if (x > -1) {
      clients.splice(x, 1);
    }
  });

  ws.on('error', event => {
    console.log(event);
  });
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
