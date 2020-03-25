console.log("Launching...");


//------------------------- Storage часть -------------------------

const storage = require("Storage");

//TODO: Создать класс для каждой локации дома (localHub)
// 16и разрядное число
var portA = 0;

// Массив значений порта B
var portB = [0, 0, 0, 0, 0, 0];

var currentCommand;
var currentMessage;

//------------------------- NRF часть -------------------------

SPI1.setup({sck: NodeMCU.D5, miso: NodeMCU.D6, mosi: NodeMCU.D7});

const nrf = require("NRF24L01P").connect( SPI1, NodeMCU.D8, NodeMCU.D1);

function nrfGetMessage(data){
  let dataLength = data[0];
  let arr = [];

  for(let i = 1; i < dataLength + 1; ++i)
    arr.push(data[i]);

  return arr;
}

function InitNRF() {
  //rx, tx
  nrf.init([1, 1, 1, 1, 1], [2, 1, 1, 1, 1]);
  nrf.setReg(0x01, 0x3F);
  nrf.setReg(0x02, 0x03);
  nrf.setReg(0x03, 0x03);
  nrf.setReg(0x04, 0x5F);
  nrf.setChannel(0x60);
  nrf.setReg(0x06, 0x27);
  nrf.setReg(0x1C, 0x3F);
  nrf.setReg(0x1D, 0x06);

  setInterval(function() {
    while (nrf.getDataPipe() !== undefined) {
      let dataPipe = nrf.getDataPipe();
      let data = nrf.getData();

      let msg = nrfGetMessage(data);
      //console.log(dataPipe + ": " + msg);

      if(currentCommand.toString() == msg.toString()){
        broadcast(currentMessage);
      }else{
        console.log("[ ERROR ] Received command did not match with transmitted!");
        console.log(currentCommand + " | " + msg);
      }
    }
  }, 50);

  console.log("NRF Ready");
}

InitNRF();


// BuildInLed off: nrf.send([0x01, 0x02]);
// BuildInLed on: nrf.send([0x01, 0x01]);

//P0
//nrf.send([0x03, 0x23, 0xff, 0xff]);
//nrf.send([0x01, 0x24]);

//P1
//nrf.send([0x03, 0x25, 0xff, 0xff]);
//nrf.send([0x01, 0x26]);

//P2
//nrf.send([0x03, 0x27, 0xff, 0xff]);
//nrf.send([0x01, 0x28]);




//------------------------- Серверная часть -------------------------
//const WebServer = require("WebServer");
const http = require("http");

function router(req, res){
  let str = url.parse(req.url, true);
  res.writeHead(200, {'Content-Type': 'text/plain'});
}




//------------------------- Wi-Fi часть -------------------------
const wifi = require("Wifi");

/*
  Подключение к точке доступа
*/
console.log("Connecting to access point...");
wifi.connect("MERCUSYS_7EBA", {password: "3105vlad3010vlada"}, err => {
  if (err !== null) {
    throw err;
  }

  wifi.getIP((err, info) => {
    if (err !== null) {
      throw err;
    }else {
      console.log("Connecting to access point successfully");
      http.createServer(router).listen(80);
      console.log("Server Ready");
      console.log("Launch completed");
      console.log("http://" + wifi.getIP());
      setInterval(()=>{
       D2.toggle();
      }, 1000);
    }
  });
});