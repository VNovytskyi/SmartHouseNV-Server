/*
  Tasks:
    1) При отправке запроса на состояния хаба запускать таймер на время отзыва;
    2) Перед отправкой команды на хаб выставлять его адрес из класса localHub;


*/

//nrf.send([1, 1]);




console.log("Launching...");


//------------------------- Storage часть -------------------------

//TODO: Создать класс для каждой локации дома (localHub)
var localHub = function(HubNum){
  this.HubNum = HubNum; // Addr = [HubNum, 1, 1, 1, 1]
  this.elements = []; //Buttons for light, RGB, ...
};

const storage = require("Storage");
//TODO: выполнять инциализацию структур данных загружая данные из файлов

var weatherDataBuff = [];


// 16и разрядное число
var portA = 0;

// Массив значений порта B
var portB = [0, 0, 0, 0, 0, 0];

var currentCommand = null;
var currentMessage;
var ipServerPC = "192.168.1.102";

//------------------------- NRF часть -------------------------

SPI1.setup({sck: NodeMCU.D5, miso: NodeMCU.D6, mosi: NodeMCU.D7});

const nrf = require("NRF24L01P").connect( SPI1, NodeMCU.D8, NodeMCU.D1);
const http = require("http");
var httpResult;

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
  //nrf.setTXAddr(addr)
  nrf.setReg(0x01, 0x3F);
  nrf.setReg(0x02, 0x03);
  nrf.setReg(0x03, 0x03);
  nrf.setReg(0x04, 0x5F);
  nrf.setChannel(0x60);
  nrf.setReg(0x06, 0x27);
  nrf.setReg(0x1C, 0x3F);
  nrf.setReg(0x1D, 0x06);
  nrf.setReg(0x0e, 0x70);
}

InitNRF();


function clearUnsentWeatherData(){
  return storage.erase("UWD");
}

function addUnsentWeatherData(temperature, humidity, pressure, batteryVoltage){
  let data = isUnsentWeatherData();

  if(data != false){
    let arrObj = JSON.parse(getUnsentWeatherData());
    arrObj.push({temperature: temperature, humidity: humidity, pressure: pressure, batteryVoltage: batteryVoltage});
    storage.write("UWD", JSON.stringify(arrObj));
  }else{
    let arrObj = [];
    arrObj.push({temperature: temperature, humidity: humidity, pressure: pressure, batteryVoltage: batteryVoltage});
    storage.write("UWD", JSON.stringify(arrObj));
  }
}

function isUnsentWeatherData(){
  let data = getUnsentWeatherData();

  if(data != undefined)
    return data.length > 0;
  else
    return false;
}

function getUnsentWeatherData(){
  return storage.read("UWD");
}

function sendWeatherData(temperature, humidity, pressure, batteryVoltage){
  let req = ipServerPC + "/weatherStation/main.php?type=addNewRecord&t=" + temperature +
                                          "&h=" + humidity + "&p=" + pressure + "&v=" + batteryVoltage;

  http.get(req, (res) => {
    res.on('data', (data) => {

      /*
      if(data.indexOf("Successfull")){
        console.log("[ OK ] Message has been transmitted to server.");
      }else{
        console.log("[ ERROR ] Get error message from server:");
        console.log(data);
        result = false;
      }
      */
    });

    res.on('error', function(e) {
      console.log("[ ERROR ] While transmitted weatherData get internal error:");
      console.log(e);
    });
  });
}

