'use strict';

var url = "mongodb://localhost:27017/";
var db;
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var MongoClient = require('mongodb').MongoClient;
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
connection.on('connect', function (err) {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, con) {
        db = con.db("VS");
        var b = "";
        var request = new Request("SELECT noLaundryItem ID,noLaundryItemRef parentID,tri sequence,displayLeft name,cost FROM VS_LaundryItem order by tri FOR JSON PATH", function (err, rowCount, rows) { });
        request.on('row', function (rows) {
            b = b + rows[0].value;
        });
        request.on('requestCompleted', function () {
            var data = JSON.parse(b);
            for (var x in data) {
                var doc = data[x];
                var id = doc.ID;
                var parentID = doc.parentID;
                var sequence = doc.sequence;
                delete doc.ID;
                delete doc.parentID;
                delete doc.sequence;
                var o = {};
                o.ID = id;
                o.parentID = parentID;
                o.sequence = sequence;
                o.infoJSON = doc;
                db.collection("ldry").insertOne(o, function (err, res) { });
            }
        });
        connection.execSql(request);
    });
});
