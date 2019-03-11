var fs = require('fs');
var formidable = require("formidable");
var uuid = require('uuid/v1');
var buildFE = require("./buildFE");


function KB_x_getAll(response, postData, pathname, querystring, request, dbh, io) {
    io.emit("system","Request handler 'KB_x_getAll' was called");
    dbh.start("KB_x_getAll", response, postData, querystring, io);
}
function KB_x_addUpdate(response, postData, pathname, querystring, request, dbh, io) {
    io.emit("system","Request handler 'KB_x_addUpdate' was called");
    dbh.start("KB_x_addUpdate", response, postData, querystring, io);
}
function KB_x_delete(response, postData, pathname, querystring, request, dbh, io) {
    io.emit("system","Request handler 'KB_x_delete' was called");
    dbh.start("KB_x_delete", response, postData, querystring, io);
}
function KB_x_sequencePut(response, postData, pathname, querystring, request, dbh, io) {
    io.emit("system","Request handler 'KB_x_sequencePut' was called");
    dbh.start("KB_x_sequencePut", response, postData, querystring, io);
}
function KB_getAuto(response, postData, pathname, querystring, request, dbh, io) {
    io.emit("system","Request handler 'KB_getAuto' was called");
    dbh.start("KB_getAuto", response, postData, querystring, io);
}
function KB_table(response, postData, pathname, querystring, request, dbh, io) {
    io.emit("system","Request handler 'KB_table' was called");
    dbh.start("KB_table", response, postData, querystring, io);
}
function KB_query(response, postData, pathname, querystring, request, dbh, io) {
    io.emit("system","Request handler 'KB_query' was called");
    dbh.start("KB_query", response, postData, querystring, io);
}
function KB_bDB(response, postData, pathname, querystring, request, dbh, io) {
    io.emit("system","Request handler 'KB_bDB' was called");
    dbh.start("KB_bDB", response, postData, querystring, io);
}
function KB_cModule(response, postData, pathname, querystring, request, dbh, io) {
    io.emit("system","Request handler 'KB_cModule' was called");
    dbh.start("KB_cModule", response, postData, querystring, io);
}
function KB_doc(response, postData, pathname, querystring, request, dbh, io) {
    io.emit("system","Request handler 'KB_doc' was called");
    var d_m = JSON.parse(postData);
    fs.readFile(__dirname + "/doc/doc" + d_m.form + ".txt", 'utf8', function(err,data) {
        if(err) {
            // build html with references to data model
            var v, vitem11="", vheader="", vbody="", vfooter="", vgrandchildren = "";
            for (v in d_m.m){
                vitem11 += "{{dm.m." + d_m.m[v] + "}}";
            }
            function getArrayElements(value,index,array) {
                vitem11 += "{{dm.r." + v + "." + value + "}}";
            }
            for (v in d_m.r){
                d_m.r[v].forEach(getArrayElements);
            }
            function getArrayElementsHeader(value,index,array) {
                vgrandchildren += "<th>" + value + "</th>";
            }
            function getArrayElementsBody(value,index,array) {
                vgrandchildren += "<td>{{body." + value + "}}</td>";
            }
            for (v in d_m.g){
                vgrandchildren += "<hr><hr><hr><div>Annex: " + v + "<table><thead><tr><th>date</th>";  // date as link
                d_m.g[v].forEach(getArrayElementsHeader);
                vgrandchildren += "</tr></thead><tbody><tr ng-repeat='body in dm.g." + v + "'><td><span ng-bind=\"body.date1 | date:'dd.MM.yyyy'\"></span></td>";  // date as link
                d_m.g[v].forEach(getArrayElementsBody);
                vgrandchildren += "</tr></tbody></table></div>";
            }
            for (v in d_m.i){
                vheader += "<th>" + d_m.i[v] + "</th>";
                vbody += "<td>{{body." + d_m.i[v] + "}}</td>";
                vfooter += "<td>{{dm.if." + d_m.i[v] + "}}</td>";
            }
            fs.readFile(__dirname + "/doc/doc.txt", 'utf8', function(err,data) {
                if(err){
                    response.writeHead(300, { "Content-Type": "text/plain" });
                    response.write("doc.html error");
                    response.end();
                } else {
                    var v = data;
                    v = v.replace("<!--item11-->", vitem11);
                    v = v.replace("<!--heading-->", vheader);
                    v = v.replace("<!--body-->", vbody);
                    v = v.replace("<!--footer-->", vfooter);
                    v = v.replace("<!--grandchildren-->", vgrandchildren);
                    d_m.htmlDoc=v;
                    fs.writeFile(__dirname + "/doc/doc" + d_m.form + ".txt", v, "utf8", function(err, data) {
                        dbh.start("KB_doc", response, JSON.stringify(d_m), querystring, io);
                    });
                }
            });

        } else {
            d_m.htmlDoc=data;
            dbh.start("KB_doc", response, JSON.stringify(d_m), querystring, io);
        }
    });
}
function KB_chart(response, postData, pathname, querystring, request, dbh, io) {
    io.emit("system","Request handler 'KB_chart' was called");
    fs.readFile(__dirname + "/doc/chart.html", 'utf8', function(err,data) {
        if(err){
            response.writeHead(300, { "Content-Type": "text/plain" });
            response.write("chart.html error");
            response.end();
        } else {
            dbh.start("KB_chart", response, data, querystring, io);
        }
    });
}
function KB_carousel(response, postData, pathname, querystring, request, dbh, io) {
    io.emit("system","Request handler 'KB_carousel' was called");
    fs.readFile(__dirname + "/doc/carousel.html", 'utf8', function(err,data) {
        if(err){
            response.writeHead(300, { "Content-Type": "text/plain" });
            response.write("carousel.html error");
            response.end();
        } else {
            var h = data.replace("//model//",postData);
            response.writeHead(200, { "Content-Type": "text/plain" });
            response.write(h);
            response.end();
        }
    });
}
function upload(response, postData, pathname, querystring, request, dbh, io) {
    io.emit("system","Request handler 'upload' was called");
    var form = new formidable.IncomingForm();
    form.parse(request, function (error, fields, files) {
        var vfn1 = "F_" + uuid.v1() + files.UploadedImage.name;
        var vfn = __dirname + "/UploadedFiles/" + vfn1;
        fs.rename(files.UploadedImage.path, vfn, function (error) {
            if (error) {
                fs.unlink(vfn);
                fs.rename(files.UploadedImage.path, vfn);
            }
        });
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.write(vfn1);
        response.end();
        io.emit("system","The file was saved");
    });
}
function load(response, postData, pathname, querystring, request, dbh, io) {
    io.emit("system","Request handler 'load' was called");
    buildFE.start(response, postData, pathname, querystring, request, dbh, io);
}
function KB_getStats(response, postData, pathname, querystring, request, dbh, io) {
    io.emit("system","Request handler 'KB_getStats' was called");
    dbh.start("KB_getStats", response, postData, querystring, io);
}
function KB_sendMessage(response, postData, pathname, querystring, request, dbh, io) {
    io.emit("system","Request handler 'KB_sendMessage' was called");
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.write("OK");
    response.end();
    io.emit("user",postData);
}
function KB_showFile(response, postData, pathname, querystring, request, dbh, io) {
    io.emit("system","Request handler 'KB_showFile' was called");
    if(pathname == undefined || pathname == "") {
        var floc = __dirname + "index.html";
        fs.readFile(floc + pathname, 'utf8',
            function (err, data) {
                if (err) {
                    response.writeHead(300, { "Content-Type": "text/plain" });
                    response.write("index not loaded");
                    response.end();
                } else {
                    response.writeHead(200, { "Content-Type": "text/html" });
                    response.write(data);
                    response.end();
                }
            }
        );
    } else {
        var floc = __dirname + "/doc/";
        fs.readFile(floc + pathname, 'utf8',
            function (err, data) {
                if (err) {
                    response.writeHead(300, { "Content-Type": "text/plain" });
                    response.write("file not loaded");
                    response.end();
                } else {
                    response.writeHead(200, { "Content-Type": "text/html" });
                    response.write(data);
                    response.end();
                }
            }
        );
    }
}
exports.upload = upload;
exports.load = load;
exports.KB_x_getAll = KB_x_getAll;
exports.KB_x_addUpdate = KB_x_addUpdate;
exports.KB_x_delete = KB_x_delete;
exports.KB_x_sequencePut = KB_x_sequencePut;
exports.KB_getAuto = KB_getAuto;
exports.KB_doc = KB_doc;
exports.KB_chart = KB_chart;
exports.KB_carousel = KB_carousel;
exports.KB_table = KB_table;
exports.KB_query = KB_query;
exports.KB_bDB = KB_bDB;
exports.KB_cModule = KB_cModule;
exports.KB_showFile = KB_showFile;
exports.KB_getStats = KB_getStats;
exports.KB_sendMessage = KB_sendMessage;
