var app=require('express')();
var http = require('http').Server(app);
var io = require("socket.io")(http);
var url = require("url"), qs = require("querystring");
const util = require("util");
var flightscheduler = require("./flightscheduler");

function start(route, handle,dbh) {
    const setIntervalPromise = util.promisify(setInterval);
    setIntervalPromise(startflightscheduler,600000,'flightscheduler'); // every 10 minutes
    function startflightscheduler (value) {
        io.emit("system",value); // sent when user sends request
        flightscheduler.start(io);
    };
    app.use('/', function(request, response) {
        var postData = "";
        var pathname = url.parse(request.url).pathname;
        var querystring = qs.parse(url.parse(request.url).query);
        io.emit("system","Request for " + pathname + " received");
        if (request.url === '/upload' && request.method.toLowerCase() === 'post') {
            route(handle, dbh, pathname, querystring, response, postData, request, io);
        } else {
            request.setEncoding("utf8");
            request.addListener("data", function (postDataChunk) {
                postData += postDataChunk;
            });
            request.addListener("end", function () {
                route(handle, dbh, pathname, querystring, response, postData, request, io);
            });
        }
    });
    var port=process.env.PORT || 8888;
    http.listen(port, function() {
        io.emit("system", "Server has started");
    });
    io.on('connection',function(message){
        io.emit("system","a new WebSocket connection has been established");
    });
    io.on('server',function(message){    // not working
        io.emit("user",message);
    });
}
exports.start = start;