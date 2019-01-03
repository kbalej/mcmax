// copy VS tables from mongoDB to azure sql database
//
//
'use strict';
var MongoClient = require('mongodb').MongoClient;
var Connection = require('tedious').Connection;
var TYPES = require('tedious').TYPES;
var ISOLATION_LEVEL = require('tedious').ISOLATION_LEVEL;
var Request = require('tedious').Request;
var util = require('util');
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;

var o = function () {
    o.prototype.handle = function (m, vtable) {
        var status = "ERROR";
        var url = "mongodb://localhost:27017/";
        var config =
        {
            userName: 'max',
            password: 'Bobby123___',
            server: 'maxentreprises.database.windows.net',
            options:
            {
                database: 'maxentreprises'
                , encrypt: true,
                enableArithAbort: true,
                requestTimeout: 60000,
                connectionIsolationLevel: ISOLATION_LEVEL.SNAPSHOT
            }
        };
        var connection;
        MongoClient.connect(url, { useNewUrlParser: true }, function (err, con) {
            if (err) {
                console.log("Cannot connect to mongo");
                status = "Cannot connect to mongo";
                m.emit('done', status);
            }
            else {
                var dbo = con.db("VS");
                connection = new Connection(config);
                connection.on('connect', function (err) {
                    if (err) {
                        console.log("Cannot connect to ms sql");
                        status = "Cannot connect to ms sql";
                        m.emit('done', status);
                    }
                    else {
                        queryDatabase(dbo);
                    }
                });
            }
        });

        function queryDatabase(dbo) {
            console.log('copyTable: ' + vtable);
            var request = new Request('ALTER TABLE VS_' + vtable + ' DROP CONSTRAINT DF_VS_' + vtable + '_ID;DROP TABLE VS_' + vtable, function (err, rowCount, rows) { });
            request.on('requestCompleted', function (err) {
                console.log(vtable + ': delete table OK.');
                var request1 = new Request('SET ANSI_NULLS ON;SET QUOTED_IDENTIFIER ON;CREATE TABLE VS_' + vtable + '(ID nvarchar(50) NOT NULL,masterID nvarchar(50) NULL,parentID nvarchar(50) NULL,sequence int NULL,TS timestamp NULL,infoJSON nvarchar(max) NULL,CONSTRAINT PK_VS_' + vtable + ' PRIMARY KEY CLUSTERED (ID ASC) WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY];ALTER TABLE VS_' + vtable + ' ADD CONSTRAINT DF_VS_' + vtable + '_ID DEFAULT (newid()) FOR ID', function (err, rowCount, rows) { });
                request1.on('requestCompleted', function (err) {
                    assert.equal(err, null);
                    console.log(vtable + ': create table OK.');
                    var options = {
                        tableLock: true
                    };
                    var bulkLoad = connection.newBulkLoad('VS_' + vtable, options, function (error, rowCount) {
                        console.log(JSON.stringify(error));
                        console.log('inserted %d rows', rowCount);
                        status = "OK";
                        m.emit('done', status);
                    });
                    bulkLoad.addColumn('ID', TYPES.NVarChar, { length: 50, nullable: false });
                    bulkLoad.addColumn('masterID', TYPES.NVarChar, { length: 50, nullable: true });
                    bulkLoad.addColumn('parentID', TYPES.NVarChar, { length: 50, nullable: true });
                    bulkLoad.addColumn('sequence', TYPES.Int, { nullable: true });
                    bulkLoad.addColumn('infoJSON', TYPES.NVarChar, { length: Infinity, nullable: true });
                    dbo.collection(vtable).find().toArray(function (err, result) {
                        assert.equal(err, null);
                        for (var index in result) {
                            if (result[index].masterID == undefined) { result[index].masterID = '' }
                            if (result[index].parentID == undefined) { result[index].parentID = '' }
                            var vx = JSON.stringify(result[index].infoJSON);
                            vx = vx.replace(/\'/g, '\'\''); // replace ' with '' globaly
                            bulkLoad.addRow(result[index].ID, result[index].masterID, result[index].parentID, result[index].sequence, vx);
                        }
                        connection.execBulkLoad(bulkLoad);
                    });
                });
                connection.execSql(request1);
            });
            connection.execSql(request);
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



