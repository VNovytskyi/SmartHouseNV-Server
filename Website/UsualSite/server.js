console.log("Launching...");

const http = require('http');
const fs = require('fs');
const url = require('url');

// В файл
var homeLocations = [
    {id: 0, name: 'bedroom', portA: 0, portB: [0, 0, 0, 0, 0, 0]},
    {id: 1, name: 'hall', portA: 0, portB: [0, 0, 0, 0, 0, 0]},
    {id: 2, name: 'bathroom', portA: 0, portB: [0, 0, 0, 0, 0, 0]},
    {id: 3, name: 'kitchen', portA: 0, portB: [0, 0, 0, 0, 0, 0]}
];

var locationContant = [
    {id: 0},
    {id: 0},

    {id: 1}
];

const server = http.createServer(function (req, res) {
    let urlObj = url.parse(req.url, true);

    switch(urlObj.pathname)
    {
        case "/":
        case "/home":
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(homePage());
            res.end();
        break;

        //TODO: Сделать компактнее отдачу файлов
        case "/style.css":
            fs.readFile("style.css", function(err, data){
                res.writeHead(200, {'Content-Type': 'text/css'});
                res.write(data);
                res.end();
            });
        break;

        case "/signIn.css":
            fs.readFile("signIn.css", function(err, data){
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

        case "/signIn":
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(signInPage());
        break;

        case "/weather":
            res.writeHead(200, {'Content-Type': 'text/html'});
            fs.readFile("weather.html", function(err, data){
                res.write(data);
                res.end();
            });
        break;

        case "/settings":
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end("settings page");
        break;

        default:
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end("Node.js -> 404");
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

function homePage(){
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

    page += '<nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">\
                <a class="navbar-brand" href="#">SmartHouseNV</a>\
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">\
                <span class="navbar-toggler-icon"></span>\
                </button>\
                <div class="collapse navbar-collapse" id="navbarsExampleDefault">\
                    <ul class="navbar-nav mr-auto">';

                        homeLocations.forEach((hl)=>{
                            page += '<li class="nav-item active"><a class="nav-link" href="#' + hl.name + '">' + hl.name + '<span class="sr-only"></span></a></li>';
                        });
                       
               page += '<li class="nav-item dropdown">\
                            <a class="nav-link dropdown-toggle" href="http://example.com" id="dropdown01" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Other</a>\
                            <div class="dropdown-menu" aria-labelledby="dropdown01">\
                                <a class="dropdown-item" href="/weather">weather</a>\
                                <a class="dropdown-item" href="/settings">settings</a>\
                            </div>\
                        </li>\
                    </ul>\
                    <a class="btn btn-outline-primary" href="http://192.168.1.102/signIn">Sign In</a>\
                </div>\
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


function signInPage(){
    let str = "";
    
    str += '<!doctype html>\
        <html lang="en">\
        <head>\
            <meta charset="utf-8">\
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">\
            <meta name="description" content="">\
            <meta name="author" content="Mark Otto, Jacob Thornton, and Bootstrap contributors">\
            <meta name="generator" content="Jekyll v3.8.6">\
            <title>Signin Template · Bootstrap</title>\
            <link rel="canonical" href="https://getbootstrap.com/docs/4.4/examples/sign-in/">\
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">\
            <link rel="apple-touch-icon" href="/docs/4.4/assets/img/favicons/apple-touch-icon.png" sizes="180x180">\
            <link rel="icon" href="/docs/4.4/assets/img/favicons/favicon-32x32.png" sizes="32x32" type="image/png">\
            <link rel="icon" href="/docs/4.4/assets/img/favicons/favicon-16x16.png" sizes="16x16" type="image/png">\
            <link rel="manifest" href="/docs/4.4/assets/img/favicons/manifest.json">\
            <link rel="mask-icon" href="/docs/4.4/assets/img/favicons/safari-pinned-tab.svg" color="#563d7c">\
            <link rel="icon" href="/docs/4.4/assets/img/favicons/favicon.ico">\
            <meta name="msapplication-config" content="/docs/4.4/assets/img/favicons/browserconfig.xml">\
            <meta name="theme-color" content="#563d7c">\
            <link href="signIn.css" rel="stylesheet">\
        </head>\
        <body class="text-center">\
            <form class="form-signin">\
            <img class="mb-4" src="/docs/4.4/assets/brand/bootstrap-solid.svg" alt="" width="72" height="72">\
            <h1 class="h3 mb-3 font-weight-normal">SmartHouseNV</h1>\
            <label for="inputEmail" class="sr-only">Email address</label>\
            <input type="Email" id="inputEmail" class="form-control" placeholder="Email address" required autofocus>\
            <label for="inputPassword" class="sr-only">Password</label>\
            <input type="password" id="inputPassword" class="form-control" placeholder="Password" required>\
            <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>\
            <p class="mt-5 mb-3 text-muted"></p>\
            </form>\
            </body>\
        </html>';

    return str;
}