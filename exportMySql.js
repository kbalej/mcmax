// copy KB_ tables from azure MS SQL to hostpoint mysql database
//
//
'use strict';
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var mysql = require('mysql');
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
                con = mysql.createConnection({
                    host: "verbier1.mysql.db.hostpoint.ch",
                    database: "verbier1_KB",
                    user: "verbier1_mcmax",
                    password: "GnrbgWFE"
                });
                con.connect(function (err) {
                    if (err) {
                        console.log("Cannot connect to mysql");
                        status = "Cannot connect to mysql";
                        m.emit('done', status);
                    }
                    else {
                        queryDatabase();
                    }
                });
            }
        });

        function queryDatabase() {
            console.log('exportTable: ' + vtable);
            con.query('DROP TABLE IF EXISTS  ' + vtable.substring(3),
                function (err) {
                    console.log(vtable + ': delete table OK.');
                    con.query('CREATE TABLE IF NOT EXISTS ' + vtable.substring(3) + ' ' +
                        '(ID VARCHAR(50) NOT NULL, ' +
                        ' masterID VARCHAR(50) NULL DEFAULT "", ' +
                        ' parentID VARCHAR(50) NULL DEFAULT "", ' +
                        ' sequence SMALLINT NOT NULL DEFAULT 0, ' +
                        ' TS TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
                        ' infoJSON VARCHAR(16000) NOT NULL, ' +
                        ' PRIMARY KEY(ID))',
                        function (err) {
                            console.log(vtable + ': create table OK.');
                            var request = new Request(
                                "SELECT * FROM " + vtable,
                                function (err, rowCount, rows) {
                                    if (err) { var x = 1; } else {
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
    if (vtable !== undefined) { m.handle(m, vtable); }// else { process.exit(); }
});
m.handle(m, vtable);



