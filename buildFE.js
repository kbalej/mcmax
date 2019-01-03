// one parameter: module name
//
// read HTML.html
// read Script.js
// build Model
// add templates to HTML
// add stringified Model to Script
// add (minified) Script to HTML
// later: add Css min to HTML
// later: add Libs min to HTML
// return (minified) HTML
//
// one return: single HTML

var fs = require('fs');

var t_HTML = "";
var t_Script = "";
var t_model = "";

function start(response, postData, pathname, querystring, request, dbh) {
    console.log("Request handler 'buildFE' was called.");
    fs.readFile("/Users/Admin/OneDrive/p_A/frontEnd/HTML.html", 'utf8',
        function (err, data) {
            if (err) {
                response.writeHead(300, { "Content-Type": "text/plain" });
                response.write("HTML not loaded");
                response.end();
                console.log("HTML not loaded");
            } else {
                t_HTML = data;
                fs.close;
                fs.readFile("/Users/Admin/OneDrive/p_A/frontEnd/Script.js", 'utf8',
                    function (err, data) {
                        if (err) {
                            response.writeHead(300, { "Content-Type": "text/plain" });
                            response.write("Script not loaded");
                            response.end();
                            console.log("Script not loaded");
                         } else {
                            t_Script = data;
                            fs.close;
                            if (querystring.module === undefined) {
                                querystring.module = "KB";
                            }
                            querystring.return = 0; // any
                            dbh.start("KB_buildModel", response, postData, querystring,
                                function (err, data) {
                                    t_model = JSON.parse(data);
                                    t_HTML = t_HTML.replace("<!--htmlSearch-->", t_model.htmlSearch);
                                    t_HTML = t_HTML.replace("<!--htmlList-->", t_model.htmlList);
                                    t_HTML = t_HTML.replace("<!--htmlEdit-->", t_model.htmlEdit);
                                    t_HTML = t_HTML.replace("<!--htmlView-->", t_model.htmlView);
                                    t_model.htmlSearch = null;
                                    t_model.htmlList = null;
                                    t_model.htmlEdit = null;
                                    t_model.htmlView = null;
                                    t_Script = t_Script.replace("//$scope.x_o//", "$scope.x_o=" + JSON.stringify(t_model) + ";");
                                    t_HTML = t_HTML.replace("//Script.js//", t_Script);
                                    response.writeHead(200, { "Content-Type": "text/html" });
                                    response.write(t_HTML);
                                    response.end();
                                });
                        }
                    });
            }
        });
}
exports.start = start;