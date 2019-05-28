var fs = require('fs');
var ip = require("ip");

var t_HTML = "";
var t_Script = "";
var t_model = "";

function start(response, postData, pathname, querystring, request, dbh, io) {
    io.emit("Request handler 'buildFE' was called");
    var floc = __dirname + "/frontEnd/";
    fs.readFile(floc + "HTML.html", 'utf8',
        function (err, data) {
            if (err) {
                response.writeHead(300, { "Content-Type": "text/plain" });
                response.write("HTML not loaded");
                response.end();
                io.emit("HTML not loaded");
            } else {
                t_HTML = data;
                fs.readFile(floc + "Script.js", 'utf8',
                    function (err, data) {
                        if (err) {
                            response.writeHead(300, { "Content-Type": "text/plain" });
                            response.write("Script not loaded");
                            response.end();
                            io.emit("Script not loaded");
                        } else {
                            t_Script = data;
                            if (querystring.module === undefined) {
                                querystring.module = "KB";
                            }
                            querystring.return = 0; // any
                            dbh.start("KB_buildModel", response, postData, querystring, io,
                                function (err, data) {
                                    if (err) {
                                        response.writeHead(300, { "Content-Type": "text/html" });
                                        response.write("not found");
                                        response.end();
                                    } else {
                                        t_model = JSON.parse(data);
                                        //console.log(t_model.Files[0].infoJSON.code); // html
                                        //console.log(t_model.Files[1].infoJSON.code); // script
                                        t_model.Files = null; // extract HTML.html and Script.js before
                                        t_HTML = t_HTML.replace("<!--htmlSearch-->", t_model.htmlSearch);
                                        t_HTML = t_HTML.replace("<!--htmlList-->", t_model.htmlList);
                                        t_HTML = t_HTML.replace("<!--htmlEdit-->", t_model.htmlEdit);
                                        t_HTML = t_HTML.replace("<!--htmlView-->", t_model.htmlView);
                                        t_model.htmlSearch = null;
                                        t_model.htmlList = null;
                                        t_model.htmlEdit = null;
                                        t_model.htmlView = null;
                                        t_Script = t_Script.replace("//$scope.x_o//", "$scope.x_o=" + JSON.stringify(t_model) + ";");
                                        ipv = ip.address();
                                        var h;
                                        if(ipv.includes("172.22")){
                                            h='sloc="http://' + ipv.trim() + ':8888/";floc = "file:///' + __dirname + '/UploadedFiles/";';
                                        }
                                        else {
                                            h='sloc="http://mcmax.azurewebsites.net/";floc="http://mcmax.azurewebsites.net/UploadedFiles/";';
                                        }
                                        t_HTML = t_HTML.replace("//Script.js//", h + t_Script);
                                        response.writeHead(200, { "Content-Type": "text/html" });
                                        response.write(t_HTML);
                                        response.end();
                                    }
                                });
                        }
                    });
            }
        });
}
exports.start = start;