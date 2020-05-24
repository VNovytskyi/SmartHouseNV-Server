exports.getTestPage = function(res){
    for(let i = 0; i < 100; ++i){
        res.write("<p>This is test page " + i + " / 100</p>");
    }
}

exports.getHomePage = function(res){
    
}


exports.signInPage = function(res){
    
}