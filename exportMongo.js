'use strict';
var Request = require('tedious').Request;
var MongoClient = require('mongodb').MongoClient;
var sss = require('./sss');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function start(pdb, tabless, connection, callback) {  // tables as []
    var tables = tabless;
    var cfg = sss.start();
    var con;
    var db;
    MongoClient.connect(cfg.mongo, { useNewUrlParser: true }, function (err, pcon) {
        if (err) {
            console.log("Cannot connect to mongo");
            callback(true, "Cannot connect to mongo");
        } else {
            con = pcon;
            db = pcon.db(pdb);
        }
    });
    var o = function () {
        o.prototype.handle = function (m, vtable, db) {
            var status = "ERROR";
            queryDatabase(vtable, db);
            function queryDatabase(vtable, db) {
                console.log('exportTable: ' + vtable);
                db.collection(vtable.substring(3)).drop(function (err, delOK) {
                    //if (err) throw err;
                    if (delOK) console.log(vtable + ': collection deleted');
                    db.createCollection(vtable.substring(3), function (err, res) {
                        //if (err) throw err;
                        console.log(vtable + ': collection created!');
                        var request = new Request(
                            "SELECT ID,masterID,parentID,sequence,infoJSON FROM " + vtable,
                            function (err, rowCount, rows) {
                                if (!err) {
                                    console.log(vtable + ': ' + rowCount + ' row(s) returned');
                                }
                            }
                        );
                        request.on('row', function (columns) {
                            var myobj = {};
                            var vv;
                            columns.forEach(function (column) {
                                if (column.metadata.colName !== 'sequence') {
                                    var vx = column.value;
                                    if (column.metadata.colName === 'infoJSON') {
                                        vx = vx.replace(/\r\n/g, '');
                                        vv = JSON.parse(vx);
                                    }
                                    else { vv = vx; }
                                }
                                else {
                                    vv = column.value;
                                }
                                myobj[column.metadata.colName] = vv;
                            });
                            db.collection(vtable.substring(3)).insertOne(myobj, function (err, res) {
                                if (err) throw err;
                            });
                        });
                        request.on('requestCompleted', function () {
                            status = "OK";
                            m.emit('done', status);
                        });
                        connection.execSql(request);
                    });
                });
            }
        };
    };
    util.inherits(o, EventEmitter);
    var m = new o();
    var vtable = tables.pop();
    m.on('done', function (status) {
        console.log(vtable + ' ', status);
        vtable = tables.pop();
        if (vtable !== undefined) {
            m.handle(m, vtable, db);
        } else {
            con.close;
            callback(false, "");
        }
    });
    m.handle(m, vtable, db);
};
exports.start = start;