var http = require("http");
var wifi = require("Wifi");

var httpResult;


function main(){
  http.get("192.168.1.105", function(res) {
        httpResult = res;

        res.on('data', function(data) {
          //console.log(data);
        });

        res.on("error", () => {
          console.log("Error");
        });
  });

  setTimeout(()=>{
    if(httpResult != undefined && httpResult.statusCode == "200"){
      console.log("Ok");
    }else{
      console.log("Server is not available");
    }
  }, 1000);
}

wifi.connect("MERCUSYS_7EBA", {password: "3105vlad3010vlada"}, err => {
  if (err !== null) {
    throw err;
  }

  wifi.getIP((err, info) => {
    if (err !== null) {
      throw err;
    }else {
      main();
    }
  });
});