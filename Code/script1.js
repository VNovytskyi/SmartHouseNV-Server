var wifi = require("Wifi");
var http = require("http");

var counter = 0;

wifi.connect("MERCUSYS_7EBA", {password:"3105vlad3010vlada"}, function(err){
  if(err != null){
    console.log("Wifi connect error: " + err);
  }
  else{
    console.log("WiFi connected. IP: " + wifi.getIP().ip);

    http.createServer(function(req, res){
      console.log(++counter + " " + req.url);

      var re = /([a-z0-9]+=[a-z0-9]+)/g;
      var found = req.url.match(re);

      //re = /.+(?=\?)/; //Не поддерживается в этой версии
      re = /.+\?/;
      var request = req.url.match(re);
      request = request[0].substring(0, request[0].length - 1);

      console.log("Request: " + request);
      console.log("Found: " + found);

      switch(req.url){
        case "/":
        case "/home":
          res.writeHead(200,{'Content-Type': 'text/html'});
          res.end("Home Page");
          break;

        case "/settings":
          res.writeHead(200,{'Content-Type': 'text/html'});
          res.end("Settings Page");
          break;

        case "/set":
          res.writeHead(200,{'Content-Type': 'text/html'});
          res.end("set");
          break;

        default:
          res.writeHead(404,{'Content-Type': 'text/html'});
          res.end("404");
          break;
      }

    }).listen(80);
  }
});