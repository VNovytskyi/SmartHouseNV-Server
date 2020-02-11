#include <ESP8266WiFi.h>
 
// Replace with your network details
const char *ssid = "MERCUSYS_7EBA";
const char *password = "3105vlad3010vlada";
 
// Web Server on port 8888
WiFiServer server(8888);
 
// variables
String header;
String gpio5_state = "Off";
String gpio4_state = "Off";
int gpio5_pin = 5;
int gpio4_pin = 4;
 
// only runs once
void setup() {
  // Initializing serial port for debugging purposes
  Serial.begin(115200);
  delay(10);
 
  // preparing GPIOs
  pinMode(gpio5_pin, OUTPUT);
  digitalWrite(gpio5_pin, LOW);
  pinMode(gpio4_pin, OUTPUT);
  digitalWrite(gpio4_pin, LOW);
 
  // Connecting to WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
 
  WiFi.begin(ssid, password);
 
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
 
  // Starting the web server
  server.begin();
  Serial.println("Web server running. Waiting for the ESP IP...");
  delay(1000);
 
  // Printing the ESP IP address
  Serial.println(WiFi.localIP());
}
 
// runs over and over again
void loop() {
  // Listenning for new clients
  WiFiClient client = server.available();
 
  if (client) {
    Serial.println("New client");
    // boolean to locate when the http request ends
    boolean blank_line = true;
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        header += c;
 
        if (c == '\n' && blank_line) {
 
          // checking if header is valid
          // dXNlcjpwYXNz = 'user:pass' (user:pass) base64 encode
   
          Serial.print(header);
         
          // Finding the right credential string
          if(header.indexOf("dXNlcjpwYXNz") >= 0) {
            //successful login
            client.println("HTTP/1.1 200 OK");
            client.println("Content-Type: text/html");
            client.println("Connection: close");
            client.println();
            // turns the GPIOs on and off
            if(header.indexOf("GET / HTTP/1.1") >= 0) {
                Serial.println("Main Web Page");
            }  
            else if(header.indexOf("GET /gpio5on HTTP/1.1") >= 0){
                Serial.println("GPIO 5 On");
                gpio5_state = "On";
                digitalWrite(gpio5_pin, HIGH);
            }
            else if(header.indexOf("GET /gpio5off HTTP/1.1") >= 0){
                Serial.println("GPIO 5 Off");
                gpio5_state = "Off";
                digitalWrite(gpio5_pin, LOW);
            }
            else if(header.indexOf("GET /gpio4on HTTP/1.1") >= 0){
                Serial.println("GPIO 4 On");
                gpio4_state = "On";
                digitalWrite(gpio4_pin, HIGH);
            }
            else if(header.indexOf("GET /gpio4off HTTP/1.1") >= 0){
                Serial.println("GPIO 4 Off");
                gpio4_state = "Off";
                digitalWrite(gpio4_pin, LOW);
            }
            // your web page
            client.println("<!DOCTYPE HTML>");
            client.println("<html>");
            client.println("<head>");
            client.println("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">");
            client.println("<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css\">");                                                                    
            client.println("</head><div class=\"container\">");
            client.println("<h1>Web Server</h1>");
            client.println("<h2>GPIO 5 - Current State: " + gpio5_state);          
            client.println("<div class=\"row\">");
            client.println("<div class=\"col-md-2\"><a href=\"/gpio5on\" class=\"btn btn-block btn-lg btn-success\" role=\"button\">ON</a></div>");
            client.println("<div class=\"col-md-2\"><a href=\"/gpio5off\" class=\"btn btn-block btn-lg btn-danger\" role=\"button\">OFF</a></div>");                                                                    
            client.println("</div>");
            client.println("<h2>GPIO 4 - Current State: " + gpio4_state);      
            client.println("<div class=\"row\">");
            client.println("<div class=\"col-md-2\"><a href=\"/gpio4on\" class=\"btn btn-block btn-lg btn-success\" role=\"button\">ON</a></div>");                                                                    
            client.println("<div class=\"col-md-2\"><a href=\"/gpio4off\" class=\"btn btn-block btn-lg btn-danger\" role=\"button\">OFF</a></div>");
            client.println("</div></div></html>");    
          }
       // wrong user or passm, so http request fails...  
        else {            
           client.println("HTTP/1.1 401 Unauthorized");
           client.println("WWW-Authenticate: Basic realm=\"Secure\"");
           client.println("Content-Type: text/html");
           client.println();
           client.println("<html>Authentication failed</html>");
        }  
        header = "";
        break;
        }
        if (c == '\n') {
          // when starts reading a new line
          blank_line = true;
        }
        else if (c != '\r') {
          // when finds a character on the current line
          blank_line = false;
        }
      }
    }  
    // closing the client connection
    delay(1);
    client.stop();
    Serial.println("Client disconnected.");
  }
}
