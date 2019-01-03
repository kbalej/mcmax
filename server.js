﻿var http = require('http'), url = require("url"), qs = require("querystring");

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
                console.log("Received POST data chunk '" + postDataChunk + "'.");
            });
            request.addListener("end", function () {
                route(handle, dbh, pathname, querystring, response, postData, request);
            });
        }
    }
    http.createServer(onRequest).listen(8888, "0.0.0.0");
    console.log("Server has started.");
}
exports.start = start;
