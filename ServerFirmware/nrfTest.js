SPI1.setup({sck: NodeMCU.D5, miso: NodeMCU.D6, mosi: NodeMCU.D7});

var nrf = require("NRF24L01P").connect(SPI1, NodeMCU.D8, NodeMCU.D2);

nrf.init([0,0,0,0,2], [0,0,0,0,1]);

