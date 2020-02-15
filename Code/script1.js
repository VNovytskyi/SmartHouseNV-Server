console.log("Start");

var wifi = require("Wifi");
var http = require("http");

wifi.connect("MERCUSYS_7EBA", {password:"3105vlad3010vlada"}, function(err){
  if(err != null){
    console.log("Wifi connect error: " + err);
  } 
  else{
    console.log(wifi.getIP());
    console.log(wifi.getStatus());
    
    http.createServer(function(req, res){
      console.log(req);
      res.writeHead(200);
      res.end("Hello world");
    }).listen(80);
  }
});

console.log("End");