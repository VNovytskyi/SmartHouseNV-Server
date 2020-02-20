const wifi = require("Wifi");
const storage = require("Storage");
const WebSocket = require("ws");

const buildInLed = D2;

const WIFI_NAME = "MERCUSYS_7EBA";
const WIFI_OPTIONS = {
  password: "3105vlad3010vlada"
};

var counter = 0;
var clients = [];

function wsHandler(ws)
{
  clients.push(ws);

  ws.on('message', msg => {
    //TODO: switch по командам
    /*case "/set":
      res.writeHead(200,{'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});

      if(urlObj.query)
        for(var key in urlObj.query){
          console.log(key + " " + urlObj.query[key]);

          switch(key)
          {
            case "buildInLed":
              digitalWrite(buildInLed, urlObj.query[key] == "on" ? 0:1);
              break;
          }
        }

      res.end("set");
      break;*/
    digitalWrite(D2, msg == 'on');
    broadcast(msg);
  });

  ws.on('close', evt => {
    var x = clients.indexOf(ws);
    if (x > -1) {
      clients.splice(x, 1);
    }
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
      res.writeHead(200,{'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
      res.end(storage.read("MainPage"));
      break;

    case "/settings":
      res.writeHead(200,{'Content-Type': 'text/html'});
      res.end("Settings Page");
      break;



    case "/socket":
        res.writeHead(200,{'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
        res.end(`<html>
<head>
<script>
window.onload = () => {
  var ws = new WebSocket('ws://' + location.host, 'protocolOne');
  var btn = document.getElementById('btn');
  var led = document.getElementById('led');
  ws.onmessage = evt => {
    btn.innerText = evt.data;
  };
  led.onchange = evt => {
    ws.send(led.value);
  };
};
</script>
</head>
<body>
  <p>Led status: <span id="btn">up</span></p>
  <p>
    LED:
    <select id="led">
      <option>off</option><option>on</option>
    </select>
  </p>
</body>
</html>`);
    break;

    default:
      res.writeHead(404);
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
      print("http://"+info.ip);
      startServer();
    }
  });
});
