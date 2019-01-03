// copy KB_ tables from azure MS SQL to local mongoDB
//
//
'use strict';

var url = "mongodb://localhost:27017/";
 
var db;

var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var MongoClient = require('mongodb').MongoClient;
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var o = function () {
    o.prototype.handle = function (m, vtable) {
        var status = "ERROR";
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
        var connection = new Connection(config);
        var con;
        connection.on('connect', function (err) {
            if (err) {
                console.log("Cannot connect to MS SQL Svr");
                status = "Cannot connect to MS SQL Svr";
                m.emit('done', status);
            }
            else {
                MongoClient.connect(url, { useNewUrlParser: true }, function (err, con) {
                    if (err) {
                        console.log("Cannot connect to mongo");
                        status = "Cannot connect to mongo";
                        m.emit('done', status);
                    }
                    else {
                        db = con.db("KB");
                        queryDatabase();
                    }
                });
            }
        });

        function queryDatabase() {
            console.log('exportTable: ' + vtable);
            db.collection(vtable.substring(3)).drop(function (err, delOK) {
                //if (err) throw err;
                if (delOK) console.log(vtable + ': collection deleted');
                db.createCollection(vtable.substring(3), function (err, res) {
                    //if (err) throw err;
                    console.log(vtable + ': collection created!');
                    var request = new Request(
                        "SELECT * FROM " + vtable,
                        function (err, rowCount, rows) {
                            if (err) {
                                var x = 1;
                            } else {
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
                                    //vx = vx.replace(/\'/g, '');
                                    vv = JSON.parse(vx);
                                }
                                else { vv = vx;}
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
var tables = ["KB_columns", "KB_fields", "KB_forms", "KB_modules", "KB_pages", "KB_tables", "KB_test"];
var vtable = tables.pop();
m.on('done', function (status) {
    console.log(vtable + ' ', status);
    vtable = tables.pop();
    if (vtable !== undefined) { m.handle(m, vtable); }
});
m.handle(m, vtable);



