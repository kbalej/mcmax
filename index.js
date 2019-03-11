﻿var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var sql = require("./sql");
var sqlmy = require("./sqlmy");
var sqlmongo = require("./sqlmongo");
var http = require("http");

var dbh = sql;
var handle = {};
handle["/upload"] = requestHandlers.upload;
handle["/HTML.html"] = requestHandlers.load;
handle["/KB_x_getAll"] = requestHandlers.KB_x_getAll;
handle["/KB_x_addUpdate"] = requestHandlers.KB_x_addUpdate;
handle["/KB_x_delete"] = requestHandlers.KB_x_delete;
handle["/KB_x_sequencePut"] = requestHandlers.KB_x_sequencePut;
handle["/KB_getAuto"] = requestHandlers.KB_getAuto;
handle["/KB_doc"] = requestHandlers.KB_doc;
handle["/KB_chart"] = requestHandlers.KB_chart;
handle["/KB_carousel"] = requestHandlers.KB_carousel;
handle["/KB_table"] = requestHandlers.KB_table;
handle["/KB_query"] = requestHandlers.KB_query;
handle["/KB_bDB"] = requestHandlers.KB_bDB;
handle["/KB_cModule"] = requestHandlers.KB_cModule;
handle["/KB_getStats"] = requestHandlers.KB_getStats;
handle["/KB_sendMessage"] = requestHandlers.KB_sendMessage;
handle["KB_showFile"] = requestHandlers.KB_showFile;

server.start(router.route, handle,dbh);