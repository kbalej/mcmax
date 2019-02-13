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
var cvt2 = function(result) {
    var o = [];
    for (var x in result) {
        try {
            var t = JSON.parse(result[x].date);
            result[x] = JSON.parse(result[x].infoJSON);
            result[x]["date"] = t;
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
                    var vmax = [];
                    var x = postData.split(",");
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
                            response.write("bad request " + JSON.stringify(err));
                            response.end();
                            connection.close();
                        }
                    });
                    request9.on('row', function(rows) {
                        vmax.push(rows[0].value);
                    });
                    request9.on('requestCompleted', function() {
                        response.writeHead(200, { "Content-Type": "text/plain" });
                        response.write(vmax.toString());
                        response.end();
                        connection.close();
                    });
                    connection.execSql(request9);
                    return;
                 case "KB_table":
                    var vtable = querystring.module + "_" + querystring.table;
                    var vsql = "CREATE TABLE " + vtable + "( [ID] [uniqueidentifier] NOT NULL, [masterID] nvarchar NULL, [parentID] nvarchar NULL,";
                    vsql += "[sequence] [int] NULL, [ts] [timestamp] NULL, uid nvarchar NULL, [name] AS (json_value([infoJSON],'$.name')), ";
                    vsql += "[date] AS (json_value([infoJSON],'$._date')), [infoJSON] nvarchar NULL, "; // use ISO _date 
                    vsql += "CONSTRAINT [PK_" + vtable + "] PRIMARY KEY CLUSTERED ( [ID] ASC )WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY] ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY] GO ";
                    vsql += "ALTER TABLE [dbo].[" + vtable + "] ADD CONSTRAINT [DF_" + vtable + "_ID] DEFAULT (newid()) FOR [ID] GO";
                    vsql += "CREATE NONCLUSTERED INDEX [idx_" + vtable + "_masterID] ON " + vtable + " ( [masterID] ASC )WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF) ON [PRIMARY] GO ";
                    vsql += "CREATE NONCLUSTERED INDEX [idx_" + vtable + "_name] ON " + vtable + " ( [name] ASC )WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF) ON [PRIMARY] GO ";
                    vsql += "CREATE NONCLUSTERED INDEX [idx_" + vtable + "_date] ON " + vtable + " ( [date] ASC )WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF) ON [PRIMARY] GO ";
                    var request10 = new Request(vsql, function() {});
                    request10.on('requestCompleted', function() {
                        var rv = "db table created " + new Date().toISOString();
                        response.writeHead(200, { "Content-Type": "text/plain" });
                        response.write(rv); 
                        response.end();
                        connection.close();
                    });
                    connection.execSql(request10);
                    return;
                case "KB_chart":
                    vrows = "";
                    var d = new Date();
                    var vlimit = d.getFullYear() - 2;
                    var vsql = "CREATE TABLE #tmp (nYear int, nMonth int, nGroup NVARCHAR(10), Tnet DECIMAL); ";
                    vsql += "INSERT INTO #tmp (nYear, nMonth, nGroup, Tnet) SELECT CAST(SUBSTRING(JSON_VALUE(infoJSON, '$.date'),1,4) as int) as vyear, CAST(SUBSTRING(JSON_VALUE(infoJSON, '$.date'),6,2) as int) as vmonth, JSON_VALUE(infoJSON, '$.service') as vgroup, CAST(JSON_VALUE(infoJSON, '$.cost_NET') as numeric) as Tnet FROM VS_invDetails;";  
                    vsql += "SELECT nYear, nMonth, SUM(Tnet) Tnet FROM #tmp WHERE nGroup <> 'Divers' AND nYear > " + vlimit + " GROUP BY nYear, nMonth ORDER BY nYear, nMonth for json path;";
                    vsql += "SELECT nYear, SUM(Tnet) Tnet FROM #tmp WHERE nGroup <> 'Divers' GROUP BY nYear ORDER BY nYear for json path;";
                    vsql += "SELECT nGroup as Service, SUM(Tnet) Tnet FROM #tmp GROUP BY nGroup ORDER BY nGroup for json path;";
                    vsql += "DROP TABLE #tmp;";
                    var request7 = new Request(vsql, function() {});
                    request7.on('row', function(rows) {
                        vrows += rows[0].value;
                    });
                    request7.on('requestCompleted', function() {
                        var t = vrows.replace("}][{", "}],[{");
                        t = t.replace("}][{", "}],[{");
                        t = "[" + t.replace("}][{", "}],[{") + "]";
                        var tt = JSON.parse(t);
                        //console.log(JSON.stringify(tt));

                        postData = postData.replace("//data//", JSON.stringify(tt[0]));
                        postData = postData.replace("//data1//", JSON.stringify(tt[1]));
                        postData = postData.replace("//data2//", JSON.stringify(tt[2]));

                        response.writeHead(200, { "Content-Type": "text/plain" });
                        response.write(postData); 
                        response.end();
                        connection.close();
                    });
                    connection.execSql(request7);
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
                        om.m = ooo.xMaster; // load m
                        om.r = {};
                        om.g = {};
                        var t = vrows.replace("}][{", "}],[{");
                        t = t.replace("}][{", "}],[{");
                        t = t.replace("}][{", "}],[{");
                        t = t.replace("}][{", "}],[{");
                        t = t.replace("}][{", "}],[{");
                        t = t.replace("}][{", "}],[{");
                        t = "[" + t.replace("}][{", "}],[{") + "]";
                        var tt = JSON.parse(t);
                        // load i
                        om.i = cvt1(tt[0]); // [] first select after update
                        // calc footer totals for each total column, eg om.if.cost
                        om.if = {};
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
                        // load r 
                        var ct = 1;   // select sequene for r + g in tt, important 
                        for (x in ooo.sqlS) {
                            om.r[ooo.sqlS[x]] = cvt1(tt[ct])[0];
                            ct += 1;
                        }
                        // load g 
                        for (x in ooo.sqlG) {
                            if(tt[ct] !== undefined) {
                                console.log(JSON.stringify(tt[ct]));
                                om.g[ooo.sqlG[x]] = cvt2(tt[ct])[0];
                            } else {
                                om.g[ooo.sqlG[x]] = [{}];
                            }
                            ct += 1;
                        }
                        // write doc<form><ID> file
                        ooo.htmlDoc = ooo.htmlDoc.replace("//model//", JSON.stringify(om)); // complete doc<form> template
                        fs.writeFile(__dirname + "/doc/doc" + ooo.form + ooo.masterID + ".html", ooo.htmlDoc, "utf8", function(err, data) {
                            if (err) {
                                response.writeHead(300, { "Content-Type": "text/plain" });
                                response.write(JSON.stringify(err));
                                response.end();
                                connection.close();
                            } else {
                                response.writeHead(200, { "Content-Type": "text/plain" });
                                // return doc<form><ID> name
                                response.write("doc" + ooo.form + ooo.masterID); 
                                response.end();
                                connection.close();
                            }
                        });
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
                        if (xx[0] === "sequence" || xx[0] === "date") {
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
                    request.addParameter('parentID', TYPES.NVarChar, querystring.parentID, { length: 500 });
                    request.addParameter('uid', TYPES.NVarChar, querystring.uid, { length: 50 });
                    request.addParameter('sequence', TYPES.NVarChar, querystring.sequence);
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
                rv = value;
            });
            request.on('requestCompleted', function() {
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