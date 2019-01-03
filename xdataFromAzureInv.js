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
        var request = new Request("SELECT a.noInvoice ID, a.noBrand brandsID, b.name brandsName, a.noCustomer custID, c.description custName, a.description name, a.iNumber, a.Date date, a.paymentComplete paid FROM VS_Invoice a LEFT JOIN VS_Brand b on a.noBrand = b.noBrand LEFT JOIN VS_Customers c on a.noCustomer = c.noCustomer FOR JSON PATH", function (err, rowCount, rows) { });
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
                db.collection("inv").insertOne(o, function (err, res) { });
            }
        });
        connection.execSql(request);
    });
});
