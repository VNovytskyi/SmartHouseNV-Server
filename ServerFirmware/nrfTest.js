SPI1.setup({sck: NodeMCU.D5, miso: NodeMCU.D6, mosi: NodeMCU.D7});

class MyPin{
  constructor(pin, reverse){
    this.pin = pin;
    this.reverse = reverse;
    this.low();
  }

  high(){
    if(this.reverse)
      this.pin.reset();
    else
      this.pin.set();

    this.state = "on";
  }

  low(){
    if(this.reverse)
      this.pin.set();
    else
      this.pin.reset();

    this.state = "off";
  }

  getState(){
    return this.state;
  }

  setState(state){
    this.state = state;
    if(state == "off")
      this.low();
    else
      this.high();
  }
}

var CSN = new MyPin(NodeMCU.D8, false);
var CE = new MyPin(NodeMCU.D2, false);

function NRF(SPI, CSN, CE){
  this.CONFIG = 0x00;
  this.REG_STATUS = 0x07;
  this.RX_ADDR_P0 = 0x0A;
  this.RX_ADDR_P1 = 0x0B;
  this.RX_ADDR_P2 = 0x0C;
  this.RX_ADDR_P3 = 0x0D;
  this.RX_ADDR_P4 = 0x0E;
  this.RX_ADDR_P5 = 0x0F;
  this.TX_ADDR = 0x10;
  this.W_REGISTER = 0x20;
  this.R_RX_PAYLOAD = 0x61;
  this.FEATURE = 0x1D;
  this.EN_AA = 0x01;
  this.EN_RXADDR = 0x02;
  this.SETUP_AW = 0x03;
  this.SETUP_RETR = 0x04;
  this.RF_CH = 0x05;
  this.RF_SETUP = 0x06;
  this.FEATURE = 0x1D;
  this.DYNPD = 0x1C;
  this.W_TX_PAYLOAD = 0xA0;
  this.MAX_PACKET_LENGTH = 32;

  this.SPI = SPI;
  this.CSN = CSN;
  this.CE = CE;

  CE.low();

  this.readReg = function(regAddr){
    let regValue = 0x00;
    CSN.low();

    regValue = SPI.send(regAddr);
    if(regAddr != 0x07)
      regValue = SPI.send(0xFF);

    CSN.high();
    return regValue;
  };

  this.readMBReg = function(regAddr){
    let regValue = "";
    let bytesCount = 5;
    CSN.low();

    SPI.send(regAddr);
    while(bytesCount--){
      regValue += SPI.send(0xFF).toString(16);
    }
    regValue = "0x" + regValue.toUpperCase();

    CSN.high();
    return regValue;
  };

  this.writeReg = function(regAddr, regValue){
    regAddr |= this.W_REGISTER;
    CSN.low();
    SPI.send(regAddr);
    SPI.send(regValue);
    CSN.high();
  };

  this.writeMBReg = function(regAddr, regValue){
    regAddr |= this.W_REGISTER;

    CSN.low();
    SPI.send(regAddr);

    for(let i = 0; i < 5; ++i){
      SPI.send(regValue[i]);
    }

    CSN.high();
  };

  this.toggleFeature = function(){
    CSN.low();
    SPI.send(0x50);
    SPI.send(0x73);
    CSN.high();
  };

  this.flushRX = function(){
    CSN.low();
    SPI.send(0xE2);
    CSN.high();
  };

  this.flushTX = function(){
    CSN.low();
    SPI.send(0xE1);
    CSN.high();
  };

  this.setReceiverAddress = function(receiverAddress)
  {
    nrf.writeMBReg(nrf.TX_ADDR, receiverAddress);
  };

  this.ModeRX = function(){
    let regValue = this.readReg(this.CONFIG);
    regValue |= (1<<(1))|(1<<(0));
    this.writeReg(this.CONFIG, regValue);
    CE.high();
    this.flushRX();
    this.flushTX();
  };

  this.ModeTX = function(){
    CE.low();
    let config = this.readReg(this.CONFIG);

    if(!(config & 1<<(1))){
      config |= 1<<(1);
      this.writeReg(this.CONFIG, config);
    }

    config = this.readReg(this.CONFIG);
    config &= ~(1<<(0));
    this.writeReg(this.CONFIG, config);

    this.flushRX();
    this.flushTX();
  };

  this.GetPacket = function(length){
    CSN.low();

    SPI.send(this.R_RX_PAYLOAD);
    let result = [];
    while(length--)
      result.push(SPI.send(0xFF));

    CSN.high();
    this.writeReg(nrf.REG_STATUS, (1<<(6)) | (1<<(4)) | (1<<(5)));
    return result;
  };

  /*
      @brief Send packet to destination
      @param receiverAddress
      @param data - data to send. [], ""
      @param writeType (W_TX_PAYLOAD, )
      @retval 1 - successful send, 0 - unsuccessful send, -1 - error in function
  */
  this.SendPacket = function(receiverAddress, data, writeType){
    if(receiverAddress != null)
      nrf.setReceiverAddress(receiverAddress)

    let dataLength = data.length;

    CSN.low();
    SPI.send(writeType);

    SPI.send(dataLength);
    for(let i = 0; i < dataLength; ++i)
      SPI.send(data[i]);

    let en_dpl = this.readReg(this.FEATURE) & (1<<(2));
    if(!en_dpl){
      let blank  = this.MAX_PACKET_LENGTH - dataLength;
      while(blank--)
        SPI.send(0xFF);
    }

    CSN.high();
    CE.high();

    let s = 0;
    for(let i = 0; i < 100; ++i)
    {
      s++;
    }

    CE.low();

    let status = nrf.readReg(this.REG_STATUS);

    if(status & (1<<(5))){
      this.writeReg(this.REG_STATUS, 0x20);
      return 1;
    }

    if(status & (1<<(4))){
      this.writeReg(this.REG_STATUS, 0x10);
      this.flushTX();
      return 0;
    }

    return -1;
  };

  /*
    @brief: Organization of a complete dispatch cycle
    @param receiverAddress
    @param data - data to send. [], ""
    @param writeType (W_TX_PAYLOAD, )
    @retval 1 - successful send, 0 - unsuccessful send, -1 - error in function
  */
  this.SendSysPacket = function(receiverAddress, data, writeType){
    nrf.setReceiverAddress(receiverAddress);

    let dataLength = data.length;
  };
}

