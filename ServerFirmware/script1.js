var wifi = require("Wifi");
var http = require("http");



const buildInLed = D2;

var counter = 0;

wifi.connect("MERCUSYS_7EBA", {password:"3105vlad3010vlada"}, function(err){
  if(err != null){
    console.log("Wifi connect error: " + err);
  }
  else{
    console.log("WiFi connected. IP: " + wifi.getIP().ip);

    http.createServer(function(req, res){
      console.log(" ");
      console.log("################## " + ++counter + " ##################");

      var urlObj = url.parse(req.url, true);

      switch(urlObj.pathname){
        case "/":
        case "/home":
          res.writeHead(200,{'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
          res.end("<!DOCTYPE html><html lang=\"en\"><head> <meta charset=\"UTF-8\"> <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"> <title>Document</title></head><body> <p>Server</p> <p> <button onclick=\"sendCommand('buildInLed=on')\">ON</button> <button onclick=\"sendCommand('buildInLed=off')\">OFF</button> </p></body></html><script> function sendCommand(command) { var xhr = new XMLHttpRequest(); xhr.open('GET', 'http://192.168.1.106/set?' + command, true); xhr.send(); xhr.onreadystatechange = function() { if (xhr.readyState != 4) return; if (xhr.status != 200) { console.log(xhr.status + ': ' + xhr.statusText); } else { console.log(xhr.responseText); } } }</script>");
          break;

        case "/settings":
          res.writeHead(200,{'Content-Type': 'text/html'});
          res.end("Settings Page");
          break;

        case "/set":
          res.writeHead(200,{'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});

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

        default:
          res.writeHead(404);
          res.end("404");
          break;
      }

    }).listen(80);
  }
});