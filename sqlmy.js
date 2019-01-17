var mysql = require('mysql');
var buildModel = require("./buildModel");
var uuid = require('uuid');
var sss = require('./sss');

function start(storedProcedure, response, postData, querystring, callback) {
    var updateRecursive = function (con, tab, s, arr, response) {
        if (arr.length < 1) {
            response.writeHead(200, { "Content-Type": "text/plain" });
            response.write("OK");
            response.end();
        } else {
            var vid = arr.pop();
            s += 10;
            con.query("UPDATE " + tab + " SET sequence = " + s + " WHERE ID = '" + vid + "'", function (err, result, fields) {
                updateR(con, tab, s, arr, response);
            });
        }
    };
    var errorReturn = function (rv) {
        response.writeHead(300, { "Content-Type": "text/plain" });
        response.write(rv);
        response.end();
    };

    var vdb = sss.start().mysql;
    if (storedProcedure === "KB_buildModel") {
        vdb.database += "KB";
    } else {
        vdb.database += querystring.module; 
    }
    var con = mysql.createConnection(vdb);
    
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
    con.connect(function (err) {
        if (err) {
            errorReturn("Cannot connect to mysql");
        }
        else {
            var rv = "OK";
            var masterID = null;
            switch (storedProcedure) {
                case "KB_buildModel":
                    con.query("SELECT * FROM modules", function (err, result, fields) {
                        if (err) {
                            errorReturn(err);
                        }
                        vmodules = cvt(result);
                        con.query("SELECT * FROM forms ORDER BY sequence", function (err, result, fields) {
                            if (err) {
                                errorReturn(err);
                            }
                            vforms = cvt(result);
                            con.query("SELECT * FROM pages ORDER BY sequence", function (err, result, fields) {
                                if (err) {
                                    errorReturn(err);
                                }
                                vpages = cvt(result);
                                con.query("SELECT * FROM fields ORDER BY sequence", function (err, result, fields) {
                                    if (err) {
                                        errorReturn(err);
                                    }
                                    vfields = cvt(result);
                                    con.query("SELECT * FROM tables", function (err, result, fields) {
                                        if (err) {
                                            errorReturn(err);
                                        }
                                        vtables = cvt(result);
                                        con.query("SELECT * FROM columns", function (err, result, fields) {
                                            if (err) {
                                                errorReturn(err);
                                            }
                                            vcolumns = cvt(result);
                                            buildModel.start(vmodules, vforms, vpages, vfields, vtables, vcolumns, querystring, callback);
                                            con.close;
                                        });
                                    });
                                });
                            });
                        });
                    });
                    break;
                case "KB_x_getAll":
                    var ob = "";
                    var x = querystring.orderBy.split(",");
                    for (v in x) {
                        if(ob !== "") { ob += ","; }
                        var xx = x[v].split(":");
                        if(xx[0] === "sequence"){
                            ob += " " + xx[0];
                        } else {
                            ob += " JSON_VALUE(infoJSON, '$." + xx[0] + "')";
                        }
                        if(xx[1] === "D"){
                            ob += " DESC ";
                        }
                    }
                    var v = JSON.parse(postData).sql;
                    if (v === undefined || v === '' || v === '""') { v = ''; }
                    var where = '';
                    if (querystring.masterID !== undefined && querystring.masterID !== null) {
                        if (v !== '') {
                            where = 'WHERE masterID = "' + querystring.masterID + '" AND ' + v;
                        } else {
                            where = 'WHERE masterID = "' + querystring.masterID + '"';
                        }
                    } else {
                        if (v !== '') { where = "WHERE masterID = '' AND " + v; } else { where = "WHERE masterID = '' "; }
                    }
                    con.query("SELECT count(*) c FROM " + querystring.table + ' ' + where, function (err, result, fields) {
                        var ct = result[0].c;
                        con.query("SELECT * FROM " + querystring.table + " " + where + " ORDER BY " + ob + " LIMIT " + querystring.rowsPage + " OFFSET " + (querystring.pageCt - 1) * querystring.rowsPage, function (err, result, fields) {
                            var t = {};
                            t.rowCount = ct;
                            t.rv = cvt(result);
                            t.table = querystring.table;
                            if (querystring.orderBy !== "sequence") { t.rv = t.rv.sort(function (a, b) { return a.infoJSON.name - b.infoJSON.name; }); }  // sort on json field name
                            response.writeHead(200, { "Content-Type": "text/plain" });
                            response.write(JSON.stringify(t));
                            response.end();
                            con.close;
                        });
                    });
                    break;
                case "KB_x_addUpdate":
                    var masterID;
                    if (querystring.masterID !== undefined && querystring.masterID !== null) { masterID = querystring.masterID; } else { masterID = ''; }
                    if (querystring.ID !== undefined && querystring.ID !== null && querystring.ID !== '') {
                        con.query("UPDATE " + querystring.table + " SET TS = DEFAULT, infoJSON = '" + postData + "' WHERE ID = '" + querystring.ID + "'", function (err, result, fields) {
                            if (err) {
                                rv = "NOK: " + JSON.stringify(result);
                                response.writeHead(300, { "Content-Type": "text/plain" });
                                response.write(rv);
                                response.end();
                            } else {
                                response.writeHead(200, { "Content-Type": "text/plain" });
                                response.write("OK");
                                response.end();
                            }
                        });
                    } else {
                        con.query("INSERT INTO " + querystring.table + " (ID, sequence, masterID, infoJSON) VALUES ('" + uuid.v1() + "',9999, '" + querystring.masterID + "','", postData + "')", function (err, result, fields) {
                            if (err) {
                                rv = "NOK: " + JSON.stringify(result);
                                response.writeHead(300, { "Content-Type": "text/plain" });
                                response.write(rv);
                                response.end();
                            }
                            else {
                                if (querystring.orderBy === 'sequence') {
                                    if (masterID === '') { masterID = '%'; }
                                    con.query("SELECT ID FROM " + querystring.table + " WHERE masterID LIKE" + masterID + " ORDER BY sequence DESC", function (err, result, fields) {
                                        updateRecursive(con, querystring.table, 0, result, response);
                                    });
                                } else {
                                    response.writeHead(200, { "Content-Type": "text/plain" });
                                    response.write("OK");
                                    response.end();
                                }
                            }
                        });
                    }
                    break;
                case "KB_x_delete":
                    con.query("DELETE FROM " + querystring.table + " WHERE ID = '" + querystring.ID + "'", function (err) {
                        if (err) {
                            response.writeHead(300, { "Content-Type": "text/plain" });
                            response.write("NOK: " + JSON.stringify(err));
                            response.end();
                        } else {
                            if( querystring.subtable !== "") {      // unlink subtable, possibly delete ?
                                con.query("UPDATE " + querystring.subtable + " SET masterID = '' WHERE masterID = '" + querystring.ID + "'", function (err) {
                                    if(err){
                                        response.writeHead(300, { "Content-Type": "text/plain" });
                                        response.write("NOK: " + JSON.stringify(err));
                                        response.end();
                                    } else {
                                        response.writeHead(200, { "Content-Type": "text/plain" });
                                        response.write("OK");
                                        response.end();
                                    }
                                });
                            } else {
                                response.writeHead(200, { "Content-Type": "text/plain" });
                                response.write("OK");
                                response.end();
                            }
                        }
                    });
                    break;
                case "KB_x_sequencePut":
                    if (querystring.masterID !== undefined && querystring.masterID !== null) { masterID = querystring.masterID; } else { masterID = '%'; }
                    con.query("UPDATE " + querystring.table + " SET sequence = " + querystring.s + " WHERE ID = '" + querystring.ID + "'", function (err, result, fields) {
                        if (err) {
                            rv = "NOK: " + JSON.stringify(result);
                            response.writeHead(300, { "Content-Type": "text/plain" });
                            response.write(rv);
                            response.end();
                        } else {
                            if (masterID === '') { masterID = '%'; }
                            con.query("SELECT ID FROM " + querystring.table + " WHERE masterID LIKE" + masterID + " ORDER BY sequence DESC", function (err, result, fields) {
                                if (err) {
                                    rv = "NOK: " + JSON.stringify(result);
                                    response.writeHead(300, { "Content-Type": "text/plain" });
                                    response.write(rv);
                                    response.end()
                                } else {
                                    updateRecursive(con, querystring.table, 0, result, response);
                                }
                            });
                        }
                    });
                    break;
            }
        }
    });
}
exports.start = start;