function NRF_Handler(){
  setInterval(function() {
   if(digitalRead(NodeMCU.D0) == 0 && nrf.getDataPipe() !== undefined) {
      let dataPipe = nrf.getDataPipe();
      let data = nrf.getData();

      let msg = nrfGetMessage(data);
      //console.log(dataPipe + ": " + msg);

      if(msg[0] != 0xFF || currentCommand != null){
        if(currentCommand.toString() == msg.toString()){
          broadcast(currentMessage);
          currentCommand = null;
        }else{
          console.log("[ ERROR ] Received command did not match with transmitted!");
          console.log(currentCommand + " | " + msg);
        }
      }else{
        switch(msg[2]){
          case 0x01:
            console.log("LocalHub[" + msg[1] + "]: Ready!");
            break;

          case 0x02:
            console.log("LocalHub[" + msg[1] + "]: Online");
            break;

          case 0x03:
            let temperature = msg[3];
            let humidity = msg[4];
            let pressure = (msg[5] << 8) | msg[6];
            let batteryVoltage = msg[7] / 10;

            console.log("\n");
            console.log("******************* Weather Data *******************");
            console.log("Temperature: " + temperature + "°C");
            console.log("Humidity: " + humidity + "%");
            console.log("Pressure: " + pressure);
            console.log("Battery: " + batteryVoltage + "V");

            http.get(ipServerPC, (res) => httpResult = res);

            setTimeout(()=>{
              let enableServer = ((httpResult != undefined || httpResult != null) && httpResult.statusCode == "200");
              httpResult = null;

              if(enableServer == true){
                console.log("[ OK ] MySQL server on " + ipServerPC + " is available.");

                let unsentData = isUnsentWeatherData();

                if(unsentData == true){
                  console.log("WeatherData buff is not empty.");

                  let unsentData = JSON.parse(getUnsentWeatherData());
                  console.log("Unsent data:");
                  console.log(unsentData);

                  console.log("Start sendind unsent weatherData to server.");

                  let i = 0;
                  let len = unsentData.length;
                  let sendInterval = setInterval(()=>{
                    console.log(i + "/" + len);
                    i++;
                    console.log("Free: " + process.memory().free);

                    let cur = unsentData.shift();
                    if(cur == undefined){
                      clearInterval(sendInterval);
                      console.log("Clear weatherData buff.");
                      clearUnsentWeatherData();

                      console.log("Start sendind current weather data to server.");
                      sendWeatherData(temperature, humidity, pressure, batteryVoltage);

                      //TODO: Проверять, прошла ли отправка
                      console.log("[ OK ] Message has been transmitted to server.");
                    }else{
                      sendWeatherData(cur.temperature, cur.humidity, cur.pressure, cur.batteryVoltage);
                    }
                  }, 1000);
                }else{
                  console.log("Start sendind current weather data to server.");
                  sendWeatherData(temperature, humidity, pressure, batteryVoltage);

                  //TODO: Проверять, прошла ли отправка
                  console.log("[ OK ] Message has been transmitted to server.");
                }
              }else{
                console.log("[ WARNING ] MySQL server on " + ipServerPC + " is not available.");
                console.log("Save unsent weatherData into a buff.");
                addUnsentWeatherData(temperature, humidity, pressure, batteryVoltage);
                console.log(JSON.parse(getUnsentWeatherData()));
              }
            }, 1000);
            break;

          default:
            console.log("Not handled case for incomming message from localHub: [" + msg[2] + "]");
        }
      }
    }
  }, 100);
}









//------------------------- Серверная часть -------------------------

const wifi = require("Wifi");

//Массив клиентов
var clients = [];

//Счетчик клиентов. Для ограничения к-ва подлюченных клиентов
var clientsCounter = 0;


