'use strict';
var Request = require('tedious').Request;
var mysql = require('mysql');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var sss = require('./sss');

function start(pdb, tabless, connection, callback) {
    var tables = tabless; // for pop
    // connection: SQL server
    var cfg = sss.start();
    cfg.mysql.database += pdb;
    var con = mysql.createConnection(cfg.mysql);
    con.connect(function (err) {
        if (err) {
            console.log("Cannot connect to mysql");
            callback(true, "Cannot connect to mysql");
        }
    });
    var o = function () {

        o.prototype.handle = function (m, vtable, con) {
            var status = "ERROR";
            queryDatabase(vtable, con);
            function queryDatabase(vtable, con) {
                console.log('exportTable: ' + vtable);
                con.query('DROP TABLE IF EXISTS  ' + vtable.substring(3),
                    function (err) {
                        console.log(err);
                        if (err) { console.log(err); } else {
                            console.log(vtable + ': delete table OK.');
                            con.query('CREATE TABLE IF NOT EXISTS ' + vtable.substring(3) + ' ' +
                                "(ID VARCHAR(50) NOT NULL, " +
                                " masterID VARCHAR(50) NULL DEFAULT '', " +
                                " parentID VARCHAR(500) NULL DEFAULT '', " +
                                " sequence SMALLINT NOT NULL DEFAULT 0, " +
                                " ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                                " uid VARCHAR(50) NULL DEFAULT '', " +
                                " name VARCHAR(100) NULL DEFAULT '', " +
                                " date VARCHAR(20) NULL DEFAULT '', " +
                                " infoJSON VARCHAR(9000) NULL DEFAULT '', " +
                                " PRIMARY KEY(ID));", function (err) {
                                    console.log(vtable + ': create table OK.');
                                    var request = new Request(
                                        "SELECT ID,masterID,parentID,sequence,infoJSON FROM " + vtable,
                                        function (err, rowCount, rows) {
                                            if (!err) {
                                                console.log(vtable + ': ' + rowCount + ' row(s) returned');
                                            }
                                        }
                                    );
                                    request.on('row', function (columns) {
                                        var vf = "", vv = "";
                                        columns.forEach(function (column) {
                                            vf += column.metadata.colName + ',';
                                            if (column.metadata.colName !== 'sequence') {
                                                var vx = column.value;
                                                if (column.metadata.colName === 'infoJSON') {
                                                    vx = vx.replace(/\r\n/g, '');
                                                    vx = vx.replace(/\'/g, '\'\'');
                                                }
                                                vv += "'" + vx + "',";
                                            }
                                            else {
                                                vv += column.value + ',';
                                            }
                                        });
                                        con.query('INSERT INTO ' + vtable.substring(3) + ' (' + vf.substring(0, vf.length - 1) + ') VALUES (' + vv.substring(0, vv.length - 1) + ');');
                                    });
                                    request.on('requestCompleted', function () {
                                        status = "OK";
                                        m.emit('done', status);
                                    });
                                    connection.execSql(request);
                                }
                            );
                        }
                    }
                );
            };
        };
    };
    util.inherits(o, EventEmitter);
    var m = new o();
    var vtable = tables.pop();
    m.on('done', function (status) {
        console.log(vtable + ' ', status);
        vtable = tables.pop();
        if (vtable !== undefined) {
            m.handle(m, vtable, con);
        } else {
            con.close;
            callback(false, "");
        }
    });
    m.handle(m, vtable, con);
};
exports.start = start;


