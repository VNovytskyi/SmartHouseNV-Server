console.log("Launching...");

const http = require('http');
const fs = require('fs');
const url = require('url');

var homeLocations = [
    {id: 0, name: 'bedroom', portA: 0, portB: [0, 0, 0, 0, 0, 0]},
    {id: 1, name: 'hall', portA: 0, portB: [0, 0, 0, 0, 0, 0]},
    {id: 2, name: 'bathroom', portA: 0, portB: [0, 0, 0, 0, 0, 0]},
    {id: 3, name: 'kitchen', portA: 0, portB: [0, 0, 0, 0, 0, 0]}
];

const server = http.createServer(function (req, res) {
    let urlObj = url.parse(req.url, true);

    switch(urlObj.pathname)
    {
        case "/":
        case "/home":
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(mainPage());
            res.end();
        break;

        case "/style.css":
            fs.readFile("style.css", function(err, data){
                res.writeHead(200, {'Content-Type': 'text/css'});
                res.write(data);
                res.end();
            });
        break;

        case "/usualSite.js":
            fs.readFile("usualSite.js", function(err, data){
                res.writeHead(200, {'Content-Type': 'text/css'});
                res.write(data);
                res.end();
            });
        break;

        case "/settings":
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end("Settings Page");
        break;

        default:
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end("404");
        break;
    }

}).listen(80);


const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {

    console.log('New client');

    ws.on('message', function incoming(message) {
      console.log('Received: %s', message);
      wss.clients.forEach(cl => cl.send(message));
    });

    ws.on('error', event => {
        console.log("Error: " + event);
    });
    
    ws.on('close', function close() {
        console.log('Client disconnected');
    });

    //bringUpToDate(ws);
});


function mainPage(){
    let page = "";

    page += '<!DOCTYPE html>\
            <html lang="en">\
            <head>\
                <meta charset="UTF-8">\
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>\
                <title>SmartHouseNV</title>\
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">\
                <link rel="stylesheet" type="text/css" href="style.css">\
            </head>\
            <body class="pt-5">';
    
    page += '<nav aria-label="breadcrumb" class="fixed-top">\
                <ol class="breadcrumb">';
     
    homeLocations.forEach((hl)=>{
        page += '<li class="breadcrumb-item"><a href="#' + hl.name + '">' + hl.name + '</a></li>';
    });

    page += '   </ol>\
            </nav>';
    
    page += '<div id="bedroom" class="min-vh-100">\
                <h1 class="text-center font-italic pt-5">Спальня</h1>\
                <div class="container">\
                    <div class="row pt-5">\
                        <div class="col-md">\
                            <div class="card">\
                                <div class="card-body mt-1">\
                                    <h5 class="card-title ">Главный свет</h5>\
                                    <button id="A0" type="button" class="btn btn-success">Включить</button>\
                                </div>\
                            </div>\
                        </div>\
                        <div class="col-md">\
                            <div class="card">\
                                <div class="card-body mt-1">\
                                    <h5 class="card-title ">Светильник</h5>\
                                    <button id="A1" type="button" class="btn btn-success">Включить</button>\
                                </div>\
                            </div>\
                        </div>\
                        <div class="col-md">\
                            <div class="card">\
                                <div class="card-body mt-1">\
                                    <h5 class="card-title">Вентиляция</h5>\
                                    <div id="debug"></div>\
                                    <div class="slidecontainer">\
                                        <!--TODO: Реализовать работу на телефоне. На событие click не реагирует-->\
                                        <input id="B0" type="range" min="1" max="100" value="50" class="slider">\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                        <div class="col-md">\
                            <div class="card">\
                                <div class="card-body mt-1">\
                                    <h5 class="card-title">Шторы</h5>\
                                    <!-- TODO: Шкала прогресса открытия штор. После открытия кнопка меняется на Закрыть -->\
                                    <button type="button" class="btn btn-success mt-1">Открыть</button>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
                <div class="container">\
                    <div class="row pt-5">\
                        <div class="col-md">\
                            <div class="card">\
                                <div class="card-body mt-1 ">\
                                    <h5 class="card-title ">RGB подсветка</h5>\
                                    <input type="color" name="" id="ColorRGB" value="#fd3cf8">\
                                    <!-- <input type="range" name="" id="ColorRGB"> -->\
                                    <p class="card-text"></p>\
                                    <button type="button" class="btn btn-success">Включить</button>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            </div>';

    page += '<div id="hall" class="min-vh-100">\
                <h1 class="text-center font-italic pt-5">Прихожая</h1>\
            </div>\
            <div id="bathroom" class="min-vh-100">\
                <h1 class="text-center font-italic pt-5">Санузел</h1>\
            </div>\
            <div id="kitchen" class="min-vh-100">\
                <h1 class="text-center font-italic pt-5">Кухня</h1>\
            </div>';

    page += '<script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script>\
             <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>\
             <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>\
             <script src="usualSite.js"></script>';

    page += '</body>\
             </html>';

    return page;
}