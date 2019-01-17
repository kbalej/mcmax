var MongoClient = require('mongodb').MongoClient;
var buildModel = require("./buildModel");
var uuid = require('uuid');
var sss = require('./sss');

function start(storedProcedure, response, postData, querystring, callback) {
    var updateRecursive = function (dbo, tab, s, arr, response) {
        if (arr.length < 1) {
            response.writeHead(200, { "Content-Type": "text/plain" });
            response.write("OK");
            response.end();
        } else {
            var vid = arr.pop();
            s += 10;
            var o = {};
            o.ID = vid;
            var o1 = {};
            o1.sequence = s;
            dbo.collection(tab).updateOne(o, { $set: o1 }, function (err, res) {
                updateRecursive(dbo, tab, s, arr, response);
            });
        }
    };
    var errorReturn = function (rv) {
        response.writeHead(300, { "Content-Type": "text/plain" });
        response.write(rv);
        response.end();
    };
    var url = sss.start().mongo;
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, con) {
        if (err) {
            errorReturn("Cannot connect to mongo");
        }
        else {
            var dbo;
            if (storedProcedure === "KB_buildModel") {
                dbo = con.db("KB");
            } else {
                dbo = con.db(querystring.module);
            }
            var rv = "";
            var masterID = null;
            switch (storedProcedure) {
                case "KB_buildModel":
                    dbo.collection("modules").find().sort({ sequence: 1 }).toArray(function (err, result) {
                        if (err) {
                            errorReturn(err);
                        }
                        vmodules = result;
                        dbo.collection("forms").find().sort({ sequence: 1 }).toArray(function (err, result) {
                            if (err) {
                                errorReturn(err);
                            }
                            vforms = result;
                            dbo.collection("pages").find().sort({ sequence: 1 }).toArray(function (err, result) {
                                if (err) {
                                    errorReturn(err);
                                }
                                vpages = result;
                                dbo.collection("fields").find().sort({ sequence: 1 }).toArray(function (err, result) {
                                    if (err) {
                                        errorReturn(err);
                                    }
                                    vfields = result;
                                    dbo.collection("tables").find().toArray(function (err, result) {
                                        if (err) {
                                            errorReturn(err);
                                        }
                                        vtables = result;
                                        dbo.collection("columns").find().toArray(function (err, result) {
                                            if (err) {
                                                errorReturn(err);
                                            }
                                            vcolumns = result;
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
                    var mysort = {};
                    var x = querystring.orderBy.split(",");
                    for (v in x) {
                        var ob = "";
                        var xx = x[v].split(":");
                        if(xx[0] === "sequence"){
                            ob = xx[0];
                        } else {
                            ob = "infoJSON." + xx[0] + "')";
                        }
                        mysort.push(ob);
                        if(xx[1] === "D"){
                            mysort[ob] = 1;                    
                        } else {
                            mysort[ob] = 0;
                        }
                    }
                    var query = {};
                    var v = JSON.parse(postData).params;
                    if (v !== undefined && v !== '' && v !== '""') {
                        for (var x in v) {
                            var u = {};
                            switch (v[x].compare) {
                                case "notEqual":
                                    u["$ne"] = query[v[x].value];
                                    break;
                                case "contains":
                                    u["$regex"] = "$" + query[v[x].value] + "$";
                                    u["$options"] = 'i';
                                    break;
                                case "beginsWith":
                                    u["$regex"] = "^" + query[v[x].value];
                                    u["$options"] = 'i';
                                    break;
                                case "doesNotContain":
                                    u["$not"] = "$" + query[v[x].value] + "$";
                                    u["$options"] = 'i';
                                    break;
                                case "greaterThan":
                                    u["$gt"] = query[v[x].value];
                                    break;
                                case "greaterThanEqual":
                                    u["$gte"] = query[v[x].value];
                                    query[v[x].field] = u;
                                    break;
                                case "lessThan":
                                    u["$lt"] = query[v[x].value];
                                    query[v[x].field] = u;
                                    break;
                                case "lessThanEqual":
                                    u["$lte"] = query[v[x].value];
                                    break;
                                case "isBlank":
                                    u["$eq"] = "";
                                    break;
                                case "isNotBlank":
                                    u["$ne"] = "";
                                    break;
                                case "multiple":
                                    u["$in"] = query[v[x].value];
                                    break;
                                default: // equal
                                    u["$eq"] = query[v[x].value];
                                    break;
                            }
                            query[v[x].field] = u;
                        }
                    }
                    query.masterID = '';
                    if (querystring.masterID !== undefined && querystring.masterID !== null) { query.masterID = querystring.masterID; }
                    dbo.collection(querystring.table).countDocuments(query,function(err,count){
                        var rc = count;
                        var myskip = (querystring.pageCt - 1) * querystring.rowsPage;
                        var mylimit = querystring.rowsPage * 1;
                        dbo.collection(querystring.table).find(query).sort(mysort).skip(myskip).limit(mylimit).toArray(function (err, result) {
                            var t = {};
                            t.rowCount = rc;
                            t.rv = result;
                            t.table = querystring.table;
                            response.writeHead(200, { "Content-Type": "text/plain" });
                            response.write(JSON.stringify(t));
                            response.end();
                            con.close;
                        });
                    });                    
                    break;
                case "KB_x_addUpdate":
                    if (querystring.masterID !== undefined && querystring.masterID !== null) { masterID = querystring.masterID; } else { masterID = ''; }
                    var o = {};
                    if (querystring.ID !== undefined && querystring.ID !== null && querystring.ID !== '') {
                        o.ID = querystring.ID;
                        dbo.collection(querystring.table).updateOne(o, { $set: { infoJSON: JSON.parse(postData), TS: new Date() } }, function (err, res) {
                            if (err) {
                                rv = "NOK: " + JSON.stringify(res);
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
                        o.ID = uuid.v1();
                        o.sequence = 0;
                        o.masterID = masterID;
                        o.TS = new Date();
                        o.infoJSON = JSON.parse(postData);
                        dbo.collection(querystring.table).insertOne(o, function (err, res) {
                            if (err) {
                                rv = "NOK: " + JSON.stringify(res);
                                response.writeHead(300, { "Content-Type": "text/plain" });
                                response.write(rv);
                                response.end();
                            } else {
                                if (querystring.orderBy === 'sequence') {
                                    var pr = {};
                                    pr["_id"] = 0;
                                    pr["ID"] = 1;
                                    var mysort = {};
                                    var asc = -1;  // desc
                                    mysort["sequence"] = asc;
                                    var q = {};
                                    if (masterID !== '') { q.masterID = masterID; }
                                    dbo.collection(querystring.table).find(q, pr).sort(mysort).toArray(function (err, result) {
                                        if (err) {
                                            rv = "NOK: " + JSON.stringify(result);
                                            response.writeHead(300, { "Content-Type": "text/plain" });
                                            response.write(rv);
                                            response.end()
                                        } else {
                                            updateRecursive(dbo, querystring.table, 0, result, response);
                                        }
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
                    o = {};
                    o.ID = querystring.ID;
                    dbo.collection(querystring.table).deleteOne(o, function (err, obj) {
                        if (err) {
                            rv = "NOK ";
                            response.writeHead(300, { "Content-Type": "text/plain" });
                            response.write(rv);
                            response.end();
                        } else {
                            rv = "OK";
                            response.writeHead(200, { "Content-Type": "text/plain" });
                            response.write(rv);
                            response.end();
                        }
                    });
                    break;
                case "KB_x_sequencePut":
                    o = {};
                    o.ID = querystring.ID;
                    var o1 = {};
                    o1.sequence = querystring.s;
                    dbo.collection(querystring.table).updateOne(o, { $set: o1 }, function (err, res) {
                        if (err) {
                            rv = "NOK: " + JSON.stringify(res);
                            response.writeHead(300, { "Content-Type": "text/plain" });
                            response.write(rv);
                            response.end();
                        } else {
                            var pr = {};
                            pr["_id"] = 0;
                            pr["ID"] = 1;
                            var mysort = {};
                            var asc = -1;  // desc
                            mysort["sequence"] = asc;
                            var q = {};
                            if (masterID !== '') { q.masterID = masterID; }
                            dbo.collection(querystring.table).find(q, pr).sort(mysort).toArray(function (err, result) {
                                if (err) {
                                    rv = "NOK: " + JSON.stringify(res);
                                    response.writeHead(300, { "Content-Type": "text/plain" });
                                    response.write(rv);
                                    response.end();
                                } else {
                                    updateRecursive(dbo, querystring.table, 0, result, response);
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
