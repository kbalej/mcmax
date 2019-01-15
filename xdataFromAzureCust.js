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
        var request = new Request("SELECT noCustomer ID, a.description name, ABC, prixHeure, minHW, maxHW, avHW, DateLastSale, TotalSalesInvoiced, b.description, b.ADL1, b.ADL2,b.ADL3,b.ADL4,b.ADL5 FROM VS_Customers a LEFT JOIN CRM_Contact_ADL b ON a.noContact = b.noContact AND ParDefaut <> 0 AND a.description <> 'Demole' AND a.description <> 'Green' AND a.description NOT LIKE 'Tierc' AND NOT ADL1 IS NULL AND a.DD is null FOR JSON PATH", function (err, rowCount, rows) { });
        request.on('row', function (rows) {
            b = b + rows[0].value;
        });
        request.on('requestCompleted', function () {
            var data = JSON.parse(b);
            for (var x in data) {
                var doc = data[x];
                var id = doc.ID;
                delete doc.ID;
                var o = {};
                o.ID = id;
                o.sequence = 0;
                o.infoJSON = doc;
                db.collection("cust").insertOne(o, function (err, res) { });
            }
        });
        connection.execSql(request);
    });
});
