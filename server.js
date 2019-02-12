var http = require('http'), url = require("url"), qs = require("querystring");

function start(route, handle,dbh) {
    function onRequest(request, response) {
        var postData = "";
        var pathname = url.parse(request.url).pathname;
        var querystring = qs.parse(url.parse(request.url).query);
        console.log("Request for " + pathname + " received.");
        if (request.url === '/upload' && request.method.toLowerCase() === 'post') {
            route(handle, dbh, pathname, querystring, response, postData, request);
        } else {
            request.setEncoding("utf8");
            request.addListener("data", function (postDataChunk) {
                postData += postDataChunk;
            });
            request.addListener("end", function () {
                route(handle, dbh, pathname, querystring, response, postData, request);
            });
        }
    }
    var port=process.env.PORT || 8888;
//    var port=1337;
    http.createServer(onRequest).listen(port, "0.0.0.0");
    console.log("Server has started.");
}
exports.start = start;
