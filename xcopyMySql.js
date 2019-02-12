// copy VS tables from mongoDB to hostpoint mysql database
//
//
'use strict';
var MongoClient = require('mongodb').MongoClient;
var mysql = require('mysql');
var util = require('util');
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var o = function () {
    o.prototype.handle = function (m, vtable) {
        var status = "ERROR";
        var url = "mongodb://localhost:27017/";
        var dbo;
        var con;
        MongoClient.connect(url, { useNewUrlParser: true }, function (err, con) {
            if (err) {
                console.log("Cannot connect to mongo");
                status = "Cannot connect to mongo";
                m.emit('done', status);
            }
            else {
                dbo = con.db("VS");
                con = mysql.createConnection({
                    host: "verbier1.mysql.db.hostpoint.ch",
                    database: "verbier1_VS",
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
                        queryDatabase(con);
                    }
                });
            }
        });

        function queryDatabase(con) {
            console.log('copyTable: ' + vtable);
            con.query('DROP TABLE IF EXISTS  ' + vtable,
                function (err) {
                    console.log(vtable + ': delete table OK.');
                    con.query('CREATE TABLE IF NOT EXISTS ' + vtable + ' ' +
                        '(ID VARCHAR(50) NOT NULL, ' +
                        ' auto INT NOT NULL AUTO_INCREMENT, ' +
                        ' masterID VARCHAR(50) NOT NULL DEFAULT "", ' +
                        ' parentID VARCHAR(50) NOT NULL DEFAULT "", ' +
                        ' sequence SMALLINT NOT NULL DEFAULT 0, ' +
                        ' TS TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
                        ' infoJSON VARCHAR(16000) NOT NULL, ' +
                        ' PRIMARY KEY(ID))',
                        function (err) {
                            assert.equal(err, null);
                            console.log(vtable + ': create table OK.');
                            var cursor = dbo.collection(vtable).find();
                            cursor.forEach(
                                function (doc) {
                                    if (doc.masterID == undefined) { doc.masterID = '' }
                                    if (doc.parentID == undefined) { doc.parentID = '' }
                                    var vx = JSON.stringify(doc.infoJSON);
                                    vx = vx.replace(/\'/g, '\'\'');
                                    var v = 'INSERT INTO ' + vtable + " (ID, masterID,parentID,sequence,infoJSON) VALUES ('" + doc.ID + "','" + doc.masterID + "','" + doc.parentID + "'," + doc.sequence + ",'" + vx + "')";
                                    con.query(v, function (err) {
                                        if (err) {
                                            console.log(JSON.stringify(err));
                                        }
                                    });
                                },
                                function (err) {
                                    assert.equal(err, null);
                                }
                            );
                            status = "OK";
                            m.emit('done', status);
                        });
                });
        }
    };
};
util.inherits(o, EventEmitter);
var m = new o();

var tables = ["brands", "cust", "custCOM", "custADL", "inv", "invDetails", "ldry", "ldryDetails"];
var vtable = tables.pop();
m.on('done', function (status) {
    console.log(vtable + ' ', status);
    vtable = tables.pop();
    if (vtable !== undefined) { m.handle(m, vtable); }
});
m.handle(m, vtable);



