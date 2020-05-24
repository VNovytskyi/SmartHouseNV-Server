
var weatherDataBuff = [];

exports.initWeatherModule = function(Storage){
    this.storage = Storage;
};

exports.clearUnsentWeatherData = function(){
    return storage.erase("UWD");
};
  
exports.addUnsentWeatherData = function(temperature, humidity, pressure, batteryVoltage){
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
};

exports.isUnsentWeatherData = function(){
  let data = getUnsentWeatherData();

  if(data != undefined)
    return data.length > 0;
  else
    return false;
};

exports.getUnsentWeatherData = function(){
  return storage.read("UWD");
}

exports.sendWeatherData = function(temperature, humidity, pressure, batteryVoltage){
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