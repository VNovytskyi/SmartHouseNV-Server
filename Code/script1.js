var wifi = require("Wifi");
var http = require("http");

const buildInLed = D2;

var counter = 0;

setInterval(function() {
   buildInLed.toggle();
}, 1000);

wifi.connect("MERCUSYS_7EBA", {password:"3105vlad3010vlada"}, function(err){
  if(err != null){
    console.log("Wifi connect error: " + err);
  }
  else{
    console.log("WiFi connected. IP: " + wifi.getIP().ip);

    http.createServer(function(req, res){
      console.log(" ");
      console.log("################## " + ++counter + " ##################");

      var request = req.url.match(/.+\?/); //re = /.+(?=\?)/; //Не поддерживается в этой версии

      if(request){
        request = request[0].substring(0, request[0].length - 1);

        if(request[request.length-1] == '/')
          request = request.substring(0, request.length - 1);
      }else{
        request = req.url;
      }

      console.log("Request: " + request);

      switch(request){
        case "/":
        case "/home":
          res.writeHead(200,{'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
          res.end("Home Page");
          break;

        case "/settings":
          res.writeHead(200,{'Content-Type': 'text/html'});
          res.end("Settings Page");
          break;

        case "/set":
          res.writeHead(200,{'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});

          var commands = req.url.match(/([a-z0-9]+=[a-z0-9]+)/g);

          if(commands.length){
            //commands[0] - string
            //
            //TODO: Обеспечить выполнение команд из строки
            console.log("Commands: " + commands);
            res.end("Command: " + commands);
          }else{
            console.log("Empty command");
            res.end("Empty command");
          }
          break;

        default:
          res.writeHead(404);
          res.end("404");
          break;
      }

    }).listen(80);
  }
});