SPI1.setup({sck: NodeMCU.D5, miso: NodeMCU.D6, mosi: NodeMCU.D7});

class MyPin{
  constructor(pin, reverse){
    this.pin = pin;
    this.reverse = reverse;
    this.off();
  }

  on(){
    if(this.reverse)
      this.pin.reset();
    else
      this.pin.set();

    this.state = "on";
  }

  off(){
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
      this.off();
    else
      this.on();
  }
}

var CSN = new MyPin(NodeMCU.D8, false);
var CE = new MyPin(NodeMCU.D2, false);

function NRF(SPI, CSN, CE){
  this.REG_STATUS = 0x07;

  this.SPI = SPI;
  this.CSN = CSN;
  this.CE = CE;

  CE.off();

  this.readReg = function(regAddr){
    let regValue = 0x00;
    CSN.off();
    regValue = SPI.send(regAddr);
    if(regAddr != 0x07)
    CSN.on();
    return regValue;
  }
}

var nrf = new NRF(SPI1, CSN, CE);
console.log(nrf.readReg(nrf.REG_STATUS));

/*
function printDetails(){
  let status = nrf.getStatus();
  let RX_DR = (status & (1 << (6)))? 1:0;
  let TX_DS = (status & (1 << 5))? 1:0;
  let MAX_RT = (status & (1 << 4))? 1:0;
  let RX_P_NO = (status >> 1) & 0b111;
  let TX_FULL = (status & (1 << 0))? 1:0;

  let RX_ADDR_P0_1 = nrf.getAddr(0x0A) + " -  " +  nrf.getAddr(0x0B);

  
  
  
  let RX_ADDR_P2_5 = "0x" + nrf.getReg(0x0C).toString(16) + " 0x" + nrf.getReg(0x0D).toString(16) + " 0x" + nrf.getReg(0x0E).toString(16) + " 0x" + nrf.getReg(0x0F).toString(16);
  let TX_ADDR = nrf.getAddr(0x10);
  let RX_PW_P0_6 = "0x" + nrf.getReg(0x11).toString(16) + " 0x" + nrf.getReg(0x12).toString(16) + " 0x" +nrf.getReg(0x13).toString(16) + " 0x" +nrf.getReg(0x14).toString(16) + " 0x" +nrf.getReg(0x15).toString(16) + " 0x" +nrf.getReg(0x16).toString(16);
  let EN_AA = "0x" + nrf.getReg(0x01).toString(16);
  let EN_RXADDR = "0x" + nrf.getReg(0x02).toString(16);
  let RF_CH = "0x" + nrf.getReg(0x05).toString(16);
  let RF_SETUP = "0x" + nrf.getReg(0x06).toString(16);
  let CONFIG = "0x" + nrf.getReg(0x00).toString(16);
  let DYNPD_FEATURE = "0x" + nrf.getReg(0x1C).toString(16) + " 0x" + nrf.getReg(0x1D).toString(16);

  let DataRate = 0;
  let dr = nrf.getReg(0x06) & (1<<(5) | 1<<(3));
  if(dr == (1<<(5)))
    DataRate = 250000;
  else if(dr == (1<<(3)))
    DataRate = 2000000;
  else
    DataRate = 1000000;

  let LengthCRC = 0;
  let crc = nrf.getReg(0x00) & (1<<(2) | 1<<(3));
  if(crc & 1<<(3)){
    if(crc & 1<<(2)){
      LengthCRC = 16;
    }else
      LengthCRC = 8;
  }

  let PowerAmplifier = (nrf.getReg(0x06) & (1<<(1) | (1<<(2))))>>1;

  console.log(" ");
  console.log("printDetails");
  console.log("Status: 0x" + status.toString(16) + " RX_DR: " + RX_DR + " TX_DS: " + TX_DS + " MAX_RT: " + MAX_RT + " RX_P_NO: " + RX_P_NO + " TX_DS: " + TX_FULL);
  console.log("RX_ADDR_P0-1: " + RX_ADDR_P0_1);
  console.log("RX_ADDR_P2-5: " + RX_ADDR_P2_5);
  console.log("TX_ADDR: " + TX_ADDR);
  console.log("RX_PW_P0-6: " + RX_PW_P0_6);
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

  //printDetails();
}

onInit();

