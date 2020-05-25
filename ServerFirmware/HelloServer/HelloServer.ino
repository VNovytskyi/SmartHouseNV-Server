#include <WiFi.h>

const char* ssid = "MERCUSYS_7EBA"; 
const char* password = "3105vlad3010vlada"; 

WiFiServer server(80); 

String header;

void setup() {
  Serial.begin(115200);
  
  WiFi.begin(ssid, password);
 
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
 
  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());// this will display the Ip address of the Pi which should be entered into your browser
  server.begin();
}
void loop(){
  WiFiClient client = server.available();   // Listen for incoming clients
  
  if (client) {                             // If a new client connects,
    String currentLine = "";                // make a String to hold incoming data from the client
    while (client.connected()) {            // loop while the client's connected
      if (client.available()) {             // if there's bytes to read from the client,
        char c = client.read();             // read a byte, then
        Serial.write(c);                    // print it out the serial monitor
        header += c;
        if (c == '\n') {                    // if the byte is a newline character
          // if the current line is blank, you got two newline characters in a row.
          // that's the end of the client HTTP request, so send a response:
          if (currentLine.length() == 0) {
            // HTTP headers always start with a response code (e.g. HTTP/1.1 200 OK)
            // and a content-type so the client knows what's coming, then a blank line:
            client.println("HTTP/1.1 200 OK");
            client.println("Content-type:text/html");
            client.println("Connection: close");
            client.println();
            
            // turns the GPIOs on and off
            if (header.indexOf("GET /home") >= 0) 
            {
              Serial.println("[ INFO ] Request on homePage.");
              client.println("<!DOCTYPE html><html lang=\"en\"><head> <meta charset=\"UTF-8\"> <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/> <title>SmartHouseNV</title> <!-- Внешний ресурсы --> <link rel=\"stylesheet\" href=\"https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css\" integrity=\"sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh\" crossorigin=\"anonymous\"> <script src=\"https://kit.fontawesome.com/052fa37aec.js\" crossorigin=\"anonymous\"></script> <!-- Внутренний ресурс --> <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\"> <script src=\"https://code.jquery.com/jquery-3.4.1.slim.min.js\" integrity=\"sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n\" crossorigin=\"anonymous\"></script> <script src=\"https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js\" integrity=\"sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo\" crossorigin=\"anonymous\"></script> <script src=\"https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js\" integrity=\"sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6\" crossorigin=\"anonymous\"></script> <script src=\"usualSite.js\"></script></head><body class=\"pt-5\"> <nav class=\"navbar navbar-expand-md navbar-dark fixed-top bg-dark\"> <a class=\"navbar-brand\" href=\"#\">SmartHouseNV</a> <button id=\"toggleNavBarB\" class=\"navbar-toggler\" type=\"button\" data-toggle=\"collapse\" data-target=\"#navbarsExampleDefault\" aria-controls=\"navbarsExampleDefault\" aria-expanded=\"false\" aria-label=\"Toggle navigation\"> <span id=\"toggleNavBarS\" class=\"navbar-toggler-icon\"></span> </button> <div class=\"collapse navbar-collapse\" id=\"navbarsExampleDefault\"> <ul id=\"navBar\" class=\"navbar-nav mr-auto\"> <!-- home locations titles--> <li class=\"nav-item dropdown\"> <a id=\"dropDownToggle\" class=\"nav-link dropdown-toggle\" href=\"http://example.com\" id=\"dropdown01\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">Other</a> <div class=\"dropdown-menu\" aria-labelledby=\"dropdown01\"> <a class=\"dropdown-item\" href=\"/weather\">weather</a> <a class=\"dropdown-item mb-2\" href=\"/settings\">settings</a> <div class=\"dropdown-item\"> <input type=\"checkbox\" id=\"editMode\"> <label class=\"ml-2\"> Edit mode</label> </div> </div> </li> </ul> <a class=\"btn btn-outline-primary\" href=\"http://192.168.1.102/signIn\">Sign In</a> </div> </nav> <!-- home locations and their elements --></body><script src=\"uPage.js\"></script>");
            }
            else if(header.indexOf("GET /getHomeLocations") >= 0)
            {
              Serial.println("[ INFO ] Request on homeLocations.");
              client.println("[{\"idHomeLocation\":1,\"title\":\"Bedroom\"},{\"idHomeLocation\":2,\"title\":\"Hall\"},{\"idHomeLocation\":3,\"title\":\"Bathroom\"},{\"idHomeLocation\":4,\"title\":\"Kitchen\"}]");
            }
            else if(header.indexOf("GET /getElementTypes") >= 0)
            {
              Serial.println("[ INFO ] Request on elementTypes.");
              client.println("[{\"idElementType\":1,\"title\":\"SimpleButton\"},{\"idElementType\":2,\"title\":\"DoubleButton\"},{\"idElementType\":3,\"title\":\"Range\"},{\"idElementType\":4,\"title\":\"ChangingButton\"},{\"idElementType\":5,\"title\":\"TripleButton\"},{\"idElementType\":6,\"title\":\"ColorPicker\"}]");
            }
            else if(header.indexOf("GET /getLocationElements") >= 0)
            {
              Serial.println("[ INFO ] Request on locationElements.");
              client.println("[{\"idLocationElement\":1,\"idHomeLocation\":1,\"idElementType\":4,\"title\":\"Main light\",\"port\":\"A0\"},{\"idLocationElement\":2,\"idHomeLocation\":1,\"idElementType\":4,\"title\":\"Lamp\",\"port\":\"A1\"},{\"idLocationElement\":3,\"idHomeLocation\":1,\"idElementType\":3,\"title\":\"Ventilation\",\"port\":\"B0\"},{\"idLocationElement\":120,\"idHomeLocation\":1,\"idElementType\":6,\"title\":\"Rgb\",\"port\":\"B0\"}]");
            }
            else if(header.indexOf("GET /uPage.js") >= 0)
            {
              Serial.println("[ INFO ] Request on uPage.js");
              client.println("var homeLocations;var elementTypes;var locationElements;var xhr = new XMLHttpRequest();xhr.open('GET', 'http://192.168.1.108/getHomeLocations', false);xhr.send();if (xhr.status != 200) { console.log( xhr.status + ': ' + xhr.statusText );} else { homeLocations = JSON.parse(xhr.responseText); let navBar = document.getElementById('navBar'); let buff = ''; for(let i = 0; i < homeLocations.length; ++i){ buff += `<li class='nav-item active'><a class='nav-link' href='#` + homeLocations[i].title + `'>` + homeLocations[i].title + `<span class='sr-only'></span></a></li>` ; } navBar.innerHTML = buff + navBar.innerHTML; for(let i = 0; i < homeLocations.length; ++i){ if(i % 2 == 0){ document.body.innerHTML += `<div id='` + homeLocations[i].title + `' class='min-vh-100'>` + `<h1 class='text-center font-italic pt-5'>` + homeLocations[i].title + `</h1> <div class='container mt-4'> <div class='row'> </div> </div> </div>`; } else{ document.body.innerHTML += `<div id='` + homeLocations[i].title + `' class='min-vh-100 bg-light'>` + `<h1 class='text-center font-italic pt-5'>` + homeLocations[i].title + `</h1> <div class='container mt-4'> <div class='row'> </div> </div> </div>`; } }}xhr.open('GET', 'http://192.168.1.108/getElementTypes', false);xhr.send();if (xhr.status != 200) { console.log( xhr.status + ': ' + xhr.statusText );} else { elementTypes = JSON.parse(xhr.responseText);}xhr.open('GET', 'http://192.168.1.108/getLocationElements', false);xhr.send();if (xhr.status != 200) { console.log( xhr.status + ': ' + xhr.statusText );} else { locationElements = JSON.parse(xhr.responseText); for(let i = 0; i < homeLocations.length; ++i){ let target = document.getElementById('Bedroom').firstElementChild.nextElementSibling.firstElementChild; for(let j = 0; j < locationElements.length; ++j) { if(locationElements[j].idHomeLocation == homeLocations[i].idHomeLocation) { let idElement = locationElements[j].idElementType; let elementTitle = elementTypes[idElement - 1].title; let locationTitle = locationElements[j].title; let colmd = 'col-md-3'; let buff = ''; switch(elementTitle) { case 'SimpleButton': buff += `<button type='button' class='btn btn-outline-success'>Click</button>`; break; case 'DoubleButton': buff += `<div class='btn-group'> <button type='button' class='btn btn-outline-success'>On</button> <button type='button' class='btn btn-outline-danger'>Off</button> </div>`; break; case 'TripleButton': buff += `<div class='btn-group'> <button type='button' class='btn btn-outline-success'>Open</button> <button type='button' class='btn btn-outline-warning'>Stop</button> <button type='button' class='btn btn-outline-danger'>Close</button> </div>`; break; case 'ChangingButton': buff += `<button name='` + locationElements[j].port + `' type='button' class='btn btn-success'>Включить</button>`; break; case 'Range': colmd = 'col-md-6'; buff += `<input name='` + locationElements[j].port + `' type='range' min='1' max='100' value='0' class='slider'>`; break; case 'ColorPicker': buff += `<input name='` + locationTitle + `' type='color' value='#fd3cf8'> <div class='btn-group'> <button type='button' class='btn btn-outline-success'>On</button> <button type='button' class='btn btn-outline-danger'>Off</button> </div>`; break; default: console.log('Element type error'); break; } buff = `<div class='` + colmd + `mb-4'> <div class='card'> <div class='card-body mt-1'> <div name='editButtons' class='text-right d-none'> <button type='button' style='border: none;background: inherit;'> <i title='delete' class='fas fa-times-circle text-danger'></i> </button> </div> <h5 class='card-title'>` + locationTitle + `</h5>` + buff; target.innerHTML += buff; target.innerHTML += `</div></div></div>`; } } target.innerHTML += `</div></div></div>`; }}");
            }            
            
            // The HTTP response ends with another blank line
            client.println();
            // Break out of the while loop
            break;
          } else { // if you got a newline, then clear currentLine
            currentLine = "";
          }
        } else if (c != '\r') {  // if you got anything else but a carriage return character,
          currentLine += c;      // add it to the end of the currentLine
        }
      }
    }

    header = "";
   
    client.stop();
    Serial.println("Client disconnected.");
    Serial.println("");
  }
}