/*
  Обработчик web-socket'a
*/
function wsHandler(ws)
{
  clients.push(ws);

  ws.on('message', message => {
    //TODO: установить доступный интервал ответа
    currentMessage = message;

    let arrMessage = JSON.parse(message);

    console.log(arrMessage);

    for(let i = 0; i < arrMessage.length; ++i){

      //Не работает
      if(arrMessage[i].name == "homeLocation" && arrMessage[i].value == "bedroom"){
        console.log("Set home location: bedroom");
        continue;
      }

      let port = arrMessage[i].name[0];
      let pin = Number(arrMessage[i].name.slice(1));
      let cmd = 0x00;

      switch(port){
        case 'A':
          cmd = 3 + 2 * pin;

          if(arrMessage[i].value == "off"){
             ++cmd;
             portA &= ~(1 << pin);
          }
          else{
             portA |= (1 << pin);
          }

          nrf.send([0x01, cmd]);
          currentCommand = cmd;
          break;

        case 'B':
          cmd = 0x23 + 0x02 * pin;

          if(arrMessage[i].value == 0){
            nrf.send([0x01, ++cmd]);
            currentCommand = cmd;
             portB[pin] = 0;
          }
          else{
            let value = arrMessage[i].value * 655;
            portB[pin] = arrMessage[i].value;
            nrf.send([0x03, cmd, value >> 8, value & 0xFF]);
            currentCommand = [cmd, value >> 8, value & 0xFF];
          }
          break;

        case 'C':
          let red = parseInt("0x" + arrMessage[i].value[1] + arrMessage[i].value[2]) * 257;
          let green = parseInt("0x" + arrMessage[i].value[3] + arrMessage[i].value[4]) * 257;
          let blue = parseInt("0x" + arrMessage[i].value[5] + arrMessage[i].value[6]) * 257;

          let cmdArr = [];

          if(red < 1000){
            cmdArr.push(0x24);
          }else{
            cmdArr.push(0x23, red >> 8, red & 0xFF);
          }

          if(green < 1000){
            cmdArr.push(0x26);
          }else{
            cmdArr.push(0x25, green >> 8, green & 0xFF);
          }

          if(blue < 1000){
            cmdArr.push(0x28);
          }else{
            cmdArr.push(0x27, blue >> 8, blue & 0xFF);
          }

          cmdArr.unshift(cmdArr.length);

          nrf.send(cmdArr);
          cmdArr.shift();
          currentCommand = cmdArr;
          break;

        default:
          console.log("Input message name error: " + arrMessage[i].name + " -> " + arrMessage[i].value);
      }
    }
  });

  ws.on('close', evt => {
    let x = clients.indexOf(ws);
    if (x > -1) {
      clients.splice(x, 1);
    }
    console.log("Free memory: " + process.memory().free);
  });

  ws.on('error', event => {
    console.log(event);
  });

  bringUpToDate(ws);

  console.log("Free memory: " + process.memory().free);
}

/*
  Обработчик http-сервера
*/
function httpServerHandler(req, res)
{
  res.writeHead(200, {'Content-Type': 'text/html'});

  let urlObj = url.parse(req.url, true);

  switch(urlObj.pathname)
  {
    case "/":
    case "/home":
      res.end("Home Page");
      break;

    case "/settings":
      res.end("Settings Page");
      break;

    default:
      res.end("404");
      break;
  }
}

/*
  Отсылает всем подключенным пользователям сообщение
*/
function broadcast(msg) {
  clients.forEach(cl => cl.send(msg));
}

/*
  Запуск http-сервера и web-socket'а
*/
function startServer()
{
  const server = require('ws').createServer(httpServerHandler);
  server.on('websocket', wsHandler);
  server.listen(80);
}

/*
  Отправляет новому клиенту текущее состояние системы
*/
//TODO: обновить при переходе на файловую систему
function bringUpToDate(ws)
{
  let commandsArr = [];

  for(let i = 0; i < 16; ++i){
    commandsArr.push({
      name: "A" + i,
      value: portA & (1 << i)? "on": "off"
    });
  }

  for(let i = 0; i < 6; ++i){
    commandsArr.push({
      name: "B" + i,
      value: portB[i]
    });
  }

  ws.send(JSON.stringify(commandsArr));
}

/*
  Подключение к точке доступа
*/
//TODO: Добавить несколько точек доступа

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
      startServer();
      console.log("Server Ready");

      //TODO: Check who is online (localhubs)

      setInterval(() => D2.toggle(), 1000);

      InitNRF(); //Second call InitNRF(), it`s not a mistake, do not delete!
      NRF_Handler();

      console.log("NRF Ready");

      console.log("Launch completed");
    }
  });
});