'use strict';
function start(connection,callback) {
    var Request = require('tedious').Request;
    var fs = require('fs');
    var util = require('util');
    var EventEmitter = require('events').EventEmitter;

    EventEmitter.defaultMaxListeners=200;
    var cvt = function (result) {
        var o = [];
        for (var x in result) {
            try {
                result[x].infoJSON = JSON.parse(result[x].infoJSON);
            } catch (e) {
                console.log(result[x].infoJSON + "  xxxxxxxxxxxxxx " + x);
            }
            o.push(result[x]);
        }
        return o;
    };
    var oReadFile = function () {
        oReadFile.prototype.handle = function (m, vfile) {
            getFile(m,vfile);
            function getFile(m,vfile) {
                fs.readFile(vfile, 'utf8',
                    function (err, data) {
                        if(err){
                            m.emit('done', "");

                        }else{
                            m.emit('done', data);
                        }
                    }
                );
            }
        };
    };
    var oUpdateTable = function () {
        oUpdateTable.prototype.handle = function (pID, pJson, m2, connection, done) {
            queryDatabase(pID, pJson, m2, connection, done);
            function queryDatabase(pID, pJson, m2, connection, done) {
                var vsql = "UPDATE KB_functions SET infoJSON = '" + JSON.stringify(pJson) + "' WHERE ID = '" + pID + "';";
                var request10 = new Request(vsql, function () {});
                request10.on('requestCompleted', function () {
                    var status = "OK";
                    if(done == "done2") {
                        m2.emit("done2", status);
                    }else{
                        m2.emit("done3", status);
                    }
                });
                connection.execSql(request10);                
            }
        };
    };

    var vrows = "";
    var vsql = "SELECT count(*) RC FROM KB_functions FOR JSON PATH;SELECT * FROM KB_functions ORDER BY sequence for json path;";
    var request1 = new Request(vsql, function () {});
    request1.on('row', function (rows) {
        vrows += rows[0].value;
    });
    request1.on('requestCompleted', function () {
        var t = "[" + vrows.replace("}][{", "}],[{") + "]";
        var tt = JSON.parse(t);
        var xF = cvt(tt[1]); // array of functions rows order1ed by sequence, ID... to infoJSON
        var xFf = xF.filter(function (e) {
            return e.infoJSON.type == "frontEnd" || e.infoJSON.type == "node";
        });
        util.inherits(oReadFile, EventEmitter);
        var Script = "";
        var aU = []; // {"ID":"","infoJSON":""}
        var m = new oReadFile();
        var f = xFf.pop();
        var floc = __dirname + "/" + f.infoJSON.name;
        m.on('done', function (result) {
            if(result==""){console.log("empty system file " + f.name);}
            if(f.name=="frontEnd/Script.js"){Script=result}
            var o = {};
            o.ID = f.ID;
            var h = f.infoJSON;
            h.code = result.replace(/"/gi, '\"').replace(/'/gi, '\"').trim();
            o.infoJSON = h;
            aU.push(o);
            f = xFf.pop();
            if (f !== undefined && f !== null) {
                floc = __dirname + "/" + f.infoJSON.name;
                m.handle(m, floc);
            }else{
                util.inherits(oUpdateTable, EventEmitter);
                var m2 = new oUpdateTable();
                var el = aU.pop();
                m2.on('done2', function (result) {
                    el = aU.pop();
                    if(el !== undefined) {
                        m2.handle(el.ID, el.infoJSON, m2, connection, "done2");
                    }else{
                        var  functions = Script.split("//..");
                        var main = "";
                        for(var x in functions){
                            var fu = functions[x].substr(0,40);
                            var fue=fu.split("=");
                            if(!fue[0].includes("//autoSlocFloc//") && !fue[0].includes("/functions/"))
                            {
                                var h = fue[0].trim();
                                var e = xF.filter(function (e) {
                                    return e.infoJSON.name == h;
                                });
                                if(e.length < 1){
                                    console.log(h + " not found in KB_funcions");
                                }else{
                                    var o = {};
                                    o.ID = e[0].ID;
                                    var i = e[0].infoJSON;
                                    i.type = "angular";
                                    i.code = functions[x].replace(/"/gi, '\"').replace(/'/gi, '\"').trim();
                                    o.infoJSON = i;
                                    aU.push(o);
                                    if(e[0].infoJSON.name == "buildTree"){
                                        //console.log(JSON.stringify(o.infoJSON));
                                    }
                                }
                            }else{
                                main+=functions[x].replace(/"/gi, '\"').replace(/'/gi, '\"').trim();
                            }
                            var e = xF.filter(function (e) {
                                return e.infoJSON.name == "main";
                            });
                            if(e.length < 1){
                                console.log(h + "main not found in KB_funcions")
                            }else{
                                var o = {};
                                o.ID = e[0].ID;
                                var i = e[0].infoJSON;
                                i.code = main.trim();
                                o.infoJSON = i;
                                aU.push(o);
                            }
                            var el = aU.pop();
                            m2.on('done3', function (result) {
                                el = aU.pop();
                                if(el !== undefined) {
                                    m2.handle(el.ID, el.infoJSON, m2, connection, "done3");
                                }else{
                                    callback("OK");
                                }
                            });
                            m2.handle(el.ID, el.infoJSON, m2, connection, "done3");
                        }
                    }
                });
                m2.handle(el.ID, el.infoJSON, m2, connection, "done2");
            }
        });
        m.handle(m, floc);
    });
    connection.execSql(request1);
};
exports.start = start;