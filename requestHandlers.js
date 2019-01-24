﻿var fs = require('fs');
var formidable = require("formidable");
var uuid = require('node-uuid');
var buildFE = require("./buildFE");


function login(response, postData, pathname, querystring, request, dbh) {
    console.log("Request handler 'login' was called.");
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.write("OK");
    response.end();
}
function KB_x_getAll(response, postData, pathname, querystring, request, dbh) {
    console.log("Request handler 'KB_x_getAll' was called.");
    dbh.start("KB_x_getAll", response, postData, querystring);
}
function KB_x_addUpdate(response, postData, pathname, querystring, request, dbh) {
    console.log("Request handler 'KB_x_addUpdate' was called.");
    dbh.start("KB_x_addUpdate", response, postData, querystring);
}
function KB_x_delete(response, postData, pathname, querystring, request, dbh) {
    console.log("Request handler 'KB_x_delete' was called.");
    dbh.start("KB_x_delete", response, postData, querystring);
}
function KB_x_sequencePut(response, postData, pathname, querystring, request, dbh) {
    console.log("Request handler 'KB_x_sequencePut' was called.");
    dbh.start("KB_x_sequencePut", response, postData, querystring);
}
function KB_getAuto(response, postData, pathname, querystring, request, dbh) {
    console.log("Request handler 'KB_getAuto' was called.");
    dbh.start("KB_getAuto", response, postData, querystring);
}
function KB_doc(response, postData, pathname, querystring, request, dbh) {
    console.log("Request handler 'KB_doc' was called.");
    var d_m = JSON.parse(postData);
    fs.readFile(__dirname + "/doc/doc" + d_m.form + ".txt", 'utf8', function(err,data) {
        if(err) {
            // build html with references to data model
            var v, vitem11="", vheader="", vbody="", vfooter="";
            for (v in d_m.m){
                vitem11 += "{{dm.m." + d_m.m[v] + "}}";
            }
            function getArrayElements(value,index,array) {
                vitem11 += "{{dm.r." + v + "." + value + "}}";
            }
            for (v in d_m.r){
                d_m.r[v].forEach(getArrayElements);
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
                    d_m.htmlDoc=v;
                    fs.writeFile(__dirname + "/doc/doc" + d_m.form + ".txt", v, "utf8", function(err, data) {
                        dbh.start("KB_doc", response, JSON.stringify(d_m), querystring);
                    });
                }
            });

        } else {
            d_m.htmlDoc=data;
            dbh.start("KB_doc", response, JSON.stringify(d_m), querystring);
        }
    });
}
function KB_chart(response, postData, pathname, querystring, request, dbh) {
    console.log("Request handler 'KB_chart' was called.");
    fs.readFile(__dirname + "/doc/chart.html", 'utf8', function(err,data) {
        if(err){
            response.writeHead(300, { "Content-Type": "text/plain" });
            response.write("chart.html error");
            response.end();
        } else {
            dbh.start("KB_chart", response, data, querystring);
        }
    });
}
function upload(response, postData, pathname, querystring, request, dbh) {
    console.log("Request handler 'upload' was called.");
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
        console.log("The file was saved!");
    });
}
function load(response, postData, pathname, querystring, request, dbh) {
    console.log("Request handler 'load' was called.");
    buildFE.start(response, postData, pathname, querystring, request, dbh);
}
function KB_showFile(response, postData, pathname, querystring, request, dbh) {
    console.log("Request handler 'KB_showFile' was called.");
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
exports.upload = upload;
exports.load = load;
exports.login = login;
exports.KB_x_getAll = KB_x_getAll;
exports.KB_x_addUpdate = KB_x_addUpdate;
exports.KB_x_delete = KB_x_delete;
exports.KB_x_sequencePut = KB_x_sequencePut;
exports.KB_getAuto = KB_getAuto;
exports.KB_doc = KB_doc;
exports.KB_chart = KB_chart;
exports.KB_showFile = KB_showFile;
