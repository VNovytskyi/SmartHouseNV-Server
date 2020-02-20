const wifi = require("Wifi");
const storage = require("Storage");
const WebSocket = require("ws");

const buildInLed = D2;
var counter = 0;
var clients = [];


wifi.connect("MERCUSYS_7EBA", {password:"3105vlad3010vlada"}, function(err){
  if(err != null){
    console.log("Wifi connect error: " + err);
  }else {
    console.log("http://" + wifi.getIP().ip);

    WebSocket.createServer(function(req, res){
      console.log(" ");
      console.log("################## " + ++counter + " ##################");

      var urlObj = url.parse(req.url, true);

      switch(urlObj.pathname){
        case "/":
        case "/home":
          res.writeHead(200,{'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
          res.end(storage.read("MainPage"));
          break;

        case "/settings":
          res.writeHead(200,{'Content-Type': 'text/html'});
          res.end("Settings Page");
          break;

        case "/set":
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
          break;

        case "/socket":
            res.writeHead(200,{'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
            res.end(`<html>
<head>
<script>
window.onload = () => {
  var ws = new WebSocket('ws://' + 192.168.1.106, 'protocolOne');
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
  <p>Button: <span id="btn">up</span></p>
  <p>
    LED on:
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

    }).listen(80);

    WebSocket.on("websocket", ws => {
      console.log("new client");
      clients.push(ws);

      ws.on('message', msg => {
        digitalWrite(buildInLed, msg == 'on');
        console.log("msg: " + msg);
      });

      ws.on('close', evt => {
        var x = clients.indexOf(ws);

        if (x > -1) {
          clients.splice(x, 1);
        }
      });
    });
  }
});