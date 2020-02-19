var wifi = require("Wifi");
var http = require("http");
var storage = require("Storage");

//196 608 bytes
console.log("Available storage bytes: " + storage.getFree());


const buildInLed = D2;

var counter = 0;

wifi.connect("MERCUSYS_7EBA", {password:"3105vlad3010vlada"}, function(err){
  if(err != null){
    console.log("Wifi connect error: " + err);
  }
  else{
    console.log("WiFi connected. IP: " + wifi.getIP().ip);

    http.createServer(function(req, res){
      console.log(" ");
      console.log("################## " + ++counter + " ##################");

      var urlObj = url.parse(req.url, true);

      switch(urlObj.pathname){
        case "/":
        case "/home":
          res.writeHead(200,{'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
          res.end("<!DOCTYPE html><html lang=\"en\"><head> <meta charset=\"UTF-8\"> <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"> <title>Document</title> <link rel=\"stylesheet\" href=\"https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css\" integrity=\"sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh\" crossorigin=\"anonymous\"> <style> </style></head><body class=\"pt-5\"><nav aria-label=\"breadcrumb\" class=\"fixed-top\"><ol class=\"breadcrumb\"><li class=\"breadcrumb-item\"><a href=\"#bedroom\">Спальня</a></li><li class=\"breadcrumb-item\"><a href=\"#hall\">Прихожая</a></li><li class=\"breadcrumb-item\"><a href=\"#bathroom\">Санузел</a></li><li class=\"breadcrumb-item\"><a href=\"#kitchen\">Кухня</a></li> </ol> </nav> <div id=\"bedroom\" class=\"min-vh-100\"><h1 class=\"text-center font-italic pt-5\">Спальня</h1> <div class=\"container\"><div class=\"row pt-5\"> <div class=\"col\"> <div class=\"card\"><div class=\"card-body mt-1 \"><h5 class=\"card-title \">Главный свет</h5><p class=\"card-text\"></p><button type=\"button\" class=\"btn btn-success\" onclick=\"sendCommand(\'buildInLed=on\')\">Вкл</button><button type=\"button\" class=\"btn btn-danger\" onclick=\"sendCommand(\'buildInLed=off\')\">Выкл</button></div> </div> </div><div class=\"col\"><div class=\"card\"><div class=\"card-body mt-1 \"><h5 class=\"card-title \">Светильники</h5><p class=\"card-text\"></p><button type=\"button\" class=\"btn btn-success\">Вкл</button><button type=\"button\" class=\"btn btn-danger\">Выкл</button></div></div></div><div class=\"col\"><div class=\"card\"><div class=\"card-body mt-1\"><h5 class=\"card-title\">Вентиляция</h5><button type=\"button\" class=\"btn btn-success\">Вкл</button><button type=\"button\" class=\"btn btn-danger\">Выкл</button></div></div></div><div class=\"col\"><div class=\"card\"><div class=\"card-body mt-1\"><h5 class=\"card-title\">Шторы</h5><button type=\"button\" class=\"btn btn-success mt-1\">Открыть</button><button type=\"button\" class=\"btn btn-danger mt-1\">Закрыть</button></div></div></div> </div> </div> </div> <div id=\"hall\" class=\"min-vh-100\"> <h1 class=\"text-center font-italic pt-5\">Прихожая</h1> </div> <div id=\"bathroom\" class=\"min-vh-100\"> <h1 class=\"text-center font-italic pt-5\">Санузел</h1> </div> <div id=\"kitchen\" class=\"min-vh-100\"> <h1 class=\"text-center font-italic pt-5\">Кухня</h1> </div> <script src=\"https://code.jquery.com/jquery-3.4.1.slim.min.js\" integrity=\"sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n\" crossorigin=\"anonymous\"></script> <script src=\"https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js\" integrity=\"sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo\" crossorigin=\"anonymous\"></script> <script src=\"https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js\" integrity=\"sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6\" crossorigin=\"anonymous\"></script><script>function sendCommand(command) { var xhr = new XMLHttpRequest(); xhr.open(\'GET\', \'http://192.168.1.106/set?\' + command, true);xhr.send(); console.log(command);xhr.onreadystatechange = function() { if (xhr.readyState != 4) return; if (xhr.status != 200) { console.log(xhr.status + \': \' + xhr.statusText); } else { console.log(xhr.responseText); } } }</script></body></body></html>");
          break;

        case "/settings":
          res.writeHead(200,{'Content-Type': 'text/html'});
          res.end("Settings Page");
          break;

        case "/set":
          res.writeHead(200,{'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});

          for(var key in urlObj.query){
            console.log(key + " " + urlObj.query[key]);

            switch(key)
            {
              case "buildInLed":
                digitalWrite(buildInLed, urlObj.query[key] == "on" ? 0:1);
                break;
            }
          }
  
          res.end("set");
          break;

        default:
          res.writeHead(404);
          res.end("404");
          break;
      }

    }).listen(80);
  }
});