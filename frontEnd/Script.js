var userid = "";
var usrname = "";
var usraccess = "";
var h = localStorage.getItem("userid");
var h1 = localStorage.getItem("usrname");
var h2 = localStorage.getItem("usraccess");
if(h2 == undefined){h2="";}
if(h !== undefined && h !== "") {
    userid = h;
    usrname = h1;
    usraccess = h2;
}

var mmApp = angular.module("mmApp", ['ngSanitize']);
mmApp.controller("mmCtrl", function ($scope, $timeout, $http, $sce) {

    //$scope.x_o//

    //$scope.sloc="http://mcmax.azurewebsites.net/"; // node on Azure, no port
    //$scope.floc="http://mcmax.azurewebsites.net/UploadedFiles/";  

    $scope.sloc = "http://172.22.22.51:8888/"; // node on Max Server
    $scope.floc = "file:///home/kb/Documents/p/UploadedFiles/";

    //$scope.sloc="http://localhost:8888/";  // node on Asus
    //$scope.floc="file:///Users/Admin/Onedrive/p_A/UploadedFiles/";
    // build load function
    for (var x in $scope.x_o.lookups) {
        if ($scope.x_o.lookups[x].masterLookup == undefined || $scope.x_o.lookups[x].masterLookup == null || $scope.x_o.lookups[x].masterLookup == "") { // masterLookup 
            $scope.x_o.lookups[x].load = function () {
                $http.post($scope.sloc + 'KB_x_getAll?module=' + $scope.x_o.name + '&table=' + this.getParameters + '&masterID=&rowsPage=999999&pageCt=1', JSON.stringify({
                    "params": [],
                    "sql": ""
                })).then(function (response) {
                    $scope.x_o.lookups[response.data.table].collection = response.data.rv;
                    $scope.x_o.lookups[response.data.table].tree = convertListTree(response.data.rv);
                    $scope.x_o.lookups[response.data.table].tree1 = $scope.x_o.lookups[response.data.table].tree.filter(function (e) {
                        return e.show
                    });
                }, function (err) {
                    $scope.x_o.lookups[err.data.table].collection = null;
                    $scope.x_o.lookups[err.data.table].tree = null;
                    $scope.x_o.lookups[err.data.table].tree1 = null;
                })
            };
        } else {
            $scope.x_o.lookups[x].load = function () {
                $http.post($scope.sloc + 'KB_x_getAll?module=' + $scope.x_o.name + '&table=' + this.getParameters + '&masterID=' + this.masterID + '&rowsPage=999999&pageCt=1', JSON.stringify({
                    "params": [],
                    "sql": ""
                })).then(function (response) {
                    $scope.x_o.lookups[response.data.table].collection = response.data.rv;
                    $scope.x_o.lookups[response.data.table].tree = convertListTree(response.data.rv);
                    $scope.x_o.lookups[response.data.table].tree1 = $scope.x_o.lookups[response.data.table].tree.filter(function (e) {
                        return e.show
                    });
                }, function (err) {
                    $scope.x_o.lookups[err.data.table].collection = null;
                    $scope.x_o.lookups[err.data.table].tree = null;
                    $scope.x_o.lookups[err.data.table].tree1 = null;
                });
            };
        }
    }
 
    $scope.socket = io();

    $scope.socket.on("system",function(message){
        if($scope.SelMessaging == "system"){
            var o = {};
            var d = new Date();
            o.time = d.getHours()+":"+d.getMinutes();
            o.from = "system";
            o.to = "all";
            o.message = message;
            $scope.xMessages.unshift(o);
            while($scope.xMessages.length > 20){$scope.xMessages.pop();}
        }
    });

    $scope.socket.on("user",function(message){
        var o = JSON.parse(message);
        if($scope.SelMessaging == "private" && o.to == usrname){
            $scope.xMessages.unshift(o);
            while($scope.xMessages.length > 20){$scope.xMessages.pop();}
        }
        if($scope.SelMessaging == "all"){
            $scope.xMessages.unshift(o);
            while($scope.xMessages.length > 20){$scope.xMessages.pop();}
        }
    });

    $scope.xMessages = [];
    $scope.SelMessaging = "system";
    $scope.messageFor = "";
    $scope.messageBody = "";
    $scope.messageSend = function () {
        if($scope.messageBody !== ""){
            var o = {};
            var d = new Date();
            o.time = d.getHours()+":"+d.getMinutes();
            o.from = usrname;
            o.to = $scope.messageFor;
            o.message = $scope.messageBody;
            //$scope.socket.emit("server",JSON.stringify(o)); not working
            $http.post($scope.sloc + 'KB_sendMessage?module=KB', JSON.stringify(o)).then
            (function (response) {
                $scope.messageFor = "";
                $scope.messageBody = "";
            }, function (err) {
                alert("send message error");
            }); 
        }
    }
    
    $scope.x_form = " ";
    $scope.x_page= " ";
    $scope.mainForms = [];
    for(var x in $scope.x_o.forms) {
        if($scope.x_o.forms[x].parent == undefined || $scope.x_o.forms[x].parent == '' && $scope.x_o.forms[x]._R)
        {
            $scope.mainForms.push($scope.x_o.forms[x]);
        }
    }
    
    $scope.SelMod = $scope.x_o.name;
    $scope.SelLevel = "";
    $scope.SelRole = "";
    $scope.AvailableModules = $scope.x_o.dbs;
    $scope.AvailableModules["0"]={"name":"refresh"};
    $scope.AvailableLevels = ["KB","Administrator","Superuser","User","Guest"];


    $http.post($scope.sloc + 'KB_getStats', "").then(function (response) {
        var h = "[" + response.data + "]";
        var h1 = eval(h);
        $scope.data1 = h1[0];
        $scope.data2 = h1[1];
   
        var years1 = [];
        for (var i = 0; i < $scope.data1.length; i++) {
            Element = $scope.data1[i];
            var year = {
                label: Element.nYear.substring(8,10),   // last 2 characters = day
                y: Element.Tnet
            };
            years1.push(year);
        }
        str = JSON.stringify(years1);
        var ress1 = str.replace(/"/g, "");
        ress1 = ress1.replace(/label:/g, 'label: "');
        ress1 = ress1.replace(/,y:/g, '", y: ');
   
        var services = [];
        for (var i = 0; i < $scope.data2.length; i++) {
            Element = $scope.data2[i];
            var s = {
                label: Element.Service,
                y: Element.Tnet
            };
            services.push(s);
        }
        str = JSON.stringify(services);
        var ress2 = str.replace(/"/g, "");
        ress2 = ress2.replace(/label:/g, 'label: "');
        ress2 = ress2.replace(/,y:/g, '", y: ');
    
        $scope.chart1 = new CanvasJS.Chart("chartContainer1", 
        {
            title: {
                text: "logins"
            },
            data: [
                {
                    type: "splineArea",
                    dataPoints: eval(ress1)
                }
            ]
        }
        );
        $scope.chart1.render();
        $scope.chart2 = new CanvasJS.Chart("chartContainer2", 
        {
            title: {
                text: "top 10"
            },
            data: [
                {
                    // Change type to "doughnut", "line", "splineArea", etc.
                    type: "doughnut",
                    dataPoints: eval(ress2)
                }
            ]
        });
        $scope.chart2.render();
    
    }, function (err) {
        alert("get stats error");
    }); 

    $scope.x_n = [];
    $scope.xElement = {};
    $scope.topName="";

    $scope.changeModule = function(){
        if($scope.SelMod=='refresh'){$scope.SelMod=$scope.x_o.name;};
        window.open($scope.sloc + "HTML.html?module="+$scope.SelMod,'_self',false);
    };

    if($scope.x_n.length>0){
        if($scope.x_n[$scope.x_n.length-1].xElement.name == undefined){
            $scope.topName = "details " + $scope.x_form;
        }else{
            $scope.topName = $scope.x_n[$scope.x_n.length-1].xElement.name + " " + $scope.x_form;
        }
    } else {
        $scope.topName = $scope.x_form;
    }
    $scope.x_rowsPage = 20;
    $scope.x_rowsMax = 1;
    $scope.x_pageCt = 1;

    var ca = $scope.x_o.columns;
    var c = {};

    // load top level lookups
    for (var lu in $scope.x_o.lookups) {
        if ($scope.x_o.lookups[lu].masterLookup == undefined || $scope.x_o.lookups[lu].masterLookup == null) {
            $scope.x_o.lookups[lu].load();
        }
    }

    $scope.mymenu = function (e) {
        if (e === "quit") {
            localStorage.removeItem("userid")
            localStorage.removeItem("usrname")
            localStorage.removeItem("usraccess")
            window.close();
        };
        if (e === "mydata") {
            $scope.x_form = "mydata";
            $scope.x_page = "EDIT";
            $scope.xElement = $scope.myData;
        };
    };

    $scope.select = function (id, table) {
        if (selectListTree(id, $scope.x_o.lookups[table].tree)) {
            $scope.x_o.lookups[table].tree1 = null;
            $scope.x_o.lookups[table].tree1 = $scope.x_o.lookups[table].tree.filter(function (e) {
                return e.show
            });
        }
    };

    treeUpdate = function () { // called when initialising new or edited xElement
        var y = "" + $scope.x_o.forms[$scope.x_form].fieldsLookup;
        if (y !== "") {
            var x = y.split(",");
            if (x.length > 0) {
                for (var v in x) {
                    var vid = "";
                    if ($scope.xElement.infoJSON[x[v]] !== undefined) {
                        vid = $scope.xElement.infoJSON[x[v]]; // get current id value
                    }
                    var l = x[v].substring(0, x[v].length - 2); // lookup name
                    var t = $scope.x_o.lookups[l].tree;
                    for (var h in t) {
                        if (t[h].level > 0) {
                            if (t[h].ID === vid) {
                                t[h].show = true;
                            } else {
                                t[h].show = false;
                            }
                        }
                    }
                    $scope.x_o.lookups[l].tree1 = null;
                    $scope.x_o.lookups[l].tree1 = $scope.x_o.lookups[l].tree.filter(function (e) {
                        return e.show;
                    });
                }
            }
        }
    };

    $scope.spacesListTree = function (level) {
        var s = "",
            i;
        for (i = 0; i < level; i++) {
            s += "....";
        }
        return s;
    };


    convertListTree1 = function (level, id, list, tree) {
        level += 1;
        var t;
        if(id == ""){
            t = list.filter(function (e) { return e.parentID == ""; } );
        }else{
            var t = list.filter(function (e) { return e.parentID.includes(id); });
        }
        for (var x in t) {
            var o = {};
            o.ID = t[x].ID;
            if (level == 0) {
                o.show = true;
            } else {
                o.show = false;
            }
            o.level = level;
            o.name = t[x].infoJSON.name;
            o.parentID = t[x].parentID;
            o.sel = false;
            tree.push(o);
            convertListTree1(level, t[x].ID, list, tree);
        }
    };

    convertListTree = function (list) {
        var tree = [];
        convertListTree1(-1, "", list, tree);
        return tree;
    };

    selectListTree = function (id, tree) {
        var ct = 0;
        for (var x in tree) {
            if (tree[x].parentID == id) {
                ct += 1;
            }
        }
        if (ct < 1) {
            return false;
        }

        var first = true;
        for (var x in tree) {
            tree[x].sel = false;
            if (tree[x].level > 0) {
                tree[x].show = false;
                if (tree[x].parentID == id) {
                    tree[x].show = true;
                    if (first) {
                        first = false;
                        tree[x].sel = true;
                    }
                }
            }
        }
        return true
    };

    removeString = function (s) {
        var v = s;
        try {
            if (v.includes('STRING:')) {
                v = v.substring(7);
            }
        } catch (err) {
            v = undefined;
        }
        return v;
    };

    removeTrailingComma = function (s) {
        var v = "";
        if (s.length > 0) {
            v = s.substring(0, s.length - 1);
        }
        return v;
    };

    $scope.orderByMe = function (x) { // sort LIST items by clicking on column header
        if ($scope.myOrderBy === undefined) {
            var x1 = x.replace("ID", "Name"); // replace xID by xName
            $scope.myOrderBy = "infoJSON." + x1;
        } else {
            $scope.myOrderBy = undefined;
        }
    };


    // map handling

    initMap = function (p) { // map field, eg 'map'
        var geocoder = new google.maps.Geocoder();
        var map = new google.maps.Map(document.getElementById("Googlemap"), {
            center: {
                lat: 46.07869193484069,
                lng: 7.215027570724487
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoom: 16
        });

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(46.07869193484069, 7.215027570724487),
            title: 'x',
            map: map,
            draggable: true
        });

        google.maps.event.addListener(marker, 'dragend', function () {
            var pos = marker.getPosition();
            $scope.xElement.infoJSON[p + "Latitude"] = pos.lat();
            $scope.xElement.infoJSON[p + "Longitude"] = pos.lng();
        });
    };


    // image handling 

    removePicture = function (p) {
        //$http.delete($scope.apiEndpoint + '/api/XdeleteFile/' + $scope.xElement.infoJSON[p]);
        $scope.xElement.infoJSON[p] = "smily.jpg";
        $scope.xElement.infoJSON[p + "Path"] = $scope.floc + $scope.xElement.infoJSON[p];
    };

    changePicture = function (n, p) {
        var data = new FormData();
        var files = $("#" + n).get(0).files;
        if (files.length > 0) {
            if (files[0].size / 1000 > 10000) {
                alert('Max File size is 10 MB !');
                return false;
            }
            data.append("UploadedImage", files[0]);
        } else {
            alert('No file selected !');
            return false;
        }
        var ajaxRequest = $.ajax({
            type: "POST",
            url: $scope.sloc + 'upload',
            contentType: false,
            processData: false,
            data: data,
            success: function (data) {
                $scope.xElement.infoJSON[p] = data;
                $scope.xElement.infoJSON[p + "Path"] = $scope.floc + $scope.xElement.infoJSON[p];
                $scope.xSave();
                return true;
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('File upload error: ' + textStatus);
                return false;
            },
        });
    };

    // after modification of lookup field
    $scope.completeLookupField = function (buffer, item, lookupFields) {
        // complete buffer (xElement or xSearch): <item>Name + masterID + masterName + lookupFields
        var ij = ".infoJSON.";
        if(buffer == "xSearch") {ij = ".";}
        var t_p = eval("$scope." + buffer + ij + item + "ID");
        var t_c = $scope.x_o.lookups[item].collection;
        var t_e = t_c.filter(function (e) {
            return e.ID == t_p;
        });
        eval('$scope.' + buffer + ij + item + 'Name = t_e[0].infoJSON.name');
        if (typeof $scope.x_o.lookups[item].masterLookup !== undefined) {
            eval('$scope.' + buffer + ij + item + 'masterID = $scope.x_o.lookups.' + item + '.masterID');
            eval('$scope.' + buffer + ij + item + 'masterName = $scope.x_o.lookups.' + item + '.masterName');
        }
        if (lookupFields !== undefined && lookupFields !== '') {
            var result = lookupFields.match(/\w+/g);
            for (var i = 0; i < result.length; i = i + 2) {
                eval('$scope.' + buffer + ij + result[i + 1] + ' = t_e[0].infoJSON.' + result[i]); // eg cost unitCost
            }
        }
        // init first sublevel lookups
        for (var x in $scope.x_o.lookups) {
            if ($scope.x_o.lookups[x].masterLookup === item) {
                if ($scope.x_o.lookups[x].masterID !== t_p) {
                    $scope.x_o.lookups[x].masterID = t_p;
                    $scope.x_o.lookups[x].masterName = t_e.infoJSON.name;
                    $scope.x_o.lookups[x].load();
                }
            }
        }
    };

    $scope.getDescripton = function (subform) { // get description for subform
        return $scope.x_o.forms[subform].description;
    };

    // when starting add / view. for table lookup 

    initLookups = function () {
        for(var x in $scope.x_o.lookups){
            if($scope.x_o.lookups[x].masterLookup === $scope.x_o.forms[$scope.x_form].tablesName){
                $scope.x_o.lookups[x].masterID = $scope.xElement.ID;
                $scope.x_o.lookups[x].load();
            }
        }
        var lu;
        var y = "" + $scope.x_o.forms[$scope.x_form].fieldsLookup;
        var x = y.split(",");
        if (x[0] !== undefined && x[0] !== "") {
            for (var v in x) {
                var vlookup = x[v].substring(0, x[v].length - 2);
                if ($scope.xElement.infoJSON[x[v]] !== undefined) {
                    if ($scope.x_o.lookups[vlookup] !== undefined) {
                        if ($scope.x_o.lookups[vlookup].masterLookup !== undefined && $scope.x_o.lookups[vlookup].masterLookup !== null) { // sublevel
                            if ($scope.x_o.lookups[vlookup].masterID !== $scope.xElement.infoJSON[vlookup + 'masterID']) {
                                $scope.xElement.infoJSON[vlookup + 'ID'] = null;
                                $scope.xElement.infoJSON[vlookup + 'Name'] = null;
                                $scope.xElement.infoJSON[vlookup + 'masterID'] = null;
                                $scope.xElement.infoJSON[vlookup + 'masterName'] = null;
                            }
                            for (lu in $scope.x_o.lookups) {
                                if ($scope.x_o.lookups[lu].masterLookup === vlookup) {
                                    if ($scope.x_o.lookups[lu].masterID !== $scope.xElement.infoJSON[$scope.x_o.lookups[lu].name + 'masterID']) {
                                        $scope.x_o.lookups[lu].masterID = removeString($scope.xElement.infoJSON[$scope.x_o.lookups[lu].name + 'masterID']);
                                        $scope.x_o.lookups[lu].masterName = $scope.xElement.infoJSON[$scope.x_o.lookups[lu].name + 'masterName'];
                                        $scope.x_o.lookups[lu].load();
                                    }
                                }
                            }
                        } else {
                            for (lu in $scope.x_o.lookups) {
                                if ($scope.x_o.lookups[lu].masterLookup === vlookup) {
                                    if ($scope.x_o.lookups[lu].masterID !== $scope.xElement.infoJSON[x[v]]) {
                                        $scope.x_o.lookups[lu].masterID = removeString("" + $scope.xElement.infoJSON[x[v]]);
                                        $scope.x_o.lookups[lu].masterName = $scope.xElement.infoJSON[x[v].substring(0, x[v].length - 2) + "Name"];
                                        $scope.x_o.lookups[lu].load();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    setDefaults = function () { // for empty xElement fields
        for (var p in $scope.x_o.forms[$scope.x_form].pages) {
            if (p.substring(0, 4) === "EDIT") {
                for (var fi in $scope.x_o.forms[$scope.x_form].pages[p].fields) {
                    if ($scope.x_o.forms[$scope.x_form].pages[p].fields[fi] !== undefined && $scope.x_o.forms[$scope.x_form].pages[p].fields[fi] !== null) {
                        c = ca[$scope.x_o.forms[$scope.x_form].pages[p].fields[fi].columnsID];
                        if (c !== undefined && c.label !== undefined) { // skip pages without fields and no show fields
                            if (c.default !== undefined) {
                                if (c.fieldType === "date" || c.fieldType === "datetime" || c.fieldType === "local" || c.fieldType === "month" || c.fieldType === "time" || c.fieldType === "week") {
                                    var td = new RegExp("today");
                                    var r = td.test(c.default);
                                    var i = parseInt(c.default);
                                    if (r) { // eg '-10today' for 10 days before today, +-number first !
                                        var d = new Date();
                                        if (!isNaN(i)) {
                                            d.setDate(d.getDate() + i);
                                        }
                                        $scope.xElement.infoJSON[c.name] = d;
                                        $scope.xEditFormDirty = true;
                                    } else {
                                        $scope.xElement.infoJSON[c.name] = new Date(c.default);
                                        $scope.xEditFormDirty = true;
                                    }
                                } else {
                                    if (c.fieldType === "lookup" && c.source === "table") {
                                        var t = $scope.x_o.lookups[c.lookup].collection.filter(function (e) {
                                            return (e.infoJSON.name == c.default);
                                        });
                                        if (t.length > 0) {
                                            $scope.xElement.infoJSON[c.name.substring(0, c.name.length - 2) + "Name"] = c.default;
                                            $scope.xElement.infoJSON[c.name] = t[0].ID;
                                        }
                                    } else {
                                        $scope.xElement.infoJSON[c.name] = c.default;
                                    }
                                    $scope.xEditFormDirty = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    validateElement = function (e, flag) { // xElement.infoJSON + flag, true for validation, false for fieldError removal only
        var vok = true;
        var t_val = {};
        var res, patt, p, fi, x, t, c, mess = [];
        for (p in $scope.x_o.forms[$scope.x_form].pages) {
            if (p.substring(0, 4) === "EDIT") {
                for (fi in $scope.x_o.forms[$scope.x_form].pages[p].fields) {
                    if (fi !== undefined && fi !== null) {
                        if ($scope.x_o.forms[$scope.x_form].pages[p].fields[fi] !== undefined && $scope.x_o.forms[$scope.x_form].pages[p].fields[fi] !== null) {
                            c = ca[$scope.x_o.forms[$scope.x_form].pages[p].fields[fi].columnsID];
                            if (c !== undefined && typeof c.label !== undefined) { // skip pages without fields and show fields with label only
                                if (t_val[c.name] === undefined) {
                                    $scope.x_o.forms[$scope.x_form].pages[p].fields[fi].validation = "form-control";
                                    t_val[c.name] = {};
                                    t_val[c.name].name = c.name;
                                    t_val[c.name].html = []; // pointer to model fields for each xElement field
                                    t_val[c.name].html.push(p + " " + fi);
                                    if (c.required !== undefined) {
                                        t_val[c.name].required = c.required.replace(/_/gi, "$scope.xElement.infoJSON.").replace(/::/gi, "'");
                                    }
                                    if (c.pattern !== undefined) {
                                        t_val[c.name].regex = c.pattern;
                                    }
                                    if (c.excluded !== undefined) {
                                        t_val[c.name].excluded = c.excluded;
                                    }
                                    if (c.fieldType === 'number') {
                                        t_val[c.name].number = true;
                                    }
                                } else {
                                    t_val[c.name].html.push(p + " " + fi);
                                }
                            }
                        } else {
                            alert("bad " + $scope.x_form + " " + p + " " + fi)
                        };
                    } else {
                        alert("bad fi");
                    }
                }
            }
        }
        if (flag) {
            // update xElement calcNumbers from form field value - angular link not operational for calculated fields
            // $scope.xElement.infoJSON.net = document.getElementById("<form>net").value
            var t_c = $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].columns;
            for (var c in t_c) {
                if ($scope.x_o.columns[t_c[c]].calcNumber !== undefined && $scope.x_o.columns[t_c[c]].calcNumber) {
                    if (eval("document.getElementById('" + $scope.x_o.forms[$scope.x_form].name + $scope.x_o.columns[t_c[c]].name + "').value") !== undefined) {
                        eval("$scope.xElement.infoJSON[$scope.x_o.columns[t_c[c]].name] = document.getElementById('" + $scope.x_o.forms[$scope.x_form].name + $scope.x_o.columns[t_c[c]].name + "').value");
                    }
                }
            }
            for (x in e) {
                if (t_val[x] !== undefined) {
                    t_val[x].value = e[x];
                }
            }
            for (t in t_val) {
                if (t_val[t].value === undefined) {
                    if (t_val[t].required !== undefined) {
                        try {
                            res = eval(t_val[t].required); // eg $scope.xElement.infoJSON.x === 'abc' || $scope.xElement.infoJSON.y (=exists) && $scope.xElement.infoJSON.z > 3
                        } catch (err) {
                            res = false;
                        } finally {
                            if (res) {
                                t_val[t].status = false;
                                mess.push(t_val[t].name + ": required");
                            }
                        }
                    }
                } else {
                    if (t_val[t].regex !== undefined) {
                        patt = new RegExp("[" + t_val[t].regex + "]", "g");
                        res = patt.test(t_val[t].value);
                        if (!res) {
                            t_val[t].status = false;
                            mess.push(t_val[t].name + ": regex pattern");
                        }
                    }
                    if (t_val[t].excluded !== undefined) { // check for forbidden characters
                        patt = new RegExp("[" + t_val[t].excluded + "]", "g");
                        res = patt.test(t_val[t].value);
                        if (res) {
                            t_val[t].status = false;
                            mess.push(t_val[t].name + ": excluded characters");
                        }
                    }
                    if (t_val[t].number !== undefined) {
                        if (isNaN(t_val[t].value)) {
                            t_val[t].status = false;
                            mess.push(t_val[t].name + ": not numeric");
                        }
                    }
                }
            }
            for (t in t_val) {
                if (t_val[t].status !== undefined) {
                    for (x in t_val[t].html) {
                        patt = /\w+/g;
                        res = t_val[t].html[x].match(patt);
                        $scope.x_o.forms[$scope.x_form].pages[res[0]].fields[res[1]].validation = "form-control fieldError";
                        vok = false;
                    }
                }
            }
            t_val = undefined;
            if (!vok) {
                alert(mess);
            }
            return vok;
        }
    };

    // *** login page


    $scope.x_page = "LOGIN";
    $scope.error = "";
    $scope.login = {
        "usrname": "",
        "password": ""
    };

    if(userid !== undefined && userid !== "" && userid !== null){
        var searchParameters = [];
        var o = {};
        o.field = "ID";
        o.compare = "EQUAL";
        o.value = userid;
        searchParameters.push(o);
        $scope.xSearchSql = {};
        $scope.xSearchSql.params = searchParameters; // array of objects: field, compare, value
        $scope.xSearchSql.sql = "ID = '" + userid + "'";
        $scope.login.usrname = usrname;
        $http.post($scope.sloc + "KB_x_getAll?module=KB&table=users&jsonFields=&orderBy=name&masterID=%&rowsPage=1&pageCt=1", JSON.stringify($scope.xSearchSql)).then
            (function (response) {
                debugger;
                if (response.data.rv.length > 0) {
                    $scope.myData = response.data.rv[0];
                    if($scope.myData.db == $scope.x_o.name || $scope.myData.level === "admin" && $scope.x_o.name === "KB" || $scope.login.usrname === "k"){
                        if(setAccessRights()) {
                            $scope.error = "";
                            $scope.x_page = " "; // show main menu only
                        }
                    } else {
                        $scope.error = ">> no access rights <<"; 
                        userid=""; 
                    }                       
                } else {
                    $scope.error = ">> user unknown <<";
                    userid=""; 
                }
            },function (err) {
                $scope.error = ">> system error <<";
                userid=""; 
            }
        );
    }

    $scope.log_in = function () {
        var searchParameters = [];
        var o = {};
        o.field = "un";
        o.compare = "EQUAL";
        o.value = $scope.login.username;
        searchParameters.push(o);
        o = {};
        o.field = "pwd";
        o.compare = "EQUAL";
        o.value = $scope.login.password;
        searchParameters.push(o);
        var xSearchSql = {};
        xSearchSql.params = searchParameters; // array of objects: field, compare, value
        xSearchSql.sql = "JSON_VALUE(infoJSON,'$.un') = '" + $scope.login.usrname + "' and JSON_VALUE(infoJSON,'$.pwd') = '" + $scope.login.password + "'";
        $http.post($scope.sloc + "KB_x_getAll?module=KB&table=users&jsonFields=&orderBy=name&masterID=%&rowsPage=1&pageCt=1", JSON.stringify(xSearchSql)).then
            (function (response) {
                if (response.data.rv.length > 0) {
                    userid = response.data.rv[0].ID;
                    usrname = response.data.rv[0].infoJSON.name;
                    usraccess = response.data.rv[0].infoJSON.access;
                    localStorage.setItem("userid", userid);
                    localStorage.setItem("usrname", usrname);
                    localStorage.setItem("usraccess", usraccess);
                    $scope.myData = response.data.rv[0];
                    if(setAccessRights()) {
                        var h={};
                        h.date=new Date();
                        $http.post($scope.sloc + 'KB_x_addUpdate?module=KB&table=logins&ID=&masterID=' + userid + '&orderBy=date&parentID=&sequence=0&uid=' + userid, JSON.stringify(h)).then
                        (
                            function (response) 
                            {
                                $scope.error = "";
                                $scope.x_page = " "; // show main menu only
                            }, 
                            function (err)
                            {
                                alert("login save error");
                            }
                        );
                    } else {
                        $scope.error = ">> no access rights <<"; 
                    }
                } else {
                    $scope.error = ">> user name / password unknown <<";
                }
            },function (err) {
                $scope.error = ">> e r r o r <<";
            }
        );
    };

    setAccessRights = function() {
        var kb = false;
        var all = false;
        var level = "";
        var role = "";
        var availM = {};
        var t = usraccess.split(" ");
        for(var x in t){  // for all dbs defined in access
            var t1  = t[x].split(":");  // db:level+role
            if(t1[0] === "KB") {kb = true; all = true;$scope.SelLevel = "KB";} else {
                if(t1[0] === $scope.x_o.name && (t1[0] === "Administrator" || t1[0] === "Superuser"))
                {
                     all=true;
                }
                if(t1[0] === $scope.x_o.name)
                {
                    var a = {};
                    a.name = t1[0];
                    availM[t[0]]=a; // object key not relevant
                    level = t2[0];
                    $scope.SelLevel = level;
                    role = t2[1];
                }
            }
        }
        if(kb)
        {
            $scope.AvailableModules = $scope.x_o.dbs;
        }else
        {
            $scope.AvailableModules = availM;
        }
        $scope.AvailableModules["0"]={"name":"refresh"};

        if(!all)
        {
            if(level == ""){return false;} // no access rights for current module

            var searchParameters = [];
            var o = {};
            o.field = "modulesID";
            o.compare = "EQUAL";
            o.value = $scope.x_o.ID; 
            searchParameters.push(o);
            var xSearchSql = {};
            xSearchSql.params = searchParameters; // array of objects: field, compare, value
            xSearchSql.sql = "JSON_VALUE(infoJSON,'$.modulesID') = '" + $scope.x_o.ID + "'";
    
            $http.post($scope.sloc + "KB_x_getAll?module=KB&table=accessRights&jsonFields=&orderBy=sequence&masterID=%&rowsPage=900&pageCt=1", JSON.stringify(xSearchSql)).then
            (
                function (response) 
                {
                    var xList = response.data.rv;

                    for(var x in xList)
                    {
                        var ok=true;
                        if(role !== "")
                        {
                            if(xList[x].roles === undefined || xList[x].roles === null || xList[x].roles === "")
                            {
                                ok=false;
                            }else
                            {
                                if(!xList[x].roles.includes(role))
                                {
                                    ok=false;
                                }
                            }
                        }
                        if(ok)
                        {
                            $scope.x_o.forms[$scope.xList[x].formsName]._C = xList[x].create;
                            $scope.x_o.forms[$scope.xList[x].formsName]._R = xList[x].read;
                            $scope.x_o.forms[$scope.xList[x].formsName]._U = xList[x].update;
                            $scope.x_o.forms[$scope.xList[x].formsName]._D = xList[x].delete;
                            for(var z in $scope.x_o.forms)
                            {
                                if($scope.x_o.forms[z].ID === $scope.x_o.forms[$scope.xList[x].formsName].parentID)
                                {
                                    if($scope.x_o.forms[z].parentID !== undefined && $scope.x_o.forms[z].parentID !== "")
                                    {
                                        setReadRights($scope.x_o.forms[z].name);                        }
                                    }
                                }
                            }
                        }

                },
                function (err)
                {
                    alert("error setAccessRights " + JSON.stringify(err));
                    return false;
                }
            );
        } else 
        {
            for(var x in $scope.x_o.forms) 
            {
                $scope.x_o.forms[x]._C = true;
                $scope.x_o.forms[x]._R = true;
                $scope.x_o.forms[x]._U = true;
                $scope.x_o.forms[x]._D = true;
            } 
        }
        return true; 
    };

    setReadRights = function(f) { // all top level forms
        if(f !== undefined && f !== ""){
            $scope.x_o.forms[f]._R = true;
            if($scope.x_o.forms[f].parentID !== undefined && $scope.x_o.forms[f].parentID !== "")
            {
                for(var z in $scope.x_o.forms){
                    if($scope.x_o.forms[z].ID === $scope.x_o.forms[f].parentID){
                        setReadRights($scope.x_o.forms[z].name);                        }
                }
            }
        }
    };

    // *** navbar

    $scope.navMain = function (item) {
        $scope.x_form = item;
        if ($scope.x_o.forms[$scope.x_form].rowsPage !== undefined) {
            $scope.x_rowsPage = $scope.x_o.forms[$scope.x_form].rowsPage;
        }
        $scope.x_pageCt = 1;
        $scope.x_masterID = "";
        $scope.x_n = [];
        $scope.topName="";
        $scope.myOrderBy = undefined;
        $scope.xSearchListTitle = "";
        $scope.xSearchSql = {};
        $scope.xSearchSql.params = [];
        $scope.xSearchSql.sql = "";
        $scope.xInit();
    };

    $scope.navUp = function (item) {
        var temp = {
            "form": ""
        };
        while (temp.form !== item.form || temp.form === "") {
            temp = $scope.x_n.pop();
        }
        retrievePrevious(temp, "", "");
        if ($scope.x_o.forms[$scope.x_form].pages["TREE"] == undefined) {
            $scope.x_page = "LIST";
        } else {
            $scope.x_page = "TREE";
        }
        $scope.xEditFormDirty = false;
        $scope.topName="";
        xInitComplete();
    };

    retrievePrevious = function (temp, vto, vfromValue) {
        $scope.x_masterID = temp.masterID;
        $scope.x_form = temp.form;
        if ($scope.x_o.forms[$scope.x_form].rowsPage !== undefined) {
            $scope.x_rowsPage = $scope.x_o.forms[$scope.x_form].rowsPage;
        }
        $scope.x_pageCt = temp.pageCt;
        $scope.x_page = temp.page;
        $scope.xSearch = Object.assign({}, temp.xSearch);
        $scope.xSearchListTitle = temp.xSearchListTitle;
        $scope.xSearchSql = temp.xSearchSql;
        $scope.xElement = Object.assign({}, temp.xElement);
        if (vto !== "" && vfromValue !== "") {
            $scope.xElement.infoJSON[vto] = vfromValue;
        }
        $scope.myOrderBy = undefined;
    };

    $scope.navDown = function (item) {
        $scope.x_n.push({
            "form": $scope.x_form,
            "page": $scope.x_page,
            "masterID": $scope.x_masterID,
            "pageCt": $scope.x_pageCt,
            "xSearch": Object.assign({}, $scope.xSearch),
            "xSearchListTitle": $scope.xSearchListTitle,
            "xSearchSql": $scope.xSearchSql,
            "xElement": Object.assign({}, $scope.xElement)
        });
        $scope.topName="";
        $scope.x_masterID = $scope.xElement.ID;
        $scope.x_form = item;
        if ($scope.x_o.forms[$scope.x_form].rowsPage !== undefined) {
            $scope.x_rowsPage = $scope.x_o.forms[$scope.x_form].rowsPage;
        }
        $scope.x_pageCt = 1;
        $scope.myOrderBy = undefined;
        $scope.xSearchListTitle = "";
        $scope.xSearchSql = {};
        $scope.xSearchSql.params = [];
        $scope.xSearchSql.sql = "";
        $scope.xInit();
    };

    $scope.navTab = function (item) {
        $scope.x_page = item;
    };


    // x pages

    $scope.xSearch = {};
    $scope.xSearchListTitle = "";
    $scope.xSearchSql = {};
    $scope.xSearchSql.params = [];
    $scope.xSearchSql.sql = "";

    $scope.xInitSearch = function () {
        $scope.xSearch = {}; // no infoJSON
        $scope.xSearchListTitle = "";
        $scope.xSearchSql = {};
        $scope.xSearchSql.params = [];
        $scope.xSearchSql.sql = "";
        $scope.x_page = "SEARCH";
    };

    $scope.xStartSearch = function () {
        var searchParameters = [];
        var s = "";
        var ss = "";
        for (var x in $scope.xSearch) {
            if ($scope.x_o.forms[$scope.x_form].pages[$scope.x_page].fields[x] !== undefined) {
                var vcomparisonType = "equal"; // default
                if ($scope.x_o.forms[$scope.x_form].pages[$scope.x_page].fields[x].comparisonType !== undefined) {
                    vcomparisonType = $scope.x_o.forms[$scope.x_form].pages[$scope.x_page].fields[x].comparisonType;
                }
                if (s.length > 0) {
                    s += " AND ";
                    ss += " AND ";
                }
                var c = ca[$scope.x_o.forms[$scope.x_form].pages[$scope.x_page].fields[x].columnsID]; // access to fieldType

                if (c.fieldType === "date") {
                    var d = new Date($scope.xSearch[x]);
                    v = d.toISOString().substring(0, 10);
                    s += "LEFT(JSON_VALUE(infoJSON, '$." + ca[$scope.x_o.forms[$scope.x_form].pages[$scope.x_page].fields[x].columnsID].name + "'),10) ";
                } else {
                    v = $scope.xSearch[x];
                    s += "JSON_VALUE(infoJSON, '$." + ca[$scope.x_o.forms[$scope.x_form].pages[$scope.x_page].fields[x].columnsID].name + "') ";
                }
                ss += ca[$scope.x_o.forms[$scope.x_form].pages[$scope.x_page].fields[x].columnsID].name + " " + $scope.x_o.forms[$scope.x_form].pages[$scope.x_page].fields[x].comparisonType + " " + v;
                switch (vcomparisonType) {
                    case "notEqual":
                        {
                            s += "<> '" + v + "'";
                            break;
                        }
                    case "contains":
                        {
                            s += "LIKE '%" + v + "%'";
                            break;
                        }
                    case "beginsWith":
                        {
                            s += "LIKE '" + v + "%'";
                            break;
                        }
                    case "doesNotContain":
                        {
                            s += "NOT LIKE '%" + v + "%'";
                            break;
                        }
                    case "greaterThan":
                        {
                            s += "> '" + v + "'";
                            break;
                        }
                    case "greaterThanEqual":
                        {
                            s += ">= '" + v + "'";
                            break;
                        }
                    case "lessThan":
                        {
                            s += "< '" + v + "'";
                            break;
                        }
                    case "lessThanEqual":
                        {
                            s += "<= '" + v + "'";
                            break;
                        }
                    case "isBlank":
                        {
                            s += "IS NULL";
                            break;
                        }
                    case "isNotBlank":
                        {
                            s += "IS NOT NULL";
                            break;
                        }
                    case "multiple":
                        {
                            var s1 = []; // for searchParameters
                            if (v.length > 1) {
                                s += "IN (";
                                for (var y in v) {
                                    s += "'" + v[y] + "',";
                                    s1.push(v[y]);
                                }
                                removeTrailingComma(s);
                                s += ")";
                                v = s1;
                                break;
                            } else {
                                s += "= '" + v + "'";
                                s1[0] = v;
                                v = s1;
                                break;
                            }
                        }
                    default: // equal
                        {
                            s += "= '" + v + "'";
                            break;
                        }
                }
                var o = {};
                o.field = ca[$scope.x_o.forms[$scope.x_form].pages[$scope.x_page].fields[x].columnsID].name;
                o.compare = vcomparisonType;
                o.value = v;
                searchParameters.push(o);
            }
        }

        $scope.xSearchSql = {};
        $scope.xSearchSql.params = searchParameters; // array of objects: field, compare, value
        $scope.xSearchSql.sql = s;
        $scope.xSearchListTitle = ss;
        $scope.xInit();
    };

    $scope.xInit = function () {
        $scope.xEditFormDirty = false;
        if ($scope.x_o.forms[$scope.x_form].pages["TREE"] == undefined) {
            $scope.x_page = "LIST";
        } else {
            $scope.x_page = "TREE";
        }
        xInitComplete();
    };

    buildTree = function (l, id) {
        var llevel = l + 1;
        var t;
        if(id === ""){
            t = $scope.xList.filter(function (e) { return e.parentID == ""; });
        }else{
            t = $scope.xList.filter(function (e) { return e.parentID.includes(id); });
        }
        for (var x in t) {
            var n = {};
            n.ID = t[x].ID;
            n.parentID = t[x].parentID;
            n.sequence = t[x]._sequence; // in xList
            n.display = t[x].infoJSON.name;
            if(t[x].infoJSON.description == undefined){n.description = "";}else{n.description = t[x].infoJSON.description;}
            n.level = llevel;
            var tt = $scope.xList.filter(function (e) { return e.parentID.includes(t[x].ID); });
            n.numberChildren = tt.length;
            if (n.numberChildren > 0) {
                n.status = "+";
            } else {
                n.status = " ";
            }
            if(n.level < 1){
                n.show = true;
            }else{
                n.show = false;
            }       
            n.position = $scope.xTree.length;
            $scope.xTree.push(n);
            if (n.numberChildren > 0) {
                buildTree(llevel, t[x].ID);
            }
        }
    };

    $scope.getStatusClass = function (parentID) {
        if(parentID !== undefined && parentID.length>40) { 
            return "yellow";
        } else {
            return "";
        }
    };

    xInitComplete = function () {
        if($scope.x_n.length>0){
            if($scope.x_n[$scope.x_n.length-1].xElement.name == undefined)
                {if($scope.x_n[$scope.x_n.length-1].xElement.date == undefined){$scope.topName = "details " + $scope.x_form;
                } else {$scope.topName = $scope.x_n[$scope.x_n.length-1].xElement.date + " " + $scope.x_form;}
            }else{ $scope.topName = $scope.x_n[$scope.x_n.length-1].xElement.name + " " + $scope.x_form;}
        } else {
            $scope.topName = $scope.x_form;
        }
        var h = $scope.x_masterID;
        if($scope.x_o.forms[$scope.x_form].masterEmpty){h = "";}
        if($scope.x_o.forms[$scope.x_form].ignoreMaster){h = "%";}
        if($scope.x_o.forms[$scope.x_form].userOnly){
            var ho = {};
            ho.field = "uid";
            ho.compare = "=";
            ho.value = userid;
            $scope.xSearchSql.params.push(ho);
            if($scope.xSearchSql.sql !== "") {$scope.xSearchSql.sql += " AND "}
            $scope.xSearchSql.sql += "uid = '" + userid + "'";
            $scope.xSearchListTitle += " filtered for user";
        }
        $http.post($scope.sloc + 'KB_x_getAll?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&jsonFields=' + $scope.x_o.forms[$scope.x_form].fieldsJSON + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy + '&masterID=' + h + '&rowsPage=' + $scope.x_rowsPage + '&pageCt=' + $scope.x_pageCt, JSON.stringify($scope.xSearchSql)).then(function (response) {
            $scope.xList = response.data.rv;
            $scope.xTree = [];
            for (var x in $scope.xList) {
                $scope.xList[x]._sequence = x;
            }
            buildTree(-1, "");
            $scope.xTotal = {};
            // calc totals for x_o.forms[x_forms].fieldsTotal
            if ($scope.x_o.forms[$scope.x_form].fieldsTotal !== undefined && $scope.x_o.forms[$scope.x_form].fieldsTotal !== "") {

                var ttot = $scope.x_o.forms[$scope.x_form].fieldsTotal.split(",");
                if (ttot !== undefined && ttot !== "") {
                    for (var t in ttot) {
                        var tot = 0;
                        for (var v in $scope.xList) {
                            if ($scope.xList[v].infoJSON[ttot[t]] !== undefined) {
                                tot += $scope.xList[v].infoJSON[ttot[t]] * 1; // numeric
                            }
                        }
                        $scope.xTotal[ttot[t]] = tot;
                    }
                }
            }

            if ($scope.xList.length > 0) {
                if ($scope.x_rowsMax !== Math.round(response.data.rowCount / $scope.x_rowsPage + .5))
                    $scope.x_rowsMax = Math.round(response.data.rowCount / $scope.x_rowsPage + .5);
            }
        }, function (err) {
            alert("error xInit " + JSON.stringify(err));
            $scope.xList = [];
        });
    };

    $scope.xAdd = function () {
        $scope.x_page = "EDIT";
        $scope.xElement = {
            "ID": "",
            "parentID": "",
            "sequence": 999999,
            "infoJSON": {}
        };
        validateElement($scope.xElement.infoJSON, false);
        initLookups(); // must precede setDefaults for Element, for table lookup fields
        setDefaults();
        treeUpdate();
        var y = "" + $scope.x_o.forms[$scope.x_form].fieldsMap;
        if (y !== "") {
            initMap(y);
        }
    };

    $scope.xView = function (item) {
        debugger;
        if($scope.x_o.forms[$scope.x_form]._U){
            $scope.x_page = "EDIT";
        } else {
            $scope.x_page = "VIEW";
        }
        $scope.xElement = $scope.xList.filter(function (e) { return e.ID == item.ID; })[0];
        validateElement($scope.xElement.infoJSON, false);
        initLookups();
        treeUpdate();
        // adjust comboBox fields
        var x = "" + $scope.x_o.forms[$scope.x_form].fieldsCheckbox.split(",");
        if (x !== undefined && x !== null) {
            for (var v in x) {
                if ($scope.xElement.infoJSON[x[v]] === "true") {
                    $scope.xElement.infoJSON[x[v]] = true;
                }
            }
        }
        // adjust date fields
        x = $scope.x_o.forms[$scope.x_form].fieldsDate.split(",");
        if (x !== undefined && x !== null) {
            for (v in x) {
                if ($scope.xElement.infoJSON[x[v]]) {
                    var h = $scope.xElement.infoJSON[x[v]].substring(0, 10).split('-');
                    var h1 = new Date(h[0], h[1] - 1, h[2]);
                    h1.setHours(10);
                    $scope.xElement.infoJSON[x[v]] = h1;
                }
            }
        }
        y = "" + $scope.x_o.forms[$scope.x_form].fieldsMap;
        if (y !== "") {
            initMap(y);
        }
    };

    $scope.xSave = function (f) {
        if ($scope.x_form === "mydata") {
            $http.post($scope.sloc + 'KB_x_addUpdate?module=KB&table=users&ID=' + $scope.xElement.ID + '&masterID=' + $scope.xElement.masterID + '&orderBy=&parentID=' + $scope.xElement.parentID + '&sequence=' + $scope.xElement.sequence + '&uid=' + userid, JSON.stringify($scope.xElement.infoJSON)).then(function (response) {
                $scope.xCancel(f);
            }, function (err) {
                alert("save error");
                $scope.xCancel(f);
            });
        } else {
            if (validateElement($scope.xElement.infoJSON, true)) {
                if($scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].uniqueColumns !== undefined) {
                    var uc = $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].uniqueColumns;
                    if(uc !==  ""){
                        var xSearchSql = {};
                        xSearchSql.params = [];
                        xSearchSql.sql = "";
                        var t = uc.split(",");
                        for(var x in t){ // set up search from xElement
                            if(xSearchSql.sql.length > 0){xSearchSql.sql += " AND ";}
                            if(t[x] == "masterID"){
                                xSearchSql.sql += "masterID = '" + $scope.xElement.masterID + "'";
                            }else{
                                xSearchSql.sql += "JSON_VALUE(infoJSON,'$." +t[x] + "') = '" + $scope.xElement.infoJSON[t[x]] + "'";
                            }
                            var ho = {};
                            ho.field = t[x];
                            ho.compare = "=";
                            ho.value = $scope.xElement.infoJSON[t[x]];
                            xSearchSql.params.push(ho);
                        }
                        $http.post($scope.sloc + 'KB_x_getAll?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&jsonFields=' + $scope.x_o.forms[$scope.x_form].fieldsJSON + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy + '&masterID=%&rowsPage=999&pageCt=1', JSON.stringify(xSearchSql)).then
                        (function (response) {
                            var ok = false; // for unique values test
                            if(response.data.rv.length > 0){
                                if($scope.xElement.ID == "") {
                                    alert("unique values required for " + $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].uniqueColumns);
                                } else {
                                    if($scope.xElement.ID === response.data.rv[0].ID){
                                        ok = true;
                                    } else {
                                        alert("unique values required for " + $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].uniqueColumns);
                                    }
                                }
                            } else {
                                ok = true;
                            }
                            if(ok){xSavesuite(f);}
                        }, function (err) {
                            alert("error checkUnique " + JSON.stringify(err));
                        });
                    } else {
                        xSavesuite(f);
                    }
                } else {
                    xSavesuite(f);
                }
            }
        }
    };

    xSavesuite = function(f) {
        var autoColumns = [];
        if ($scope.x_o.forms[$scope.x_form].fieldsAuto !== undefined && $scope.x_o.forms[$scope.x_form].fieldsAuto !== "") {
            var autoColumns = $scope.x_o.forms[$scope.x_form].fieldsAuto.split(",");
        }
        if ($scope.xElement.ID === "" && autoColumns.length > 0) { // insert only
            $http.post($scope.sloc + 'KB_getAuto?module=' + $scope.x_o.name + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName, $scope.x_o.forms[$scope.x_form].fieldsAuto).then(function (response) {
                var av = response.data.split(",");
                for (v in autoColumns) {
                    $scope.xElement.infoJSON[autoColumns[v]] = av[v] * 1 + 1;
                }
                $http.post($scope.sloc + 'KB_x_addUpdate?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xElement.ID + '&masterID=' + $scope.x_masterID + '&parentID=' + $scope.xElement.parentID + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy + '&sequence=' + $scope.xElement.sequence + '&uid=' + userid, JSON.stringify($scope.xElement.infoJSON)).then(function (response) {
                    $scope.xCancel(f);
                }, function (err) {
                    alert("save error");
                });
            }, function (err) {
                alert("error auto " + JSON.stringify(err));
            });
        } else {
            $http.post($scope.sloc + 'KB_x_addUpdate?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xElement.ID + '&masterID=' + $scope.x_masterID + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy + '&parentID=' + $scope.xElement.parentID + '&sequence=' + $scope.xElement.sequence + '&uid=' + userid, JSON.stringify($scope.xElement.infoJSON)).then(function (response) {
                //alert(JSON.stringify(response.data));  // new ID for insert
                $scope.xCancel(f);
            }, function (err) {
                alert("save error");
            });
        }
    }

    $scope.xCancel = function (f) {
        f.$setPristine();
        if ($scope.x_form === "mydata") {
            $scope.x_form = "";
            $scope.x_page = "LOGIN";
            $scope.error = "";
            $scope.login = {
                "usrname": "",
                "password": "",
                "access": ""
            };
            userid = "";
            $scope.x_n = [];
            $scope.topName="";
            if($scope.x_n.length>0){
                if($scope.x_n[$scope.x_n.length-1].xElement.name == undefined){
                    $scope.topName = "details " + $scope.x_form;
                }else{
                    $scope.topName = $scope.x_n[$scope.x_n.length-1].xElement.name + " " + $scope.x_form;
                }
            } else {
                $scope.topName = $scope.x_form;
            }
            $scope.xEditFormDirty = false;
        } else {
            $scope.xInit();
        }
    };

    deleteAllSublevelTables= function(masterID,tableID){ 
        for(var x in x_o.tables){
            if(x_o.tables[x].parentID.includes(tableID)){
                xT.push(x_o.tables[x]);
            }
        }
        var xL =  [];
        for(var x in xT){
            $http.post($scope.sloc + 'KB_x_getAll?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + xT[x].name + '&jsonFields=&orderBy=&masterID=' + masterID + '&rowsPage=10000&pageCt=1', "").then
                (function (response) {
                    xL = response.data.rv;
                    for(var y in xL){
                        deleteAllSublevelTables(xL[y].ID,xT[x].ID);
                        $http.get($scope.sloc + 'KB_x_delete?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + xT[x].name + '&ID=' + xL[y].ID + "&subtable=''").then
                            (function (response) {
                            }, function (err) {
                                alert("error delete row in subtable");
                            });
                    }
                }, function (err) {
                    alert("error read subtable");
                });
        }
    };

    $scope.xDelete = function (f) {
        if (confirm("confirm deletion")) {
            var vst = "";
            if ($scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]] !== undefined && $scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]] !== '') {
                if ($scope.x_o.forms[$scope.x_form].detachSubLevel !== undefined && $scope.x_o.forms[$scope.x_form].detachSubLevel) {
                    vst = $scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]].tablesName;
                }
            }
            $http.get($scope.sloc + 'KB_x_delete?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xElement.ID + '&subtable=' + vst).then
            (function (response) {
                if(vst !== ""){
                    // unlink tree children in xList assumed to contain all rows for masterID
                    for(var x in $scope.xList){
                        if($scope.xList[x].parentID.includes($scope.xElement.ID)){
                            $scope.xList[x].parentID = $scope.xList[x].parentID.replace($scope.xElement.ID,"");
                            $http.post("$scope.sloc + 'KB_x_addUpdate?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xList[x].ID + '&masterID=' + $scope.xList[x].masterID + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy + '&parentID=' + $scope.xList[x].parentID + '&sequence=' + $scope.xList[x].sequence + '&uid=' + userid",JSON.stringify($scope.xList[x].infoJSON)).then                                 
                            (function (response) {
                            }, function (err) {
                                alert("error removing links in children");
                            });
                            deleteAllSublevelTables($scope.xElement.ID,$scope.x_o.forms[$scope.x_form].tablesID);
                        }
                    }
                }
                $scope.xCancel(f);
            }, function (err) {
                alert("error deletion");
                $scope.xCancel(f);
            });
        }
    };

    $scope.xUpDown = function (item, s, toSequence) {
        var h;
        if(toSequence == undefined){
            h=item.sequence + s;
        }else{
            h=toSequence + s;
        }
        $scope.myOrderBy = undefined;
        $http.get($scope.sloc + 'KB_x_sequencePut?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + item.ID + '&masterID=' + item.masterID + '&s=' + h + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy).then
        (function (response) {
            $scope.xInit();
        }, function (err) {
            alert("error 5");
        });
    };

    $scope.copyTotal = function () {
        var vp = $scope.x_o.forms[$scope.x_form].pages[$scope.x_page].copyTotal.split(" ");
        if (vp.length !== 2) {
            return;
        }
        var vfrom = vp[0];
        var vto = vp[1];
        var vfromValue = $scope.xTotal[vfrom];
        var temp = $scope.x_n.pop(); // navUp to EDIT
        $scope.topName="";
        retrievePrevious(temp, vto, vfromValue);
        $scope.xEditFormDirty = true; // for manual save
        xInitComplete();
    };
    
    defDB = function (mod, otherdb) {
        if(otherdb === undefined || otherdb === ""){
            return mod;
        } else {
            return otherdb;
        }
    };

    $scope.spaces = function (level) { // used by tree table
        var s = "";
        for (var i = 0; i <= level; i++) {
            s += "     ";
        }
        return s;
    };

    $scope.treeCollapse = function () {
        for (var x in $scope.xTree) {
            if ($scope.xTree[x].numberChildren < 1) {
                $scope.xTree[x].status = " ";
            } else {
                $scope.xTree[x].status = "+";
            }
            if ($scope.xTree[x].level > 0) {
                $scope.xTree[x].show = false;
            } else {
                $scope.xTree[x].show = true;
            }
        }
    };

    $scope.treeExpand = function () {
        for (var x in $scope.xTree) {
            if ($scope.xTree[x].numberChildren < 1) {
                $scope.xTree[x].status = " ";
            } else {
                $scope.xTree[x].status = "-";
            }
            $scope.xTree[x].show = true;
        }
    };

    collapseChildren = function (pos) {
        var t = $scope.xTree.filter(function (e) { return e.parentID.includes($scope.xTree[pos].ID); });
        for (var x in t) {
            $scope.xTree[t[x].position].show = false;
            if ($scope.xTree[t[x].position].numberChildren < 1) {
                $scope.xTree[t[x].position].status = " ";
            } else {
                $scope.xTree[t[x].position].status = "+";
            }
            if (t[x].numberChildren > 0) {
                collapseChildren(t[x].position);
            }
        }
    };

    $scope.treeClick = function (pos) {

        if ($scope.xTree[pos].status === ' ') {
            return;
        }
        if ($scope.xTree[pos].status === '+') { // open next level
            var id = $scope.xTree[pos].ID;
            var t = $scope.xTree.filter(function (e) { return e.parentID.includes(id); });
            for (var x in t) {
                $scope.xTree[t[x].position].show = false;
                $scope.xTree[t[x].position].show = true;
                if ($scope.xTree[t[x].position].numberChildren < 1) {
                    $scope.xTree[t[x].position].status = " ";
                } else {
                    $scope.xTree[t[x].position].status = "+";
                }
            }
            $scope.xTree[pos].status = '-';
        } else { // collapsed
            collapseChildren(pos);
            $scope.xTree[pos].status = '+';
        }
    };

    allowDrop = function (ev) {
        ev.preventDefault();
    };

    drag = function (ev) {
        ev.dataTransfer.setData("text", ev.target.id);
    };

    drop = function (ev) {
        ev.preventDefault();
        var idFrom = ev.dataTransfer.getData("text");
        var idTo = ev.currentTarget.id;
        if (idFrom !== idTo) {
            var tFrom = $scope.xList.filter(function (e) { return e.ID === idFrom; });
            var tTo = $scope.xList.filter(function (e) { return e.ID === idTo; });
            if ($scope.x_page == 'TREE') {
                var parentID = $scope.xList[tTo[0]._sequence].parentID; // TO
                var sequence = $scope.xList[tTo[0]._sequence].sequence; // TO
                $scope.xElement = $scope.xList[tFrom[0]._sequence]; // FROM
                var idFrom = $scope.xElement.ID;  // FROM
                var dir = prompt("A-bove\nB-elow\nC-hild - make To parent of FROM\nL-ink - make TO child of FROM\nU-link - remove FROM parent in TO", "A");
                if (dir.toUpperCase() == "A") {
                    $scope.xElement.parentID = parentID;
                    $scope.xElement.sequence = sequence - 5; 
                }
                if (dir.toUpperCase() == "B") {
                    $scope.xElement.parentID = parentID;
                    $scope.xElement.sequence = sequence + 5;
                }
                if (dir.toUpperCase() == "C") {
                    $scope.xElement.parentID = parentID;
                    if(!$scope.xElement.parentID.includes($scope.xList[tTo[0]._sequence].ID)){
                        $scope.xElement.parentID = $scope.xList[tTo[0]._sequence].ID;
                    }
                }
                if (dir.toUpperCase() == "L") {
                    $scope.xElement = $scope.xList[tTo[0]._sequence];
                    if(!$scope.xElement.parentID.includes(idFrom)){
                        $scope.xElement.parentID = $scope.xElement.parentID + " " + idFrom; // add id to to-parentID
                        $scope.xElement.sequence = 0;
                    }
                }
                if (dir.toUpperCase() == "U") {
                    $scope.xElement = $scope.xList[tTo[0]._sequence];
                    $scope.xElement.parentID.replace(idFrom,""); // remove id from to-parentID
                    if($scope.xElement.parentID.length < 40) {$scope.xElement.sequence = 1;}
                }
                if(dir !== null){
                    $http.post($scope.sloc + 'KB_x_addUpdate?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xElement.ID + '&masterID=' + $scope.xElement.masterID + '&parentID=' + $scope.xElement.parentID + '&sequence=' + $scope.xElement.sequence + '&uid=' + userid + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy, JSON.stringify($scope.xElement.infoJSON)).then(function (response) {
                        $scope.xInit();
                    }, function (err) {
                        alert("drop save error");
                    });
                }
            } else { // LIST drag and drop
                var dir = prompt("A-bove\nB-elow", "A");
                if (dir.toUpperCase() == "A") {
                    $scope.xUpDown(tFrom[0],-5,tTo[0].sequence);
                }
                if (dir.toUpperCase() == "B") {
                    $scope.xUpDown(tFrom[0],5,tTo[0].sequence);
                }
            }
        }
    };


// special buttons --------------------------------------------------------------------------------------------

    $scope.cTables = function (db, moduleID) {
        var xD = {};  // KB_diagrams for moduleID
        var xT = [];  // KB_tables for moduleID
        SearchSql = {};
        SearchSql.params = []; 
        SearchSql.sql = "";
        $http.post($scope.sloc + 'KB_x_getAll?module=KB&table=diagrams&orderBy=sequence&masterID=' + moduleID + '&rowsPage=300&pageCt=1', JSON.stringify(SearchSql)).then
        (function (response) {
            xD = response.data.rv;
            for (var x in $scope.x_o.tables){
                if($scope.x_o.tables[x].modulesID = moduleID) {
                    xT.push($scope.x_o.tables[x]);
                }                   
            }
            var tt = [];  // tables not yet registered
            for(var x in xD){
                var t = xD[x].infoJSON.table;
                if(t == undefined){
                    alert("no table defined for: "+xD[x].name);
                }else{
                    var h = xT.filter(function (e) { return e.name == t; });
                    if(h.length == 0){ // table not yet created
                        var h = tt.filter(function (e) { return e == t; });
                        if(h.length == 0){   // first occurence in tt
                            tt.push(t);
                        }
                    }
                }
            }
            tt.sort();
            if (tt.length > 0 && confirm(tt + ": CREATE NEW DB TABLES")) {
                for(x in tt){
                    // create table
                    $http.post($scope.sloc + 'KB_table?module=' + db + "&table=" + tt[x], "").then
                    (function (response) {
                        // update tables
                        var r = {};
                        r.name = tt[x].name;
                        $htp.post($scope.sloc + 'KB_x_addUpdate?module=KB&table=tables&ID=&masterID=' + moduleID + '&parentID=&orderBy=sequence&sequence=1&uid=' + userid, JSON.stringify(r)).then
                        (function (response) {
                        }, function (err) {
                            alert("table not saved: " + db + "_" + tt[x]);
                        });
                    }, function (err) {
                        alert("db table not created: "+tt[x]);
                    });        
                }
            } else {
                alert("no tables to be created");
            }
        }, function (err) {
            alert("error read diagrams");
        });
    };

    $scope.dbtc = function (pfield, moduleID, table) {
        if (table == undefined) {
            return;
        }
        var db = $scope.x_o.dbs[moduleID].name;
        if (confirm("create db table: " + db + "_" + table)) {
            $http.post($scope.sloc + 'KB_table?module=' + db + "&table=" + table, "dummy").then // module for db
            (function (response) {
                $scope.xEditFormDirty = true; // for manual save
                $scope.xElement.infoJSON[pfield] = response.data;
            }, function (err) {
                alert("db table not created");
            });
        }
    };
    
    $scope.dbqc = function (pfield, moduleID,tableID, table) {
        var db = $scope.x_o.dbs[moduleID].name;
        if (confirm("create query for db table: " + db + "_" + table)) {
            $http.post($scope.sloc + 'KB_query?module=' + db + "&table=" + table, getFields(tableID)).then // module for db
            (function (response) {
                $scope.xEditFormDirty = true; // for manual save
                $scope.xElement.infoJSON[pfield] = response.data;
            }, function (err) {
                alert("db table not created");
            });
        }
    };

    getFields = function(tableID){
        var s = "ID __ID, masterID __masterID, parentID __parentID, sequence __sequence";
        var t = $scope.x_o.tables[tableID].columns;
        for(var y in t){
            var c = t[y];
            if(c.fieldType=="lookup" && c.source=="table"){
                s += ", JSON_VALUE(infoJSON,'$." + $scope.x_o.columns[c].name + "') _" + $scope.x_o.columns[c].name;
                s += ", JSON_VALUE(infoJSON,'$." + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Name" + "') _" + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Name";
            } else if(c.fieldType=="image"){
                s += ", JSON_VALUE(infoJSON,'$." + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Path" + "') _" + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Path";
                s += ", JSON_VALUE(infoJSON,'$." + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Width" + "') _" + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Width";
                s += ", JSON_VALUE(infoJSON,'$." + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Height" + "') _" + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Height";
                s += ", JSON_VALUE(infoJSON,'$." + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Capture" + "') _" + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Capture";
                s += ", JSON_VALUE(infoJSON,'$." + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Comment" + "') _" + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Comment";
            } else if(c.fieldType=="utube"){
                s += ", JSON_VALUE(infoJSON,'$." + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Path" + "') _" + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Path";
                s += ", JSON_VALUE(infoJSON,'$." + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Width" + "') _" + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Width";
                s += ", JSON_VALUE(infoJSON,'$." + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Height" + "') _" + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Height";
            } else if(c.fieldType=="map"){
                s += ", JSON_VALUE(infoJSON,'$." + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Width" + "') _" + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Width";
                s += ", JSON_VALUE(infoJSON,'$." + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Height" + "') _" + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Height";
                s += ", JSON_VALUE(infoJSON,'$." + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Capture" + "') _" + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Capture";
                s += ", JSON_VALUE(infoJSON,'$." + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Comment" + "') _" + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Comment";
                s += ", JSON_VALUE(infoJSON,'$." + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Longitude" + "') _" + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Longitude";
                s += ", JSON_VALUE(infoJSON,'$." + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Latitude" + "') _" + $scope.x_o.columns[c].name.substring(0,$scope.x_o.columns[c].name.length-2)+"Latitude";
            } else {
                s += ", JSON_VALUE(infoJSON,'$." + $scope.x_o.columns[c].name + "') _" + $scope.x_o.columns[c].name;
            }
        }
        return s;
    };

    $scope.bDB = function (pfield, id, db) {
        if (confirm("backup db to mongo and mysql: " + db)) {
            $http.post($scope.sloc + 'KB_bDB?module=' + db + '&masterID='+id, "dummy").then
            (function (response) {
                $scope.xEditFormDirty = true; // for manual save
                $scope.xElement.infoJSON[pfield] = response.data;
            }, function (err) {
                alert("backup failure");
            });
        }
    };  

    buildPage = function (fID,page,xT,table) {
        var o = {};
        o.name = page;
        o.type = page;
        o.description = "";
        if(page == "LIST"){
            o.image = ""; // image field used for carousel, button after + displayed
            for(var x in table.columns){
                if($scope.x_o.columns[table.columns[x]].fieldType == "image"){
                    o.image = $scope.x_o.columns[table.columns[x]].name;
                }
            }
            o.graph = false; // button after + displayed
            o.copyTotal = ""; // from-field to-field, button after + displayed
        }
        var pID;
        $htp.post($scope.sloc + 'KB_x_addUpdate?module=KB&table=pages&ID=&masterID=' + fID + '&parentID=&orderBy=sequence&sequence=1&uid=' + userid, JSON.stringify(o)).then
        (function (response) {
            pID=response.data;
            var o={};
            for(var x in table.columns){
                o.name=$scope.x_o.columns[table.columns[x]].name;
                o.columnsID=table.columns[x];
                $htp.post($scope.sloc + 'KB_x_addUpdate?module=KB&table=forms&ID=&masterID=' + pID + '&parentID=&orderBy=sequence&sequence=1&uid=' + userid, JSON.stringify(o)).then
                (function (response) {           
                }, function (err) {
                    alert("field not created" + $scope.x_o.columns[table.columns[x]].name);
                });
            }
        }, function (err) {
            alert("page not created " + page);
        });
    };
 
    buildApp = function (moduleID, id, parentid, xD,xT) {
        var t;
        if(id === ""){
            t = xD.filter(function (e) { return e.parentID == ""; });
        }else{
            t = xD.filter(function (e) { return e.parentID.includes(id); });
        }
        for (var x in t) {
            var o = {};
            o.name = t[x].name;
            o.description = t[x].description;
            o.parentID = parentid;
            o.orderBy = t[x].orderBy;
            v_table=xT.filter(function (e) { return e.parentID == moduleID && e.name == t[x].table; });
            if(v_table.length == 0){alert("table not found " + t[x].table);}
            o.tablesID = v_table[0].ID;
            o.tablesName = t[x].table;
            o.rowsPage = 20;
            if(t[x].detachSubLevel !== undefined){o.detachSubLevel = t[x].detachSubLevel;}else{o.detachSubLevel = false;}
            if(t[x].filterForm !== undefined){o.filterForm = t[x].filterForm;}else{o.filterForm = "";}
            if(t[x].userOnly !== undefined){o.userOnly = t[x].userOnly;}else{o.filterForm = false;}
            if(t[x].masterEmpty !== undefined){o.masterEmpty = t[x].masterEmpty;}else{o.masterEmpty = false;}
            if(t[x].ignoreMaster !== undefined){o.ignoreMaster = t[x].ignoreMaster;}else{o.ignoreMaster = false;}
            if(t[x].userReservedUpdate !== undefined){o.userReservedUpdate = t[x].userReservedUpdate;}else{o.userReservedUpdate = false;}
            if(t[x].userReservedDelete !== undefined){o.userReservedDelete = t[x].userReservedDelete;}else{o.userReservedDelete = false;}
            if(t[x].startWithSearch !== undefined){o.startWithSearch = t[x].startWithSearch;}else{o.startWithSearch = false;}
            if(t[x].startupForm !== undefined){o.startupForm = t[x].startupForm;}else{o.startupForm = false;}
            var fID;
            $htp.post($scope.sloc + 'KB_x_addUpdate?module=KB&table=forms&ID=&masterID=' + moduleID + '&parentID=&orderBy=sequence&sequence=1&uid=' + userid, JSON.stringify(o)).then
            (function (response) {
                fID=response.data;
                if(t[x].createSEARCH){buildPage(fID,"SEARCH",xT,v_table);}
                buildPage(fID,"LIST",xT,v_table);
                buildPage(fID,"EDIT",xT,v_table);
                buildPage(fID,"VIEW",xT,v_table);
                buildApp(moduleID, t[x].ID, fID, xD, xT);            
            }, function (err) {
                alert("form not created" + t[x].name);
            });
        }
    };

    $scope.cModule = function (db, moduleID) {
        if (confirm("create module from diagram: " + db)) {
            // delete any existing data for module
            for(var x in $scope.x_o.forms){
                deleteAllSublevelTables($scope.x_o.forms[x].ID, $scope.x_o.forms[x].tablesID);
                $http.get($scope.sloc + 'KB_x_delete?module=KB&table=forms&ID=' + $scope.x_o.forms[x].ID + '&subtable=').then
                (function (response) {
                }, function (err) {
                    alert("error deletion: " + $scope.x_o.forms[x].name);
                });
            }

            var xD = [];  // KB_diagrams for moduleID
            $http.post($scope.sloc + 'KB_x_getAll?module=KB&table=diagrams&orderBy=sequence&masterID=' + moduleID + '&rowsPage=100&pageCt=1', "").then
            (function (response) {
                $scope.xD = response.data.rv;
            }, function (err) {
                alert("error read diagrams");
            });
            var xT = [];  // KB_tables for moduleID
            $http.post($scope.sloc + 'KB_x_getAll?module=KB&table=tables&orderBy=sequence&masterID=' + moduleID + '&rowsPage=100&pageCt=1', "").then
            (function (response) {
                $scope.xT = response.data.rv;
            }, function (err) {
                alert("error read tables");
            });
            builApp(moduleID,"","",xD,xT);
        }
    };    

    $scope.chart = function () {
        $scope.x_o.forms[$scope.x_form].pages[$scope.x_page].graph = false;
        $http.post($scope.sloc + 'KB_chart?module=' + $scope.x_o.name, "dummy").then(function (response) {
            var rv = response.data;
            var w = window.open("chart");
            w.document.open("");
            w.document.write(rv);
            w.document.close();
            $scope.x_o.forms[$scope.x_form].pages[$scope.x_page].graph = true;
        }, function (err) {
            alert("chart error");
            $scope.x_o.forms[$scope.x_form].pages[$scope.x_page].graph = true;
        });
    };

    $scope.carousel = function () {
        var xCarousel = {};
        var vimg = $scope.x_o.forms[$scope.x_form].fieldsImage;
        if (vimg !== undefined && vimg !== "") {
            for (var x in $scope.xList) {
                var o = {};
                o.Picture = $scope.xList[x].infoJSON[vimg + "Path"];
                o.Description = $scope.xList[x].infoJSON[vimg + "Capture"];
                xCarousel[$scope.xList[x].ID] = o;
            }
        }
        $http.post($scope.sloc + 'KB_carousel?module=' + $scope.x_o.name, JSON.stringify(xCarousel)).then(function (response) {
            var rv = response.data;
            var w = window.open("carousel");
            w.document.open("");
            w.document.write(rv);
            w.document.close();
        }, function (err) {
            alert("carousel error");
        });
    };

    $scope.doc = function (pfield) {
        if ($scope.xElement.ID == "") {
            alert("save first !");
            return;
        }
        var d_m = {};
        d_m.m = []; // array of sorted master fields
        d_m.i = []; // array of sorted child fields
        d_m.r = {}; // object of ref tables with array of sorted ref fields
        d_m.g = {};
        d_m.xMaster = $scope.xElement.infoJSON;
        d_m.sql = ""; // select commands to retrieve child and ref data from db server, preceded by optional update command to link new children
        d_m.sqlS = []; // sequence of ref tables read from db server to associate model dm.r[] with data retrieved
        d_m.sqlG = []; // sequence of grand children tables read from db server to associate model dm.g[] with data retrieved
        d_m.form = $scope.x_form;
        d_m.masterID = $scope.xElement.ID;
        var d_childName = $scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]].tablesName;
        var d_childSubForms = $scope.x_o.forms[$scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]].name].subForms;
        // order by 
        var vob = ""; // sort for child sql
        var x = $scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]].orderBy.split(",");
        for (v in x) {
            if (vob !== "") {
                vob += " , ";
            }
            var xx = x[v].split(":")
            if (xx[0] === "sequence" || xx[0] === "name" || xx[0] === "date" ) {
                vob += " " + xx[0];
            } else {
                vob += " JSON_VALUE(infoJSON, '$." + xx[0] + "')";
            }
            if (xx[1] === "D") {
                vob += " DESC ";
            }
        }
        d_m.sql += "SELECT * FROM " + $scope.x_o.name + "_" + d_childName + " WHERE masterID = '" + d_m.masterID + "' ORDER BY " + vob + " for json path; ";
        
        var d_masterFields = $scope.x_o.forms[$scope.x_form].fieldsJSON;
        var d_masterLookups = $scope.x_o.forms[$scope.x_form].fieldsLookup;
        var d_childFields = $scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]].fieldsJSON;
        d_m.childTotalFields = $scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]].fieldsTotal;
        // fill d_m.m
        var x = d_masterFields.split(",");
        for (var v in x) {
            d_m.m.push(x[v]);
        }
        // fill d_m.i
        x = d_childFields.split(",");
        for (v in x) {
            d_m.i.push(x[v]);
        }
        // fill d_m.r
        x = d_masterLookups.split(",");
        if (x !== undefined) {
            for (v in x) {
                var lu = x[v].substring(0, x[v].length - 2);
                if ($scope.xElement.infoJSON[x[v]] !== undefined) {
                    d_m.sqlS.push(lu);
                    d_m.sql += "SELECT * FROM " + $scope.x_o.name + "_" + lu + " WHERE ID = '" + $scope.xElement.infoJSON[x[v]] + "' for json path;";
                }
                var xx = $scope.x_o.forms[lu].fieldsJSON.split(",");
                d_m.r[lu] = [];
                if (xx !== undefined) {
                    for (var vv in xx) {
                        d_m.r[lu].push(xx[vv]);
                    }
                }
                d_m.r[lu].sort();
            }
        }
        // fill d_m.g
        x = d_childSubForms;
        if (x !== undefined) {
            for (v in x) {
                var sf = x[v];
                var sft = $scope.x_o.forms[sf].tablesName;
                d_m.sqlG.push(sf);
                d_m.sql += "SELECT JSON_VALUE(a.infoJSON,'$.date') date1, b.* from " + $scope.x_o.name + "_" + d_childName + " a inner join " + $scope.x_o.name + "_" + sft + " b on a.ID = b.masterID where a.masterID = '" + d_m.masterID + "' ORDER BY a.date for json path;";
                var xx = $scope.x_o.forms[sf].fieldsJSON.split(",");
                d_m.g[sf] = [];
                if (xx !== undefined) {
                    for (var vv in xx) {
                        d_m.g[sf].push(xx[vv]);
                    }
                }
                d_m.g[sf].sort();
            }
        }
        var d_id = []; // shared ref keys master - child for filter 'combine' with no masterID
        var x1 = d_masterLookups.split(",");
        var x2 = d_childFields.split(",");
        for (var v1 in x1) {
            for (var v2 in x2) {
                if (x1[v1] === x2[v2]) {
                    d_id.push(x1[v1]);
                }
            }
        }
        var s = "UPDATE " + $scope.x_o.name + "_" + d_childName + " SET masterID = '" + d_m.masterID + "' WHERE masterID = '' ";
        for (var v in d_id) {
            s += " and JSON_VALUE(infoJSON,'$." + d_id[v] + "') = '" + $scope.xElement.infoJSON[d_id[v]] + "'";
        }
        d_m.sql = s + ";" + d_m.sql;
        //$scope.vvv = d_m.sql;
        //alert(d_m.sql);
        d_m.m.sort();
        d_m.i.sort();
        $http.post($scope.sloc + 'KB_doc?module=' + $scope.x_o.name, JSON.stringify(d_m)).then(function (response) {
            $scope.xElement.infoJSON[pfield] = response.data; // eg docinv1111-2222-3333
            $http.post($scope.sloc + 'KB_x_addUpdate?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xElement.ID + '&masterID=' + $scope.x_masterID + '&parentID=' + $scope.xElement.parentID + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy + '&sequence=' + $scope.xElement.sequence + '&uid=' + userid, JSON.stringify($scope.xElement.infoJSON)).then(function (response) {
                // display doc page
            }, function (err) {
                alert("save error");
            });
        }, function (err) {
            alert("doc error");
        });
    };
});