exports.init = function(nrf){

    if(nrf != undefined){
        this.nrf = nrf;
    } 
    else if(this.nrf != undefined){

    }
    else{
        console.log("[ ERROR ] NRF init failed. nfr == undefined");
        return null;
    }
    
    this.nrf.setReg(0x01, 0x3F);
    this.nrf.setReg(0x01, 0x3F);

    if(this.nrf.getReg(0x01) != 0x3F){
        return null;
    }

    this.nrf.setReg(0x02, 0x03);
    this.nrf.setReg(0x03, 0x03);
    this.nrf.setReg(0x04, 0x5F);
    this.nrf.setChannel(0x60);
    this.nrf.setReg(0x06, 0x27);
    this.nrf.setReg(0x1C, 0x3F);
    this.nrf.setReg(0x1D, 0x06);
    this.nrf.setReg(0x0e, 0x70);
    
    this.nrf.init([1, 1, 1, 1, 1], [2, 1, 1, 1, 1]);
    
    return this;
}



exports.getMessage = function(){
    let data = this.nrf.getData();
    let dataLength = data[0];
    let arr = [];
  
    for(let i = 1; i < dataLength + 1; ++i)
      arr.push(data[i]);
  
    return arr;
}

exports.startHandler = function(){
    setWatch(() => {
        console.log("[ INFO ] NRF module interrupt.");
        
        let dataPipe = this.nrf.getDataPipe();
        
        if(dataPipe !== undefined) {
            let msg = this.getMessage();
            
            console.log("[ INFO ] New data NRF -> " + dataPipe + ": " + msg);
    
            if(msg[0] != 0xFF || currentCommand != null){
                if(currentCommand.toString() == msg.toString()){
                    broadcast(currentMessage);
                    currentCommand = null;
                }
                else{
                    console.log("[ ERROR ] Received command did not match with transmitted!");
                    console.log(currentCommand + " | " + msg);
                }
            }
            else{
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
            
                        console.log(" ");
                        console.log("******************* Weather Data *******************");
                        console.log("Temperature: " + temperature + "°C");
                        console.log("Humidity: " + humidity + "%");
                        console.log("Pressure: " + pressure);
                        console.log("Battery: " + batteryVoltage + "V");
                        console.log(" ");
                    break;
        
                    default:
                        console.log("[ WARNING ] Not handled case for incomming message from localHub: [" + msg[2] + "]");
                }
            }
        }
    }, D16, {repeat:true});

   
}

exports.isOnline = function(addr){
    this.nrf.setTXAddr(addr);
    this.nrf.send([0x01, 0x01]); 
}