var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var buildModel = require("./buildModel");

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

function start(storedProcedure, response, postData, querystring, callback) {
    var config =
        {
            userName: 'max',
            password: 'Bobby123___',
            server: 'maxentreprises.database.windows.net',
            options:
                {
                    database: 'maxentreprises'
                    , encrypt: true
                }
        };
    var rv = "OK";
    var vrows = "";
    var connection = new Connection(config);
    connection.on('connect', function (err) {
        if (err) {
            console.log(err);
            rv = err;
            response.writeHead(300, { "Content-Type": "text/plain" });
            response.write(rv);
            response.end();
            connection.close();
        } else {
            storedProcedure = storedProcedure.replace("_x_", "_n_");
            var request = new Request(storedProcedure,
                function (err) {
                    if (err) {
                        console.log(err);
                        rv = err;
                        response.writeHead(300, { "Content-Type": "text/plain" });
                        response.write(rv);
                        response.end();
                    }
                    //console.log("end request");
                });
            switch (storedProcedure) {
                case "KB_buildModel":
                    request0 = new Request("SELECT * FROM KB_modules FOR JSON PATH; SELECT * FROM KB_forms ORDER BY sequence FOR JSON PATH; SELECT * FROM KB_pages ORDER BY sequence FOR JSON PATH;	SELECT * FROM KB_fields ORDER BY sequence FOR JSON PATH; SELECT * FROM KB_tables FOR JSON PATH; SELECT * FROM KB_columns FOR JSON PATH;", function (err, rowCount, rows) {
                        if (err) {
                            rv = JSON.stringify(err);
                            response.writeHead(300, { "Content-Type": "text/plain" });
                            response.write(rv);
                            response.end();
                            connection.close();
                        }
                        //console.log("end request0");
                    });
                    request0.on('row', function (rows) {
                        //console.log("row request0");
                        vrows += rows[0].value;
                    });
                    request0.on('requestCompleted', function () {
                        //console.log("requestCompleted request0");
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
                case "KB_n_getAll":
                    var vtable = querystring.module + "_" + querystring.table;
                    var vob;
                    if (querystring.orderBy == 'sequence') {
                        vob = 'sequence';
                    } else {
                        vob = "JSON_VALUE(infoJSON, '$." + querystring.orderBy + "')";
                        if (querystring.orderBy == "date") { vob += " DESC "; }
                    }
                    var vw = " 1 = 1 ";
                    if (querystring.masterID !== undefined && querystring.masterID !== "") { vw = " masterID = '" + querystring.masterID + "' " } else { vw = " masterID = '' "}
                    var vv = JSON.parse(postData).sql;
                    if (vv !== "") {
                        vw += " AND " + vv;
                    }
                    var vsql = "SELECT count(*) RC FROM " + vtable + " WHERE " + vw + " FOR JSON PATH;SELECT * FROM " + vtable + " WHERE " + vw + " ORDER BY " + vob + " OFFSET " + (querystring.pageCt - 1) * querystring.rowsPage + " ROWS FETCH NEXT " + querystring.rowsPage + " ROWS ONLY FOR JSON PATH;";
                    //console.log(vsql);
                    var request1 = new Request(vsql, function (err, rowCount, rows) {
                        if (err) {
                            rv = JSON.stringify(err);
                            response.writeHead(300, { "Content-Type": "text/plain" });
                            response.write(rv);
                            response.end();
                            connection.close();
                        }
                        //console.log("end request1");
                    });
                    vrows = "";
                    request1.on('row', function (rows) {
                        //console.log("row request1");
                        vrows += rows[0].value;
                    });
                    request1.on('requestCompleted', function () {
                        //console.log("requestCompleted request1");
                        var t = "[" + vrows.replace("}][{", "}],[{") + "]";
                        if (t === "[]") {
                            //console.log("[]");
                            return;
                        }
                        var tt = JSON.parse(t);
                        //console.log(JSON.stringify(tt));
                        var ttt = {};
                        ttt.rowCount = tt[0][0].RC;
                        ttt.rv = cvt(tt[1]);
                        ttt.table = querystring.table;
                        //console.log(JSON.stringify(ttt));
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
                    break;
                case "KB_n_sequencePut":
                    request.addParameter('module', TYPES.NVarChar, querystring.module, { length: 10 });
                    request.addParameter('tableP', TYPES.NVarChar, querystring.table, { length: 100 });
                    request.addParameter('ID', TYPES.NVarChar, querystring.ID, { length: 50 });
                    request.addParameter('masterID', TYPES.NVarChar, querystring.masterID, { length: 50 });
                    request.addParameter('sequence', TYPES.NVarChar, querystring.s);
                    break;
            }
            request.on('returnValue', function (paramName, value, metadata) {
                //console.log("returnValue request");
                rv = value;
            });
            request.on('requestCompleted', function () {
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