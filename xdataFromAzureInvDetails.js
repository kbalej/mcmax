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
        var request = new Request("SELECT a.noInvoiceDetails ID, a.noInvoice masterID, a.noBrand brandsID, b.name brandsName, a.noCustomer custID, c.description custName, d.description service, a.descriptionDetails description, a.Date date, a.hourlyRate, a.hoursWorked, a.cost, a.cost_ST, a.cost_NET  FROM VS_Invoice_Details a LEFT JOIN VS_Brand b on a.noBrand = b.noBrand LEFT JOIN VS_Customers c on a.noCustomer = c.noCustomer LEFT JOIN VS_Invoice_Details_Description d on a.noInvoiceDetailsDescription = d.noInvoiceDetailsDescription WHERE a.DD is null FOR JSON PATH", function (err, rowCount, rows) { });
        request.on('row', function (rows) {
            b = b + rows[0].value;
        });
        request.on('requestCompleted', function () {
            var data = JSON.parse(b);
            for (var x in data) {
                var doc = data[x];
                var id = doc.ID;
                var masterId = doc.masterID;
                delete doc.ID;
                delete doc.masterID;
                if(doc.service === 'Lessive' || doc.service === 'Divers'){
                    doc.hourlyRate = doc.cost;
                    doc.hoursWorked = 1;
                }
                if (doc.cost_ST == undefined) {doc.cost_ST = 0;}
                var o = {};
                o.ID = id;
                o.masterID = masterId;
                o.sequence = 0;
                o.infoJSON = doc;
                db.collection("invDetails").insertOne(o, function (err, res) { });
            }
        });
        connection.execSql(request);
    });
});