var nrf = new NRF(SPI1, CSN, CE);

/*
function printDetails(){
  let status = nrf.readReg(nrf.REG_STATUS);
  let RX_DR = (status & (1 << (6)))? 1:0;
  let TX_DS = (status & (1 << 5))? 1:0;
  let MAX_RT = (status & (1 << 4))? 1:0;
  let RX_P_NO = (status >> 1) & 0b111;
  let TX_FULL = (status & (1 << 0))? 1:0;

  let RX_ADDR_P0_1 = nrf.readMBReg(nrf.RX_ADDR_P0) + " -  " +  nrf.readMBReg(nrf.RX_ADDR_P1);

  let RX_ADDR_P2_5 = "0x" + nrf.readReg(nrf.RX_ADDR_P2).toString(16) + " 0x" + nrf.readReg(nrf.RX_ADDR_P3).toString(16) + " 0x" + nrf.readReg(nrf.RX_ADDR_P4).toString(16) + " 0x" + nrf.readReg(nrf.RX_ADDR_P5).toString(16);

  let TX_ADDR = nrf.readMBReg(nrf.TX_ADDR);
  let EN_AA = "0x" + nrf.readReg(nrf.EN_AA).toString(16);
  let EN_RXADDR = "0x" + nrf.readReg(nrf.EN_RXADDR).toString(16);
  let RF_CH = "0x" + nrf.readReg(nrf.RF_CH).toString(16);
  let RF_SETUP = "0x" + nrf.readReg(nrf.RF_SETUP).toString(16);
  let CONFIG = "0x" + nrf.readReg(nrf.REG_STATUS).toString(16);
  let DYNPD_FEATURE = "0x" + nrf.readReg(nrf.DYNPD).toString(16) + " 0x" + nrf.readReg(nrf.FEATURE).toString(16);

  let DataRate = 0;
  let dr = nrf.readReg(0x06) & (1<<(5) | 1<<(3));
  if(dr == (1<<(5)))
    DataRate = 250000;
  else if(dr == (1<<(3)))
    DataRate = 2000000;
  else
    DataRate = 1000000;

  let LengthCRC = 0;
  let crc = nrf.readReg(0x00) & (1<<(2) | 1<<(3));
  if(crc & 1<<(3)){
    if(crc & 1<<(2)){
      LengthCRC = 16;
    }else
      LengthCRC = 8;
  }

  let PowerAmplifier = (nrf.readReg(0x06) & (1<<(1) | (1<<(2))))>>1;

  console.log(" ");
  console.log("printDetails");
  console.log("Status: 0x" + status.toString(16) + " RX_DR: " + RX_DR + " TX_DS: " + TX_DS + " MAX_RT: " + MAX_RT + " RX_P_NO: " + RX_P_NO + " TX_DS: " + TX_FULL);
  console.log("RX_ADDR_P0-1: " + RX_ADDR_P0_1);
  console.log("RX_ADDR_P2-5: " + RX_ADDR_P2_5);
  console.log("TX_ADDR: " + TX_ADDR);
  //console.log("RX_PW_P0-6: " + RX_PW_P0_6);
  console.log("EN_AA: " + EN_AA); // отличается
  console.log("EN_RXADDR: " + EN_RXADDR);
  console.log("RF_CH: " + RF_CH); // отличается
  console.log("RF_SETUP: " + RF_SETUP);
  console.log("CONFIG: " + CONFIG);
  console.log("DYNPD/FEATURE: " + DYNPD_FEATURE);
  console.log("Data Rate: " + DataRate);
  console.log("CRC Length: " + LengthCRC);
  console.log("PA Power: " + PowerAmplifier);
}
*/

