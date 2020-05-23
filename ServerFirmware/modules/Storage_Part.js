//------------------------- Storage часть -------------------------

const storage = require("Storage");

/**
 * Стандартные значения для отладки 
 */
var homeLocations = [
    { idHomeLocation: 1, title: 'Bedroom' },
    { idHomeLocation: 2, title: 'Hall' },
    { idHomeLocation: 3, title: 'Bathroom' },
    { idHomeLocation: 4, title: 'Kitchen' }
];

var elementTypes = [
    { idElementType: 1, title: 'SimpleButton' },
    { idElementType: 2, title: 'DoubleButton' },
    { idElementType: 3, title: 'Range' },
    { idElementType: 4, title: 'ChangingButton' },
    { idElementType: 5, title: 'TripleButton' },
    { idElementType: 6, title: 'ColorPicker' }
];

var locationElements = [
    {
      idLocationElement: 1,
      idHomeLocation: 1,
      idElementType: 4,
      title: 'Main light',
      port: 'A0'
    },
    
    {
      idLocationElement: 2,
      idHomeLocation: 1,
      idElementType: 4,
      title: 'Lamp',
      port: 'A1'
    },
    
    {
      idLocationElement: 3,
      idHomeLocation: 1,
      idElementType: 3,
      title: 'Ventilation',
      port: 'B0'
    },
    
    {
      idLocationElement: 120,
      idHomeLocation: 1,
      idElementType: 6,
      title: 'Rgb',
      port: 'B0'
    }
];



  
