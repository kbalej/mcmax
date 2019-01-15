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
        var request = new Request("SELECT noContactMoyenCommunication ID,noCustomer masterID,c.description name, b.Numero number,b.description FROM VS_Customers a INNER JOIN CRM_Contact_MoyenCommunication b ON a.noContact = b.noContact LEFT JOIN CRM_MoyenCommunication c ON b.noMoyenCommunication = c.noMoyenCommunication WHERE a.DD is null and b.DD is null FOR JSON PATH", function (err, rowCount, rows) { });
        request.on('row', function (rows) {
            b = b + rows[0].value;
        });
        request.on('requestCompleted', function () {
            var data = JSON.parse(b);
            for (var x in data) {
                var doc = data[x];
                var id = doc.ID;
                var masterID = doc.masterID;
                delete doc.ID;
                delete doc.masterID;
                var o = {};
                o.ID = id;
                o.masterID = masterID;
                o.sequence = 0;
                o.infoJSON = doc;
                db.collection("custCOM").insertOne(o, function (err, res) { });
            }
        });
        connection.execSql(request);
    });
});
