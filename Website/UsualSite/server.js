const http = require('http');
const fs = require('fs');
const url = require('url');
const WebSocket = require('ws');

var homeLocations = [];
var elementTypes = [];
var locationElements = [];

const server = http.createServer(function (req, res) {
    let homeLocation;
    let homeLocationIndex, elementTitle, port;

    let urlObj = url.parse(req.url, true);

    var data;

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

        case "/addNewLocationElement":
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end();
            
            homeLocation = getIndexByTitle(homeLocations, urlObj.query['homeLocation']);

            if(homeLocation == null){
                
                break;
            }
            
            homeLocationIndex = homeLocation.idHomeLocation;

            typeIndex = getIndexByTitle(elementTypes, urlObj.query['type']).idElementType;
           
            elementTitle = urlObj.query['title'];
            port = urlObj.query['port'];

            console.log("Add: " + urlObj.query['homeLocation'] + "(" + homeLocationIndex + ") - " + urlObj.query['type'] + "(" + typeIndex + ") - " + elementTitle + " - " + port);

            executeRequest("INSERT INTO `locationelement` (`idLocationElement`, `idHomeLocation`, `idElementType`, `title`, `port`) VALUES (NULL, " + homeLocationIndex +  ", " + typeIndex + ", '" + elementTitle + "', '" + port +"')", updateDataFromDB);
        break;

        case "/getHomeLocations":
            res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});

            data = JSON.stringify(homeLocations);

            console.log(data);
            res.write(data);
            res.end();
        break;

        case "/getElementTypes":
            res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});

            data = JSON.stringify(elementTypes);

            console.log(data);
            res.write(data);
            res.end();
        break;

        case "/getLocationElements":
            res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});

            data = JSON.stringify(locationElements);

            console.log(data);
            res.write(data);
            res.end();
        break;

        case "/deleteLocationElement":
            res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
            res.end();

            homeLocationIndex = getIndexByTitle(homeLocations, urlObj.query['homeLocation']);
            homeLocationIndex = homeLocationIndex.idHomeLocation;

            elementTitle = urlObj.query['title'];

            console.log("Delete: " + urlObj.query['homeLocation'] + "(" + homeLocationIndex + ") - " + elementTitle);
            
            executeRequest("DELETE FROM `locationelement` WHERE `idHomeLocation` = " + homeLocationIndex + " AND `title` = '" + elementTitle + "'", updateDataFromDB);
        break;

        default:
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end("Node.js -> 404");
            console.log(urlObj);
        break;
    }

}).listen(88);

