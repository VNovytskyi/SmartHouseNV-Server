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

  ws.on('message', message => {
    broadcast(message);

    message = JSON.parse(message);
    console.log(message);

    switch(message.name)
    {
      case "buildInLed":
        digitalWrite(buildInLed, message.mode != "on");
        break;
    }
  });

  ws.on('close', evt => {
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
      res.end(storage.read("MainPage"));
      break;

    case "/settings":
      res.end("Settings Page");
      break;



    case "/socket":
        res.end(`<html>
<head>
<meta harset="UTF-8">
</head>
<body>
  <p>Led status: <span id="ledStatus"></span></p>
  <div id="buildInLed">
    <button>on</button>
    <button>off</button>
  </div>
</body>
<script>
var ws = new WebSocket('ws://' + location.host, 'protocolOne');
var ledStatus = document.getElementById('ledStatus');

ws.onopen = (event) => {
  console.log("Open");
}

ws.onerror = (event) => {
  console.log(event);
}

ws.onmessage = evt => {

//TODO: switch по сообщениям

   let a = JSON.parse(evt.data);
   ledStatus.innerText = a.mode;
};

document.body.onclick = (event) => {


			let button = event.target;
			let container = event.target.closest("div");

			if(event.target.type == "button" || event.target.type == "submit")
			{
				let command = {
					name: container.id,
                    mode: button.innerHTML
				};

				commandJSON = JSON.stringify(command);
				console.log(commandJSON);
				ws.send(commandJSON);
			}else{
				console.log("Unknown element");
			}
		}
</script>
</html>`);
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
      print("http://" + info.ip + "/socket");
      startServer();
    }
  });
});
