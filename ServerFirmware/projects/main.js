console.log(" ");
console.log("*********************** Launching ************************");


var currentCommand = null;
var currentMessage;


//var myStorage = require("Storage_Part");
//var myWeather = require("Weather_Part");


/* Servers */
var myWsServer = require("WebSocket_Part").init();
var server = require('ws').createServer(myWsServer.httpHandler);
myWsServer.addServer(server);


/* NRF */
SPI1.setup({sck: D18, mosi: D23, miso: D19});
var nrf = require("NRF24L01P").connect(SPI1, D5, D17);
var myNRF = require("NRF_Part").init(nrf);








/*
  Подключение к точке доступа
*/
const wifi = require("Wifi");
console.log("[ INFO ] Connecting to access point...");
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


      /* Check NRF */
      if(typeof myNRF !== 'undefined'){
        if(myNRF != null){
          console.log("[ OK ] NRF module.");
          myNRF.init();
          myNRF.startHandler();
          console.log("[ OK ] NRF handler started");
        }
        else{
          console.log("[ ERROR ] NRF module not connected or not work.");
        }
      }
      else{
        console.log("[ WARNING ] NRF module no program involved. (myNRF == undefined).");
      }

      /* Check Servers */
      if(typeof myWsServer == 'undefined' || typeof server == 'undefined'){
        console.log("[ ERROR ] WebSocket not running: myWsServer or server undefined.");
      }
      else if(typeof myWsServer.getServer() == 'undefined'){
        console.log("[ ERROR ] WebSocket not running: not available servers to WebSocket.");
      }
      else{
        console.log("[ OK ] HTTP and WebSocket servers running");
      }


      console.log("******************** Launch completed ********************");
      console.log(" ");
    }
  });
});