function onInit() {
  CE.low();
  nrf.writeReg(nrf.EN_AA, 0x3F);
  nrf.writeReg(nrf.EN_RXADDR, 0x03);
  nrf.writeReg(nrf.SETUP_AW, 0x03);
  nrf.writeReg(nrf.SETUP_RETR, 0x5F);
  nrf.writeReg(nrf.RF_CH, 0x60);
  nrf.writeReg(nrf.RF_SETUP, 0x27);
  nrf.toggleFeature();
  nrf.writeReg(nrf.FEATURE, 0x06);
  nrf.writeReg(nrf.DYNPD, 0x3F);

  nrf.setReceiverAddress(['1', 'N', 'o', 'd', 'e']);
  nrf.writeMBReg(nrf.RX_ADDR_P0, ['1', 'N', 'o', 'd', 'e']);
  nrf.writeMBReg(nrf.RX_ADDR_P1, ['1', 'N', 'o', 'd', 'e']);

  nrf.writeReg(nrf.PW_P0, 0x20);
  nrf.writeReg(nrf.PW_P1, 0x20);

  let rxMode = false;

  if(rxMode)
  {
    nrf.ModeRX();

    setInterval(() => {
      if(!(nrf.readReg(0x17) & (1<<(0))))
      {
        let data = nrf.GetPacket(10);
        let status = nrf.readReg(nrf.REG_STATUS);
        console.log("ESP get: " + data);
      }
    }, 1000);
  }
  else
  {
    nrf.ModeTX();
    /*
    setInterval(() => {
      let send = "Hello from ESP8266 on NodeMCU";
      let result = nrf.SendPacket(null, send, nrf.W_TX_PAYLOAD);
      console.log("ESP send [" + send.length + "]: " + send + " -> " + result);
    }, 1000);
    */
  }

  //printDetails();
}

onInit();

