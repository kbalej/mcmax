var fs = require('fs');
var formidable = require("formidable");
var uuid = require('node-uuid');
var buildFE = require("./buildFE");


function login(response, postData, pathname, querystring, request, dbh) {
    console.log("Request handler 'login' was called.");
    console.log("You've sent: " + postData);
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
function KB_x_getAuto(response, postData, pathname, querystring, request, dbh) {
    console.log("Request handler 'KB_x_getAuto' was called.");
    dbh.start("KB_x_getAuto", response, postData, querystring);
}
function KB_x_doc(response, postData, pathname, querystring, request, dbh) {
    console.log("Request handler 'KB_x_doc' was called.");
    //dbh.start("KB_x_doc", response, postData, querystring);
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
exports.upload = upload;
exports.load = load;
exports.login = login;
exports.KB_x_getAll = KB_x_getAll;
exports.KB_x_addUpdate = KB_x_addUpdate;
exports.KB_x_delete = KB_x_delete;
exports.KB_x_sequencePut = KB_x_sequencePut;
