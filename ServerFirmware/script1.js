var wifi = require("Wifi");
var http = require("http");
var ws = require("ws");
var storage = require("Storage");

//196 608 bytes
console.log("Available storage bytes: " + storage.getFree());
console.log(require("Flash").getFree());

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

        default:
          res.writeHead(404);
          res.end("404");
          break;
      }

    }).listen(80);
  }
});