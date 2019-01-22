var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var buildModel = require("./buildModel");
var fs = require('fs');
var sss = require('./sss');

var cvt = function(result) {
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
var cvt1 = function(result) {
    var o = [];
    for (var x in result) {
        try {
            result[x] = JSON.parse(result[x].infoJSON);
        } catch (e) {
            console.log(result[x].infoJSON + "  xxxxxxxxxxxxxx " + x);
        }
        o.push(result[x]);
    }
    return o;
};

function start(storedProcedure, response, postData, querystring, callback) {
    var config = sss.start().sql;
    var rv = "OK";
    var vrows = "";
    var vmax = [];
    var ooo = {};
    var connection = new Connection(config);
    connection.on('connect', function(err) {
        if (err) {
            response.writeHead(300, { "Content-Type": "text/plain" });
            response.write(JSON.stringify(err));
            response.end();
            connection.close();
        } else {
            storedProcedure = storedProcedure.replace("_x_", "_n_");
            var request = new Request(storedProcedure,
                function(err) {
                    if (err) {
                        response.writeHead(300, { "Content-Type": "text/plain" });
                        response.write(JSON.stringify(err));
                        response.end();
                        connection.close();
                    }
                }
            );
            switch (storedProcedure) {
                case "KB_buildModel":
                    var request0 = new Request("SELECT * FROM KB_modules FOR JSON PATH; SELECT * FROM KB_forms ORDER BY sequence FOR JSON PATH; SELECT * FROM KB_pages ORDER BY sequence FOR JSON PATH;	SELECT * FROM KB_fields ORDER BY sequence FOR JSON PATH; SELECT * FROM KB_tables FOR JSON PATH; SELECT * FROM KB_columns FOR JSON PATH;", function(err, rowCount, rows) {
                        if (err) {
                            response.writeHead(300, { "Content-Type": "text/plain" });
                            response.write(JSON.stringify(err));
                            response.end();
                            connection.close();
                        }
                    });
                    request0.on('row', function(rows) {
                        vrows += rows[0].value;
                    });
                    request0.on('requestCompleted', function() {
                        var t = vrows.replace("}][{", "}],[{");
                        t = t.replace("}][{", "}],[{");
                        t = t.replace("}][{", "}],[{");
                        t = t.replace("}][{", "}],[{");
                        t = t.replace("}][{", "}],[{");
                        t = t.replace("}][{", "}],[{");
                        t = "[" + t.replace("}][{", "}],[{") + "]";
                        var tt = JSON.parse(t);
                        for (x in tt) {
                            tt[x] = cvt(tt[x]);
                        }
                        var vmodules = tt[0];
                        var vforms = tt[1];
                        var vpages = tt[2];
                        var vfields = tt[3];
                        var vtables = tt[4];
                        var vcolumns = tt[5];
                        buildModel.start(vmodules, vforms, vpages, vfields, vtables, vcolumns, querystring, callback);
                        connection.close();
                    });
                    connection.execSql(request0);
                    return;
                case "KB_getAuto":
                    var vtable = querystring.module + "_" + querystring.table;
                    var vsq = "";
                    x = postData.split(",");
                    if (x !== undefined && x !== null) {
                        for (v in x) {
                            vsq += "SELECT max(CAST(JSON_VALUE(infoJSON,'$." + x[v] + "') AS int)) FROM " + vtable + ";";
                        }
                    } else {
                        response.writeHead(300, { "Content-Type": "text/plain" });
                        response.write("no max auto columns");
                        response.end();
                        connection.close();
                    }
                    var request9 = new Request(vsq, function(err, rowCount, rows) {
                        if (err) {
                            response.writeHead(300, { "Content-Type": "text/plain" });
                            response.write(JSON.stringify(err));
                            response.end();
                            connection.close();
                        }
                    });
                    request9.on('row', function(rows) {
                        vmax.push(rows[0].value);
                    });
                    request9.on('requestCompleted', function() {
                        response.writeHead(200, { "Content-Type": "text/plain" });
                        response.write(JSON.stringify(vmax));
                        response.end();
                        connection.close();
                    });
                    connection.execSql(request9);
                    return;
                case "KB_doc":
                    ooo = JSON.parse(postData);
                    vrows = "";
                    var request8 = new Request(ooo.sql, function() {});
                    request8.on('row', function(rows) {
                        vrows += rows[0].value;
                    });
                    request8.on('requestCompleted', function() {
                        // build data model
                        var om = {};
                        om.m = ooo.xMaster;
                        om.r = {};
                        var t = vrows.replace("}][{", "}],[{");
                        t = t.replace("}][{", "}],[{");
                        t = t.replace("}][{", "}],[{");
                        t = t.replace("}][{", "}],[{");
                        t = t.replace("}][{", "}],[{");
                        t = t.replace("}][{", "}],[{");
                        t = "[" + t.replace("}][{", "}],[{") + "]";
                        var tt = JSON.parse(t);
                        var vformsSave = cvt1(tt[0])[0];  // infoJSON 
                        om.i = cvt1(tt[1]); // []
                        om.if = {};
                        // calc footer totals for each total column, eg om.if.cost:calc value
                        var ttot = ooo.childTotalFields.split(",");
                        for (var t in ttot) {
                            var tot = 0;
                            for (var v in om.i) {
                                if (om.i[v] !== undefined) { 
                                    tot += om.i[v][ttot[t]];
                                }
                            }
                            om.if[ttot[t]] = tot;
                        }
                        var ct = 2;
                        for (x in ooo.sqlS) {
                            om.r[ooo.sqlS[x]] = cvt1(tt[ct])[0];
                            ct += 1;
                        }
                        var vhtmlDocSave = ooo.htmlDoc;
                        ooo.htmlDoc = ooo.htmlDoc.replace("//model//", JSON.stringify(om));
                        var w = window.open();
                        w.document.open("","doc" + ooo.form + ooo.masterID);
                        w.document.write(ooo.htmlDoc);
                        w.document.close();
                        fs.writeFile(__dirname + "/doc/doc" + ooo.form + ooo.masterID + ".html", ooo.htmlDoc, "utf8", function(err, data) {
                            if (err) {
                                response.writeHead(300, { "Content-Type": "text/plain" });
                                response.write(JSON.stringify(err));
                                response.end();
                                connection.close();
                            } else {
                                var rv = {};
                                rv.docName = "doc" + ooo.form + ooo.masterID;
                                rv.forms = vformsSave;
                                rv.html = vhtmlDocSave;
                                response.writeHead(200, { "Content-Type": "text/plain" });
                                response.write(JSON.stringify(rv)); 
                                response.end();
                                connection.close();
                            }
                        });
                        //connection.execSql(request7);    
                    });
                    connection.execSql(request8);
                    return;

                case "KB_n_getAll":
                    var vtable = querystring.module + "_" + querystring.table;
                    var vob = "";
                    var x = querystring.orderBy.split(",");
                    for (v in x) {
                        if (vob !== "") { vob += " , "; }
                        var xx = x[v].split(":")
                        if (xx[0] === "sequence") {
                            vob += " " + xx[0];
                        } else {
                            vob += " JSON_VALUE(infoJSON, '$." + xx[0] + "')";
                        }
                        if (xx[1] === "D") {
                            vob += " DESC ";
                        }
                    }
                    var vw = true;
                    if (querystring.masterID !== undefined && querystring.masterID !== "") { vw = " masterID = '" + querystring.masterID + "' " } else { vw = " masterID = '' " }
                    var vv = JSON.parse(postData).sql;
                    if (vv !== "") {
                        vw += " AND " + vv;
                    }
                    var vsql = "SELECT count(*) RC FROM " + vtable + " WHERE " + vw + " FOR JSON PATH;SELECT * FROM " + vtable + " WHERE " + vw + " ORDER BY " + vob + " OFFSET " + (querystring.pageCt - 1) * querystring.rowsPage + " ROWS FETCH NEXT " + querystring.rowsPage + " ROWS ONLY FOR JSON PATH;";
                    vrows = "";
                    var request1 = new Request(vsql, function(err, rowCount, rows) {
                        if (err) {
                            response.writeHead(300, { "Content-Type": "text/plain" });
                            response.write(JSON.stringify(err));
                            response.end();
                            connection.close();
                        }
                    });
                    request1.on('row', function(rows) {
                        vrows += rows[0].value;
                    });
                    request1.on('requestCompleted', function() {
                        var t = "[" + vrows.replace("}][{", "}],[{") + "]";
                        if (t === "[]") {
                            return;
                        }
                        var tt = JSON.parse(t);
                        var ttt = {};
                        ttt.rowCount = tt[0][0].RC;
                        ttt.rv = cvt(tt[1]);
                        ttt.table = querystring.table;
                        connection.close();
                        response.writeHead(200, { "Content-Type": "text/plain" });
                        response.write(JSON.stringify(ttt));
                        response.end();
                    });
                    connection.execSql(request1);
                    return;
                case "KB_n_addUpdate":
                    request.addParameter('module', TYPES.NVarChar, querystring.module, { length: 10 });
                    request.addParameter('tableP', TYPES.NVarChar, querystring.table, { length: 100 });
                    request.addParameter('ID', TYPES.NVarChar, querystring.ID, { length: 50 });
                    request.addParameter('masterID', TYPES.NVarChar, querystring.masterID, { length: 50 });
                    request.addParameter('objJSON', TYPES.NVarChar, postData, { length: 9000 });
                    break;
                case "KB_n_delete":
                    request.addParameter('module', TYPES.NVarChar, querystring.module, { length: 10 });
                    request.addParameter('tableP', TYPES.NVarChar, querystring.table, { length: 100 });
                    request.addParameter('ID', TYPES.NVarChar, querystring.ID, { length: 50 });
                    request.addParameter('subtable', TYPES.NVarChar, querystring.subtable, { length: 100 });
                    break;
                case "KB_n_sequencePut":
                    request.addParameter('module', TYPES.NVarChar, querystring.module, { length: 10 });
                    request.addParameter('tableP', TYPES.NVarChar, querystring.table, { length: 100 });
                    request.addParameter('ID', TYPES.NVarChar, querystring.ID, { length: 50 });
                    request.addParameter('masterID', TYPES.NVarChar, querystring.masterID, { length: 50 });
                    request.addParameter('sequence', TYPES.NVarChar, querystring.s);
                    break;
            }
            request.on('returnValue', function(paramName, value, metadata) {
                //console.log("returnValue request");
                rv = value;
            });
            request.on('requestCompleted', function() {
                //console.log("requestCompleted request");
                connection.close();
                response.writeHead(200, { "Content-Type": "text/plain" });
                response.write(rv);
                response.end();
            });
            connection.callProcedure(request);
        }
    });
}

exports.start = start;