const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {

    console.log('New client');

    ws.on('message', function incoming(message) {
      console.log('Received: %s', message);
      console.log(typeof(message));
      console.log(message);
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

function getIndexByTitle(arr, title){
    let element = null;
    
    for(let i = 0; i < arr.length; ++i){
        if(title == arr[i].title){
            element = arr[i];
            break;
        }
    }

    return element;
}

function executeRequest(request, callback){
    
    connection.query(request,
        function(err, results, fields) {
            if(err == null){
               console.log("Query ok");
               
               if(callback != undefined){
                   callback();
               }
            }
            else{
                console.log("Error from MySQL");
                console.log("Request: " + request);
                console.log(err);
            }
    });
}

const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "vladyslavN",
  database: "smartHouseNV",
  password: "3105Vlad3010Vlada"
});

connection.connect(function(err){
    if (err) {
      return console.error("Ошибка: " + err.message);
    }
    else{
      console.log("Подключение к серверу MySQL успешно установлено");
    }
});

function updateDataFromDB(){
    console.log("Update data from DB");

    homeLocations = [];
    connection.query("SELECT * FROM homeLocation Order by idhomelocation Asc",
        function(err, results, fields) {
            if(err == null){
                results.forEach(el => {
                    homeLocations.push(el);
                });
    
               console.log(homeLocations);
               updateWebPage();
            }
            else{
                console.log(err);
            }
    });
    
    elementTypes = [];
    connection.query("SELECT * FROM elementType ORDER BY idElementType ASC",
        function(err, results, fields) {
            if(err == null){
                results.forEach(el => {
                    elementTypes.push(el);
                });
    
                console.log(elementTypes);
                updateWebPage()
            }
            else{
                console.log(err);
            }
    });
    
    locationElements = [];
    connection.query("SELECT * FROM locationElement ORDER BY idlocationElement ASC",
        function(err, results, fields) {
            if(err == null){
                results.forEach(el => {
                    locationElements.push(el);
                });
    
                console.log(locationElements);
                updateWebPage();
            }
            else{
                console.log(err);
            }
    });
}
updateDataFromDB();


var countUpdateArrays = 3;
var currentCountUpdateArrays = 0;
var serverInit = true;

function updateWebPage(){

    ++currentCountUpdateArrays;

    if(currentCountUpdateArrays == countUpdateArrays){
        let page = homePage();
        let message = [{name: 'body', value: page}];
        wss.clients.forEach(cl => cl.send(JSON.stringify(message)));

        currentCountUpdateArrays = 0;
        console.log("Send updated web-page");
    }
}







/*********************************** Pages ************************************************/

function homePage(){
    let page = "";

    page += '<!DOCTYPE html>\
            <html lang="en">\
            <head>\
                <meta charset="UTF-8">\
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>\
                <title>SmartHouseNV</title>\
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">\
                <script src="https://kit.fontawesome.com/052fa37aec.js" crossorigin="anonymous"></script>\
                <link rel="stylesheet" type="text/css" href="style.css">\
            </head>';

    page += '<body class="pt-5">\
              <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">\
                <a class="navbar-brand" href="#">SmartHouseNV</a>\
                <button id="toggleNavBarB" class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">\
                <span id="toggleNavBarS" class="navbar-toggler-icon"></span>\
                </button>\
                <div class="collapse navbar-collapse" id="navbarsExampleDefault">\
                    <ul class="navbar-nav mr-auto">';

                        homeLocations.forEach((hl)=>{
                            page += '<li class="nav-item active"><a class="nav-link" href="#' + hl.title + '">' + hl.title + '<span class="sr-only"></span></a></li>';
                        });
                       
    page +=            '<li class="nav-item dropdown">\
                            <a id="dropDownToggle" class="nav-link dropdown-toggle" href="http://example.com" id="dropdown01" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Other</a>\
                            <div class="dropdown-menu" aria-labelledby="dropdown01">\
                                <a class="dropdown-item" href="/weather">weather</a>\
                                <a class="dropdown-item mb-2" href="/settings">settings</a>\
                                <div class="dropdown-item">';
    
    page += '<input type="checkbox" id="editMode">';
    
    
    page +=                    '<label class="ml-2"> Edit mode</label>\
                                </div>\
                            </div>\
                        </li>\
                    </ul>\
                    <a class="btn btn-outline-primary" href="http://192.168.1.102/signIn">Sign In</a>\
                </div>\
            </nav>';
    
    for(let i = 0; i < homeLocations.length; ++i){
        if(i % 2 == 0){
            page += '<div id="' + homeLocations[i].title + '" class="min-vh-100">';
        }
        else{
            page += '<div id="' + homeLocations[i].title + '" class="min-vh-100 bg-light">';
        }

        page += '<h1 class="text-center font-italic pt-5">' + homeLocations[i].title + '</h1>\
                 <div class="container mt-4">\
                    <div class="row">';

        // homeLocation contant
        for(let j = 0; j < locationElements.length; ++j){
            if(locationElements[j].idHomeLocation == homeLocations[i].idHomeLocation){
                let idElement = locationElements[j].idElementType;
                let elementTitle = elementTypes[idElement - 1].title;
                let locationTitle = locationElements[j].title;

                //console.log(homeLocations[i].title + " - " + locationTitle + " - " + elementTitle + " - " + locationElements[j].port);
                
                let colmd = "col-md-3";
                let buff = "";

                switch(elementTitle){
                    case "SimpleButton":
                        buff += '<button type="button" class="btn btn-outline-success">Click</button>';
                        break;
                    
                    case "DoubleButton":
                        buff += '<div class="btn-group">\
                                    <button type="button" class="btn btn-outline-success">On</button>\
                                    <button type="button" class="btn btn-outline-danger">Off</button>\
                                </div>';
                        break;

                    case "TripleButton":
                        buff += '<div class="btn-group">\
                                    <button type="button" class="btn btn-outline-success">Open</button>\
                                    <button type="button" class="btn btn-outline-warning">Stop</button>\
                                    <button type="button" class="btn btn-outline-danger">Close</button>\
                                </div>'
                        break;

                    case "ChangingButton":
                        buff += '<button name="' + locationElements[j].port + '" type="button" class="btn btn-success">Включить</button>';
                        break;
                            
                    case "Range":
                        colmd = "col-md-6";
                        buff += '<input name="' + locationElements[j].port + '" type="range" min="1" max="100" value="0" class="slider">';
                        break;
                    
                    case "ColorPicker":
                        buff += '<input name="' + locationTitle + '" type="color" value="#fd3cf8">\
                                 <div class="btn-group">\
                                    <button type="button" class="btn btn-outline-success">On</button>\
                                    <button type="button" class="btn btn-outline-danger">Off</button>\
                                 </div>';
                        break;
                }

                page += '<div class="'+ colmd + ' mb-4">\
                            <div class="card">\
                                <div class="card-body mt-1">\
                                <div name="editButtons" class="text-right d-none">\
									<button type="button" style="border: none;background: inherit;">\
										<i title="delete" class="fas fa-times-circle text-danger"></i>\
									</button>\
								</div>\
                                    <h5 class="card-title ">' + locationTitle + '</h5>';
               /*
                    <button type="button" style="border: none;background: inherit;">\
						<i title="edit" class="far fa-edit text-muted"></i>\
					</button>\
               */
                page += buff;
            
                page += '</div></div></div>';
            }
        }

       
            page += '</div><div name="addForm" class="row d-none center-block">\
                        <div class="col-md-3 mb-4">\
                            <div class="card">\
                                <div class="card-body mt-1">\
                                    <h5 class="card-title"><i class="fas fa-plus-square"></i>Add new item</h5>\
                                    <label class="sr-only" for="inlineFormInputGroup">Username</label>\
                                    <div class="input-group mb-2">\
                                        <div class="input-group-prepend">\
                                            <div class="input-group-text">Label</div>\
                                        </div>\
                                        <input name="title" type="text" class="form-control" value="" placeholder="Enter title">\
                                    </div>\
                                    \
                                    <div class="input-group mb-2">\
                                        <div class="input-group-prepend">\
                                        <label class="input-group-text">Type</label>\
                                        </div>\
                                        <select name="selectType" class="custom-select">\
                                            <option>Select type</option>';
                                       
                                        
                                        elementTypes.forEach(el => {
                                            page += '<option>' + el.title + '</option>';
                                        });


                                       page+='</select>\
                                    </div>\
                                    <div class="input-group mb-3">\
                                        <div class="input-group-prepend">\
                                            <label class="input-group-text" for="inputGroupSelect01">Port</label>\
                                        </div>\
                                        <select name="port" class="custom-select">\
                                            <option>Select port</option>\
                                            <option>A0</option>\
                                            <option>A1</option>\
                                            <option>A2</option>\
                                            <option>A3</option>\
                                            <option>A4</option>\
                                            <option>A5</option>\
                                            <option>A6</option>\
                                            <option>A7</option>\
                                            <option>A8</option>\
                                            <option>A9</option>\
                                            <option>A10</option>\
                                            <option>A11</option>\
                                            <option>A12</option>\
                                            <option>A13</option>\
                                            <option>A14</option>\
                                            <option>A15</option>\
                                            <option>B0</option>\
                                            <option>B1</option>\
                                            <option>B2</option>\
                                            <option>B3</option>\
                                            <option>B4</option>\
                                            <option>B5</option>\
                                        </select>\
                                    </div>\
                                    <a name="addButton" title="add" class="btn btn-success w-100 text-light">Add</a>\
                                </div>\
                            </div>\
                        </div>\
                    </div>';
        
                
        page += '</div></div></div>';
    }
    
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
