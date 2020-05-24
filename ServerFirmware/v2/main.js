console.log(" ");
console.log("*********************** Launching ************************");

let fs = require("Storage");



function httpHandler(req, res) {
  let url = req.url;

  switch(url){
    case "/":
    case "/home":
      res.writeHead(200);
      res.end("Hello World");
    break;

    case "/weather":
      res.write(fs.read("a"));
      res.end();
      break;

    default:
      res.writeHead(404);
      res.end();
    break;
  }

  console.log("[ INFO ] New request on server -> " + url);
}

require("http").createServer(httpHandler).listen(80);


const wifi = require("Wifi");
console.log("[ INFO ] Connecting to access point...");
if(typeof wifi !== 'undefined'){

  wifi.connect("MERCUSYS_7EBA", {password: "3105vlad3010vlada"}, err => {

    if (err !== null) {
      throw err;
    }

    wifi.getIP((err, data) => {
      if (err !== null) {
        throw err;
      }
      else{
        console.log("[ OK ] Connecting to access point successfully.");
        console.log("[ INFO ] IP: " + data.ip);


        //Main


        console.log("[ INFO ] Free memory: " + process.memory().free + " / " + process.memory().total);

        console.log("******************** Launch completed ********************");
        console.log(" ");
      }
    });
  });
}
else{
  console.log("[ ERROR ] Wifi module no program involve.");
}