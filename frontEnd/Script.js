//autoSlocFloc//
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

var mmApp = angular.module("mmApp", ['ngSanitize'])
.config(function($sceProvider){
    $sceProvider.enabled(false);
});
mmApp.controller("mmCtrl", function ($scope, $timeout, $http, $sce) {

    //$scope.x_o//
    var dummy = "//$scope.x_o//";

    // build load function
    for (var x in $scope.x_o.lookups) {
        if ($scope.x_o.lookups[x].masterLookup == undefined || $scope.x_o.lookups[x].masterLookup == null || $scope.x_o.lookups[x].masterLookup == "") { // masterLookup 
            $scope.x_o.lookups[x].load = function () {
                $http.post(sloc + 'KB_x_getAll?module=' + $scope.x_o.name + '&table=' + this.getParameters + '&masterID=&orderBy=name&rowsPage=999999&pageCt=1', JSON.stringify({
                    "params": [],
                    "sql": ""
                })).then(function (response) {
                    $scope.x_o.lookups[response.data.table].collection = response.data.rv;
                    $scope.x_o.lookups[response.data.table].tree = convertListTree(response.data.rv);
                    $scope.x_o.lookups[response.data.table].tree1 = $scope.x_o.lookups[response.data.table].tree.filter(function (e) {
                        return e.show
                    });
                }, function (err) {
                    alert(JSON.stringify(err));
                })
            };
        } else {
            $scope.x_o.lookups[x].load = function () {
                $http.post(sloc + 'KB_x_getAll?module=' + $scope.x_o.name + '&table=' + this.getParameters + '&masterID=' + this.masterID + '&orderBy=name&rowsPage=999999&pageCt=1', JSON.stringify({
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

    $scope.xMessages = [];
    $scope.SelMessaging = "system";
    $scope.messageFor = "";
    $scope.messageBody = "";

    
    $scope.x_form = " ";
    $scope.x_page= " ";
    $scope.mainForms = [];
    for(var x in $scope.x_o.forms) {
        if(($scope.x_o.forms[x].parentID == undefined || $scope.x_o.forms[x].parentID == ''))  //  && $scope.x_o.forms[x]._R
        {
            $scope.mainForms.push($scope.x_o.forms[x]);
        }
    }
    $scope.SelMod = $scope.x_o.name;
    $scope.SelLevel = "";
    $scope.SelRole = "";
    $scope.AvailableModules = $scope.x_o.dbs;
    $scope.AvailableModules["0"] = {"name":"refresh"};
    $scope.AvailableLevels = ["KB","Administrator","Superuser","User","Guest"]; 
    $scope.x_n = [];
    $scope.xElement = {};
    $scope.topName="";
    $scope.ieElement = {};
    $scope.ieeditingInProgress = false;
    $scope.error = "";
    $scope.login = {
        "usrname": "",
        "password": ""
    };
    $scope.xSearch = {};
    $scope.xSearchListTitle = "";
    $scope.xSearchSql = {};
    $scope.xSearchSql.params = [];
    $scope.xSearchSql.sql = "";

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
    $scope.socket.on("flightschedular",function(message){
        var v = JSON.parse(message);
        //alert(message);
        $http.post(sloc + 'KB_x_addUpdate?module=FS&table=operations&ID=' + v.ID + '&masterID=&orderBy=date&parentID=&sequence=0&uid=' + userid, JSON.stringify(v.infoJSON)).then
        (function (response) {
            //alert("flightscheduler saved");
        }, function (err) {
            //alert("flightscheduler operations save error");
        });
    });

    $http.post(sloc + 'KB_getStats', "").then(function (response) {
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
        $http.post(sloc + "KB_x_getAll?module=KB&table=users&jsonFields=&orderBy=name&masterID=%&rowsPage=1&pageCt=1", JSON.stringify($scope.xSearchSql)).then
            (function (response) {
                if (response.data.rv.length > 0) {
                    $scope.myData = response.data.rv[0];
                    userid = response.data.rv[0].ID;
                    usrname = response.data.rv[0].infoJSON.name;
                    usraccess = response.data.rv[0].infoJSON.access;
                    if(setAccessRights()) {
                        $scope.error = "";
                        $scope.x_page = " "; // show main menu only
                    }
                } else {
                    $scope.error = ">> user unknown <<";
                    userid="";
                    $scope.login = {
                        "usrname": "",
                        "password": ""
                    };
                    $scope.x_page = "LOGIN"; 
                }
            },function (err) {
                $scope.error = ">> system error <<";
                userid=""; 
                $scope.login = {
                    "usrname": "",
                    "password": ""
                };
                $scope.x_page = "LOGIN";
            }
        );
    }else{
        $scope.x_page = "LOGIN";
    }

//..
    $scope.messageSend = function () {
        if($scope.messageBody !== ""){
            var o = {};
            var d = new Date();
            o.time = d.getHours()+":"+d.getMinutes();
            o.from = usrname;
            o.to = $scope.messageFor;
            o.message = $scope.messageBody;
            //$scope.socket.emit("server",JSON.stringify(o)); not working
            $http.post(sloc + 'KB_sendMessage?module=KB', JSON.stringify(o)).then
            (function (response) {
                $scope.messageFor = "";
                $scope.messageBody = "";
            }, function (err) {
                alert("send message error");
            }); 
        }
    }

//..
    $scope.changeModule = function(){
        if($scope.SelMod=='refresh'){$scope.SelMod=$scope.x_o.name;};
        window.open(sloc + "HTML.html?module="+$scope.SelMod,'_self',false);
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
        if ($scope.x_o.lookups[lu].masterLookup == undefined || $scope.x_o.lookups[lu].masterLookup == null || lu == 'tables') {
            $scope.x_o.lookups[lu].load();
        }
    }

//..
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

//..
    $scope.select = function (id, table) {
        if (selectListTree(id, $scope.x_o.lookups[table].tree)) {
            $scope.x_o.lookups[table].tree1 = null;
            $scope.x_o.lookups[table].tree1 = $scope.x_o.lookups[table].tree.filter(function (e) {
                return e.show
            });
        }
    };

//..
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
                    if($scope.x_o.lookups[l].tree !== undefined)
                    {
                        $scope.x_o.lookups[l].tree1 = $scope.x_o.lookups[l].tree.filter(function (e) {
                            return e.show;
                        });
                    }
                }
            }
        }
    };

//..
    $scope.spacesListTree = function (level) {
        var s = "",
            i;
        for (i = 0; i < level; i++) {
            s += "....";
        }
        return s;
    };


//..
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

 //..
    convertListTree = function (list) {
        var tree = [];
        convertListTree1(-1, "", list, tree);
        return tree;
    };

//..
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

//..
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

//..
    removeTrailingComma = function (s) {
        var v = "";
        if (s.length > 0) {
            v = s.substring(0, s.length - 1);
        }
        return v;
    };

//..
    $scope.orderByMe = function (x) { // sort LIST items by clicking on column header
        if ($scope.myOrderBy === undefined) {
            var x1 = x.replace("ID", "Name"); // replace xID by xName
            $scope.myOrderBy = "infoJSON." + x1;
        } else {
            $scope.myOrderBy = undefined;
        }
    };

//..
    initMap = function (p, all, path) { // map field, eg 'map'
        document.getElementById("Googlemap").innerHTML = "";
        if(all){
            if($scope.xList[0].infoJSON[p + "Latitude"] !== undefined && $scope.xList[0].infoJSON[p + "Longitude"] !== undefined){
                var h3 = 3;
                var h4;
                eval("h4 = new google.maps.LatLng(" + $scope.xList[0].infoJSON[p + "Latitude"] + ", " + $scope.xList[0].infoJSON[p + "Longitude"] + ");");
                var map = new google.maps.Map(document.getElementById("Googlemap"), {
                    center: h4,
                    zoom: h3, 
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });
                var markers = [];
                for(var n in $scope.xList){
                    if($scope.xList[n].infoJSON[p + "Latitude"] !== undefined && $scope.xList[n].infoJSON[p + "Longitude"] !== undefined){
                        eval("h4 = new google.maps.LatLng(" + $scope.xList[n].infoJSON[p + "Latitude"] + ", " + $scope.xList[n].infoJSON[p + "Longitude"] + ");");
                        var name = "x";
                        if($scope.xList[n].infoJSON[p + "Capture"] !== undefined) {name = $scope.xList[n].infoJSON[p + "Capture"];}
                            markers[n] = new google.maps.Marker({
                            position: h4,
                            title: name,
                            map: map,
                            draggable: false
                        });
                        google.maps.event.addListener(markers[n], 'click', function (e) {
                            var l1 = e.latLng.lat().toFixed(6);
                            var l2 = e.latLng.lng().toFixed(6);
                            for(var n in $scope.xList){
                                if($scope.xList[n].infoJSON[p + "Latitude"] == l1 && $scope.xList[n].infoJSON[p + "Longitude"] == l2){
                                    $scope.xView ($scope.xList[n]);
                                    break;
                                }
                            }
                        });
                    }
                }
            }            
        }else{
            if(path == undefined){
                if($scope.xElement.infoJSON[p + "Latitude"] !== undefined && $scope.xElement.infoJSON[p + "Longitude"] !== undefined){
                    var h3 = 5;
                    if($scope.xElement.infoJSON[p + "Zoom"] !== undefined){
                        h3 = eval($scope.xElement.infoJSON[p + "Zoom"]);
                    }
                    var h4;
                    eval("h4 = new google.maps.LatLng(" + $scope.xElement.infoJSON[p + "Latitude"] + ", " + $scope.xElement.infoJSON[p + "Longitude"] + ");");
                    var map = new google.maps.Map(document.getElementById("Googlemap"), {
                        center: h4,
                        zoom: h3, 
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    });
                    var name = "x";
                    if($scope.xElement.infoJSON[p + "Capture"] !== undefined) {name = $scope.xElement.infoJSON[p + "Capture"];}
                    var marker = new google.maps.Marker({
                        position: h4,
                        title: name,
                        map: map,
                        draggable: false
                    });
                }
            }else{
                eval("h4 = new google.maps.LatLng(" + path[0].lat + ", " + path[0].lng + ");");
                var map = new google.maps.Map(document.getElementById('Googlemap'), {
                    zoom: 3,
                    center: h4,
                    mapTypeId: 'terrain'
                });
                var flightPath = new google.maps.Polyline({
                    path: path, 
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                }); 
                flightPath.setMap(map);
            }
        }
    };

//..
    removePicture = function (p) {
        //$http.delete($scope.apiEndpoint + '/api/XdeleteFile/' + $scope.xElement.infoJSON[p]);
        $scope.xElement.infoJSON[p] = "smily.jpg";
        $scope.xElement.infoJSON[p + "Path"] = floc + $scope.xElement.infoJSON[p];
    };

//..
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
            url: sloc + 'upload',
            contentType: false,
            processData: false,
            data: data,
            success: function (data) {
                $scope.xElement.infoJSON[p] = data;
                $scope.xElement.infoJSON[p + "Path"] = floc + $scope.xElement.infoJSON[p];
                $scope.xSave();
                return true;
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('File upload error: ' + textStatus);
                return false;
            },
        });
    };

//..
    $scope.completeLookupField = function (buffer, item, lookupFields) {
        // complete buffer (xElement, ieElement or xSearch): <item>Name + masterID + masterName + lookupFields
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

//..
    $scope.getDescription = function (subform) { // get description for subform
        return $scope.x_o.forms[subform].description;
    };

//..
    initLookups = function () {
        // when starting add / view, for table lookup 
        var lu;
        var y = "" + $scope.x_o.forms[$scope.x_form].fieldsLookup;
        var x = y.split(",");
        if (x[0] == undefined || x[0] == "") { return;}
        // set current form id for lookup of <form>
        for (lu in $scope.x_o.lookups) {
            if($scope.x_o.lookups[lu].masterLookup !== undefined && $scope.x_o.lookups[lu].masterLookup == $scope.x_o.forms[$scope.x_form].tablesName ){
                $scope.x_o.lookups[lu].masterID = $scope.xElement.ID;
                $scope.x_o.lookups[lu].load();
            }
        }
        // set current lookup fields id for lookup of <lookup field>
        for(lu in $scope.x_o.lookups){
            for(var z in x){
                if($scope.xElement.infoJSON[x[z]] !== undefined)
                {
                    if($scope.x_o.lookups[lu].masterLookup !== undefined && $scope.x_o.lookups[lu].masterLookup == x[z].substring(0, x[z].length - 2))
                    {
                        $scope.x_o.lookups[lu].masterID = $scope.xElement.infoJSON[x[z]];
                        $scope.x_o.lookups[lu].load();
                    }
                }
            }
        }
        // temp fix
        if($scope.x_form == "forms"){
            $scope.x_o.lookups["tables"].masterID = "%";
            $scope.x_o.lookups["tables"].load();
        }
        // delete ???
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
                                if ($scope.xElement.infoJSON[$scope.x_o.lookups[lu].name + 'masterID'] !== undefined && $scope.x_o.lookups[lu].masterID !== $scope.xElement.infoJSON[$scope.x_o.lookups[lu].name + 'masterID']) {
                                    $scope.x_o.lookups[lu].masterID = removeString($scope.xElement.infoJSON[$scope.x_o.lookups[lu].name + 'masterID']);
                                    $scope.x_o.lookups[lu].masterName = $scope.xElement.infoJSON[$scope.x_o.lookups[lu].name + 'masterName'];
                                    $scope.x_o.lookups[lu].load();
                                }
                            }
                        }
                    }
                }
            }
        }
    };

//..
    $scope.ieeditSwitch = function (item) { 
        $scope.ieeditingInProgress = !$scope.ieeditingInProgress; 
        if ($scope.ieeditingInProgress) { 
            $scope.ieElement = item; 
        } else {
            $scope.ieElement = {};
        }
    }; 

//..
    $scope.iedelete = function (f) { 
        $scope.ieeditingInProgress = false;
        $scope.xDelete(f);
    }; 

//..
    $scope.ieupdate = function (f) {
        $scope.xElement = $scope.ieElement; 
        $scope.xElement._edit = null;
        // automatic recalc
        $scope.xSave(f);
    }; 

//..
    setDefaults = function () { // for empty xElement fields
        for (var p in $scope.x_o.forms[$scope.x_form].pages) {
            if (p.substring(0, 4) === "EDIT") {
                for (var fi in $scope.x_o.forms[$scope.x_form].pages[p].fields) {
                    if ($scope.x_o.forms[$scope.x_form].pages[p].fields[fi] !== undefined && $scope.x_o.forms[$scope.x_form].pages[p].fields[fi] !== null) {
                        c = ca[$scope.x_o.forms[$scope.x_form].pages[p].fields[fi].columnsID];
                        if (c !== undefined && c.label !== undefined) { // skip pages without fields and no show fields
                            if (c.default !== undefined) {
                                if (c.fieldType === "date" || c.fieldType === "local") {
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

//..
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

//..
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
        $http.post(sloc + "KB_x_getAll?module=KB&table=users&jsonFields=&orderBy=name&masterID=%&rowsPage=1&pageCt=1", JSON.stringify(xSearchSql)).then
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
                        $http.post(sloc + 'KB_x_addUpdate?module=KB&table=logins&ID=&masterID=' + userid + '&orderBy=date&parentID=&sequence=0&uid=' + userid, JSON.stringify(h)).then
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

//..
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
                    role = t2[1];
                    $scope.SelLevel = level;
                    $scope.SelRole = role;
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

            if(level == "Guest")
            {
                for(var x in $scope.x_o.forms) 
                {
                    $scope.x_o.forms[x]._C = false;
                    $scope.x_o.forms[x]._R = true;
                    $scope.x_o.forms[x]._U = false;
                    $scope.x_o.forms[x]._D = false;
                } 
            }else
            {
            
                for(var x in $scope.x_o.forms) 
                {
                    $scope.x_o.forms[x]._C = false;
                    $scope.x_o.forms[x]._R = false;
                    $scope.x_o.forms[x]._U = false;
                    $scope.x_o.forms[x]._D = false;
                } 
                
                var searchParameters = [];
                var o = {};
                o.field = "modulesID";
                o.compare = "EQUAL";
                o.value = $scope.x_o.ID; 
                searchParameters.push(o);
                var xSearchSql = {};
                xSearchSql.params = searchParameters; // array of objects: field, compare, value
                xSearchSql.sql = "JSON_VALUE(infoJSON,'$.modulesID') = '" + $scope.x_o.ID + "'";
        
                $http.post(sloc + "KB_x_getAll?module=KB&table=accessRights&jsonFields=&orderBy=sequence&masterID=%&rowsPage=900&pageCt=1", JSON.stringify(xSearchSql)).then
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
            }
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

//..
    $scope.modifyAccessRights = function() {
        if($scope.SelLevel == 'KB' || $scope.SelLevel == 'Administrator' || $scope.SelLevel == 'Superuser')
        {
            $scope.SelRole = "";
        }

        if($scope.SelLevel !== 'KB' && $scope.SelLevel !== 'Administrator' && $scope.SelLevelel !== 'Superuser')
        {
            if($scope.SelLevell == ""){return false;} // no access rights for current module

            if($scope.SelLevel == "Guest")
            {
                for(var x in $scope.x_o.forms) 
                {
                    $scope.x_o.forms[x]._C = false;
                    $scope.x_o.forms[x]._R = true;
                    $scope.x_o.forms[x]._U = false;
                    $scope.x_o.forms[x]._D = false;
                } 
            }else
            {
            
                for(var x in $scope.x_o.forms) 
                {
                    $scope.x_o.forms[x]._C = false;
                    $scope.x_o.forms[x]._R = false;
                    $scope.x_o.forms[x]._U = false;
                    $scope.x_o.forms[x]._D = false;
                } 
                
                var searchParameters = [];
                var o = {};
                o.field = "modulesID";
                o.compare = "EQUAL";
                o.value = $scope.x_o.ID; 
                searchParameters.push(o);
                var xSearchSql = {};
                xSearchSql.params = searchParameters; // array of objects: field, compare, value
                xSearchSql.sql = "JSON_VALUE(infoJSON,'$.modulesID') = '" + $scope.x_o.ID + "'";
        
                $http.post(sloc + "KB_x_getAll?module=KB&table=accessRights&jsonFields=&orderBy=sequence&masterID=%&rowsPage=900&pageCt=1", JSON.stringify(xSearchSql)).then
                (
                    function (response) 
                    {
                        var xList = response.data.rv;

                        for(var x in xList)
                        {
                            var ok=true;
                            if($scope.SelRole!== "")
                            {
                                if(xList[x].roles === undefined || xList[x].roles === null || xList[x].roles === "")
                                {
                                    ok=false;
                                }else
                                {
                                    if(!xList[x].roles.includes($scope.SelRole))
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
                        alert("error modify AccessRights " + JSON.stringify(err));
                        return false;
                    }
                );
            }
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

//..
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

//..
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

//..
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

//..
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

//..
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

//..
    $scope.navTab = function (item) {
        $scope.x_page = item;
        if($scope.x_o.forms[$scope.x_form].pages[$scope.x_page].mapHeight && (item.substring(0, 4) == 'EDIT' || item.substring(0, 4) == 'VIEW')){
            // initMap: if map in current tab -> map, else if textarea in current tab -> path
            var vmapf = "";
            var vtaf = ""; // textarea 
            for(var x in $scope.x_o.forms[$scope.x_form].pages[$scope.x_page].fields){
                var c = $scope.x_o.forms[$scope.x_form].pages[$scope.x_page].fields[x].columnsID;
                if($scope.x_o.columns[c].fieldType == "map"){
                    vmapf =  x;
                }
                if($scope.x_o.columns[c].fieldType == "textArea"){
                    vtaf =  x;
                }
            }
            if(vmapf == ""){
                if($scope.xElement.infoJSON[vtaf] !== undefined){
                    var vta = $scope.xElement.infoJSON[vtaf].replace(/::/gi, " "); // at end of each waypoint except last
                    var vtaa = vta.split(" ");
                    var v = [];
                    for (var i = 0; i < vtaa.length; i=i+5){
                        var o = {};
                        o.lat = 1 * vtaa[i+1];
                        o.lng = 1 * vtaa[i+2];
                        v.push(o);
                    }
                    initMap(vmapf,false,v);
                }
            }else{
                initMap(vmapf,false);
            }
        }
    };

//..
    $scope.xInitSearch = function () {
        $scope.xSearch = {}; // no infoJSON
        $scope.xSearchListTitle = "";
        $scope.xSearchSql = {};
        $scope.xSearchSql.params = [];
        $scope.xSearchSql.sql = "";
        $scope.x_page = "SEARCH";
    };

//..
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

//..
    $scope.xInit = function () {
        $scope.xEditFormDirty = false;
        if ($scope.x_o.forms[$scope.x_form].pages["TREE"] == undefined) {
            $scope.x_page = "LIST";
        } else {
            $scope.x_page = "TREE";
        }
        xInitComplete();
    };

//..
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

//..
    $scope.getStatusClass = function (parentID) {
        if(parentID !== undefined && parentID.length>40) { 
            return "yellow";
        } else {
            return "";
        }
    };

//..
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
        $http.post(sloc + 'KB_x_getAll?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&jsonFields=' + $scope.x_o.forms[$scope.x_form].fieldsJSON + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy + '&masterID=' + h + '&rowsPage=' + $scope.x_rowsPage + '&pageCt=' + $scope.x_pageCt, JSON.stringify($scope.xSearchSql)).then(function (response) {
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
            var y = "" + $scope.x_o.forms[$scope.x_form].fieldsMap;
            if (y !== "") {
                initMap(y,true);
            } 
        }, function (err) {
            alert("error xInit " + JSON.stringify(err));
            $scope.xList = [];
        });
    };

//..
    $scope.xAdd = function (f) {
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
        if($scope.x_o.forms[$scope.x_form].pages[$scope.x_page].inlineEDIT !== undefined && $scope.x_o.forms[$scope.x_form].pages[$scope.x_page].inlineEDIT){
            $scope.xList.unshift($scope.xElement);
            $scope.ieElement = $scope.xElement; 
            $scope.ieeditingInProgress = true; 
        } else {
            $scope.x_page = "EDIT";   
        }      
        var y = "" + $scope.x_o.forms[$scope.x_form].fieldsMap;
        if (y !== "") {
            initMap(y,false);
        }
    };

//..
    $scope.xView = function (item) {
        $scope.xElement = $scope.xList.filter(function (e) { return e.ID == item.ID; })[0];
        if($scope.x_o.forms[$scope.x_form]._U){
            $scope.x_page = "EDIT";
        } else {    // display doc instead of View if doc exists
            for (var x in $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].columns){
                if($scope.x_o.columns[$scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].columns[x]].fieldType == "doc"){
                    var h = $scope.x_o.columns[$scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].columns[x]].name;
                    if($scope.xElement.infoJSON[h] !== undefined && $scope.xElement.infoJSON[h] !== ""){
                        window.open(sloc + $scope.xElement.infoJSON[h] + '.html');
                        $scope.x_page = "LIST";
                        return;
                    }
                }
                $scope.x_page = "VIEW";
            }
        }
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
            initMap(y,false);
            initMap(y,false); // display google map !!!
        }
    };

//..
    $scope.xSave = function (f) {
        if ($scope.x_form === "mydata") {
            $http.post(sloc + 'KB_x_addUpdate?module=KB&table=users&ID=' + $scope.xElement.ID + '&masterID=' + $scope.xElement.masterID + '&orderBy=&parentID=' + $scope.xElement.parentID + '&sequence=' + $scope.xElement.sequence + '&uid=' + userid, JSON.stringify($scope.xElement.infoJSON)).then(function (response) {
                $scope.xCancel(f);
            }, function (err) {
                alert("save error");
                $scope.xCancel(f);
            });
        } else {
            if ($scope.ieeditingInProgress  || validateElement($scope.xElement.infoJSON, true)) {
                $scope.ieeditingInProgress = false;
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
                        $http.post(sloc + 'KB_x_getAll?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&jsonFields=' + $scope.x_o.forms[$scope.x_form].fieldsJSON + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy + '&masterID=%&rowsPage=999&pageCt=1', JSON.stringify(xSearchSql)).then
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

//..
    xSavesuite = function(f) {
        var autoColumns = [];
        if ($scope.x_o.forms[$scope.x_form].fieldsAuto !== undefined && $scope.x_o.forms[$scope.x_form].fieldsAuto !== "") {
            var autoColumns = $scope.x_o.forms[$scope.x_form].fieldsAuto.split(",");
        }
        if ($scope.xElement.ID === "" && autoColumns.length > 0) { // insert only
            $http.post(sloc + 'KB_getAuto?module=' + $scope.x_o.name + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName, $scope.x_o.forms[$scope.x_form].fieldsAuto).then(function (response) {
                var av = response.data.split(",");
                for (v in autoColumns) {
                    $scope.xElement.infoJSON[autoColumns[v]] = av[v] * 1 + 1;
                }
                $http.post(sloc + 'KB_x_addUpdate?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xElement.ID + '&masterID=' + $scope.x_masterID + '&parentID=' + $scope.xElement.parentID + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy + '&sequence=' + $scope.xElement.sequence + '&uid=' + userid, JSON.stringify($scope.xElement.infoJSON)).then(function (response) {
                    $scope.xCancel(f);
                }, function (err) {
                    alert("save error");
                });
            }, function (err) {
                alert("error auto " + JSON.stringify(err));
            });
        } else {
            $http.post(sloc + 'KB_x_addUpdate?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xElement.ID + '&masterID=' + $scope.x_masterID + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy + '&parentID=' + $scope.xElement.parentID + '&sequence=' + $scope.xElement.sequence + '&uid=' + userid, JSON.stringify($scope.xElement.infoJSON)).then(function (response) {
                //alert(JSON.stringify(response.data));  // new ID for insert
                $scope.xCancel(f);
            }, function (err) {
                alert("save error");
            });
        }
    }

//..
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

//..
    deleteAllSublevelTables= function(masterID,tableID){ // tableID = parentID
        var xT = []; // define sub-tables for tableID, from x_o.tables with table ID added
        for(var x in $scope.x_o.tables){
            if($scope.x_o.tables[x].parentID.includes(tableID)){
                var h = $scope.x_o.tables[x];
                h.ID = x;
                xT.push(h);
            }
        }
        for(var x in xT){
            $http.post(sloc + 'KB_x_getAll?module=' + xT[x].db + '&table=' + xT[x].name + '&jsonFields=&orderBy=&masterID=' + masterID + '&rowsPage=10000&pageCt=1', JSON.stringify({"params":[], "sql":""})).then
                (function (response) {
                    var xL = response.data.rv;
                    for(var y in xL){
                        deleteAllSublevelTables(xL[y].ID,xT[x].ID);
                        alert(xT[x].name + ' - ' + xL[y].ID);
                        console.log(xT[x].name + ' - ' + xL[y].ID);
                        $http.get(sloc + 'KB_x_delete?module=' + xT[x].db + '&table=' + xT[x].name + '&ID=' + xL[y].ID + "&subtable=''").then
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

//..
    $scope.xDelete = function (f) {
        if (confirm("confirm deletion")) {
            var vst = "";
            if ($scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]] !== undefined && $scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]] !== '') {
                if ($scope.x_o.forms[$scope.x_form].detachSubLevel !== undefined && $scope.x_o.forms[$scope.x_form].detachSubLevel) {
                    vst = $scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]].tablesName;
                }
            }
            $http.get(sloc + 'KB_x_delete?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xElement.ID + '&subtable=' + vst).then
            (function (response) {
                if(vst !== ""){
                    // unlink tree children in xList assumed to contain all rows for masterID
                    for(var x in $scope.xList){
                        if($scope.xList[x].parentID.includes($scope.xElement.ID)){
                            $scope.xList[x].parentID = $scope.xList[x].parentID.replace($scope.xElement.ID,"");
                            $http.post("sloc + 'KB_x_addUpdate?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xList[x].ID + '&masterID=' + $scope.xList[x].masterID + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy + '&parentID=' + $scope.xList[x].parentID + '&sequence=' + $scope.xList[x].sequence + '&uid=' + userid",JSON.stringify($scope.xList[x].infoJSON)).then                                 
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

//..
    $scope.xUpDown = function (item, s, toSequence) {
        var h;
        if(toSequence == undefined){
            h=item.sequence + s;
        }else{
            h=toSequence + s;
        }
        $scope.myOrderBy = undefined;
        $http.get(sloc + 'KB_x_sequencePut?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + item.ID + '&masterID=' + item.masterID + '&s=' + h + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy).then
        (function (response) {
            $scope.xInit();
        }, function (err) {
            alert("error 5");
        });
    };

//..
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
    
//..
    defDB = function (mod, otherdb) {
        if(otherdb === undefined || otherdb === ""){
            return mod;
        } else {
            return otherdb;
        }
    };

//..    
    $scope.spaces = function (level) { // used by tree table
        var s = "";
        for (var i = 0; i <= level; i++) {
            s += "     ";
        }
        return s;
    };

//..   
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

//..
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

//..
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

//..
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

//..
    allowDrop = function (ev) {
        ev.preventDefault();
    };

//..
    drag = function (ev) {
        ev.dataTransfer.setData("text", ev.target.id);
    };

//..
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
                    $http.post(sloc + 'KB_x_addUpdate?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xElement.ID + '&masterID=' + $scope.xElement.masterID + '&parentID=' + $scope.xElement.parentID + '&sequence=' + $scope.xElement.sequence + '&uid=' + userid + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy, JSON.stringify($scope.xElement.infoJSON)).then(function (response) {
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

//..
    $scope.cTables = function (db, moduleID) {
        $http.post(sloc + 'KB_x_getAll?module=KB&table=tables&orderBy=sequence&masterID=' + moduleID + '&rowsPage=900&pageCt=1', JSON.stringify({"params":[],sql:""})).then        
        (function (response) {
            var xT = response.data.rv;
            $http.post(sloc + 'KB_x_getAll?module=KB&table=diagrams&orderBy=sequence&masterID=' + moduleID + '&rowsPage=900&pageCt=1', JSON.stringify({"params":[],sql:""})).then
                (function (response) {
                    var xD = response.data.rv;
                    var xR = {};
                    var tt = []; // display tables to be created
                    for (var x in xD) {
                        var parentID = '';
                        var oldID = '';
                        var newID = '';
                        var name = '';
                        var xcT = xT.filter(function (e) { return e.name == txD.infoJSON.table });
                        if (xcT.length > 0) {
                            oldID = xcT[0].ID;
                            name = xcT[0].name;
                        } else {
                            newID = xD[x].ID;
                            name = xD[x].infoJSON.table;
                        }
                        if (xR[name] == undefined || xR[name] == null) {
                            var h = {
                                oldID: oldID,
                                newID: newID,
                                parentID: parentID,
                                masterID: moduleID
                            };
                            xR[name] = h;
                            tt.push(name);
                        }
                        if (xD[x].parentID !== undefined  && xD[x].parentID !== null && xD[x].parentID !== '') {
                            var id;
                            var txD = xD.filter(function (e) { return e.ID == xD[x].parentID });
                            if(txD.length>0){
                                var tname;
                                var xpT = xT.filter(function (e) { return e.name == txD.infoJSON.table });
                                if (xpT.length > 0) {
                                    id = xpT[0].ID;
                                    tname = xpT[0].name;
                                } else {
                                    tname = txD[0].infoJSON.table;
                                    if (xR[tname] == undefined || xR[tname] == null) {
                                        var h = {
                                            oldID: '',
                                            newID: txD[0].ID,
                                            parentID: '',
                                            masterID: moduleID
                                        };
                                        xR[tname] = h;
                                        tt.push(tname);
                                        id = txD[0].ID;
                                    } else {
                                        if (xR[tname].oldID == "") {
                                            id = xR[tname].newID;
                                        } else {
                                            id = xR[tname].oldID;
                                        }
                                    }
                                }
                                if(!xR[name].parentID.includes(id) && tname !== name){
                                    xR[name].parentID += id;
                                }
                            }
                        }
                    }
                    tt.sort();
                    if (tt.length > 0 && confirm(tt + ": CREATE NEW DB TABLES")) {
                        $http.post(sloc + 'KB_ctables?module=' + db, JSON.stringify(xR)).then // module for db
                            (function (response) {
                                var resequence = "";
                                for(var x in xR){
                                    if(xR[x].oldID !== ""){
                                        resequence = xR[x].oldID; 
                                        break;
                                    }
                                    if(xR[x].newID !== ""){
                                        resequence = xR[x].newID; 
                                        break;
                                    }
                                }
                                if(resequence !== "") {
                                    $http.get(sloc + 'KB_x_sequencePut?module=KB&table=tables&ID=' + resequence+ '&masterID=' + moduleID + '&s=1&orderBy=sequence').then
                                        (function (response) {
                                        }, function (err) {
                                        alert("resequence error");
                                        }
                                    );
                                }
                            }, function (err) {
                                alert("create tables error");
                            }
                        );
                    }
                }, function (err) {
                    alert("error read diagrams");
                });
            }, function (err) {
            alert("read tables error");
        });
    };

//..
    $scope.dbtc = function (pfield, moduleID, table) {
        if (table == undefined) {
            return;
        }
        var db = $scope.x_o.dbs[moduleID].name;
        if (confirm("create db table: " + db + "_" + table)) {
            $http.post(sloc + 'KB_table?module=' + db + "&table=" + table, "dummy").then // module for db
            (function (response) {
                $scope.xEditFormDirty = true; // for manual save
                $scope.xElement.infoJSON[pfield] = response.data;
            }, function (err) {
                alert("db table not created");
            });
        }
    };
    
//..
    $scope.dbqc = function (pfield, moduleID,tableID, table) {
        var db = $scope.x_o.dbs[moduleID].name;
        if (confirm("create query for db table: " + db + "_" + table)) {
            $http.post(sloc + 'KB_query?module=' + db + "&table=" + table, getFields(tableID)).then // module for db
            (function (response) {
                $scope.xEditFormDirty = true; // for manual save
                $scope.xElement.infoJSON[pfield] = response.data;
            }, function (err) {
                alert("db table not created");
            });
        }
    };

//..
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

//..
    $scope.bDB = function (pfield, id, db) {
        if (confirm("backup db to mongo and mysql: " + db)) {
            $http.post(sloc + 'KB_bDB?module=' + db + '&masterID='+id, "dummy").then
            (function (response) {
                $scope.xEditFormDirty = true;
                $scope.xElement.infoJSON[pfield] = response.data;
            }, function (err) {
                alert("backup failure");
            });
        }
    };  

//..
    buildPage = function (fID,page,ptable, pmasterID, pmasterName) {
        var o = {};
        o.name = page;
        o.type = page;
        o.description = "";
        if(page == "LIST"){
            o.image = ""; // image field used for carousel, button after + displayed
            for(var x in ptable.columns){
                if($scope.x_o.columns[ptable.columns[x]].fieldType == "image"){
                    o.image = $scope.x_o.columns[ptable.columns[x]].name;
                }
            }
            o.graph = false; // button after + displayed
            o.copyTotal = ""; // from-field to-field, button after + displayed
        }
        $http.post(sloc + 'KB_x_addUpdate?module=KB&table=pages&ID=&masterID=' + fID + '&parentID=&orderBy=sequence&sequence=9999&uid=' + userid, JSON.stringify(o)).then
        (function (response) {
            var pID = "" + response.data;
            // build fields
            for(var x in ptable.columns){
                var o={};
                o.columnsID=ptable.columns[x];
                o.columnsName=$scope.x_o.columns[ptable.columns[x]].name;
                o.columnsmasterID=pmasterID;
                o.columnsmasterName=pmasterName;
                $http.post(sloc + 'KB_x_addUpdate?module=KB&table=fields&ID=&masterID=' + pID + '&parentID=&orderBy=sequence&sequence=9999&uid=' + userid, JSON.stringify(o)).then
                (function (response) {           
                }, function (err) {
                    alert("field not created");
                });
            }
        }, function (err) {
            alert("page not created " + page);
        });
    };
 
//..
    buildForms = function (moduleID, id, parentid, xD, xT) {
        var t;
        if(id === ""){
            t = xD.filter(function (e) { return e.parentID == ""; });
        }else{
            t = xD.filter(function (e) { return e.parentID.includes(id); });
        }
        var atmp = [];
        for (var x in t) {
            otmp = {};
            var o = {};
            o.name = t[x].infoJSON.name;
            o.description = t[x].infoJSON.description;
            if(t[x].infoJSON.orderBy == undefined){
                o.orderBy = "sequence";
            }else{
                o.orderBy = t[x].infoJSON.orderBy;
            }
            var h=xT.filter(function (e) { return e.name == t[x].infoJSON.table; });
            if(h.length < 1){alert("table not found " + t[x].infoJSON.table);}
            o.tablesID = h[0].ID;
            o.tablesName = h[0].name;
            otmp.ptable = $scope.x_o.tables[h[0].ID];
            otmp.id = t[x].ID;
            otmp.pmasterID = o.tablesID;
            otmp.pmasterName = o.tablesName;
            o.rowsPage = 20;
            if(t[x].infoJSON.detachSubLevel !== undefined){o.detachSubLevel = t[x].infoJSON.detachSubLevel;}else{o.detachSubLevel = false;}
            if(t[x].infoJSON.filterForm !== undefined){o.filterForm = t[x].infoJSON.filterForm;}else{o.filterForm = "";}
            if(t[x].infoJSON.userOnly !== undefined){o.userOnly = t[x].infoJSON.userOnly;}else{o.filterForm = false;}
            if(t[x].infoJSON.masterEmpty !== undefined){o.masterEmpty = t[x].infoJSON.masterEmpty;}else{o.masterEmpty = false;}
            if(t[x].infoJSON.ignoreMaster !== undefined){o.ignoreMaster = t[x].infoJSON.ignoreMaster;}else{o.ignoreMaster = false;}
            if(t[x].infoJSON.userReservedUpdate !== undefined){o.userReservedUpdate = t[x].infoJSON.userReservedUpdate;}else{o.userReservedUpdate = false;}
            if(t[x].infoJSON.userReservedDelete !== undefined){o.userReservedDelete = t[x].infoJSON.userReservedDelete;}else{o.userReservedDelete = false;}
            if(t[x].infoJSON.startWithSearch !== undefined){o.startWithSearch = t[x].infoJSON.startWithSearch;}else{o.startWithSearch = false;}
            if(t[x].infoJSON.startupForm !== undefined){o.startupForm = t[x].infoJSON.startupForm;}else{o.startupForm = false;}
            atmp.push(otmp);
            $http.post(sloc + 'KB_x_addUpdate?module=KB&table=forms&ID=&masterID=' + moduleID + '&parentID=' + parentid + '&orderBy=sequence&sequence=1&uid=' + userid, JSON.stringify(o)).then
            (function (response) {
                var fID = "" + response.data;
                otmp = atmp.shift();
                if(t[x].infoJSON.createSEARCH){buildPage(fID,"SEARCH",otmp.ptable, otmp.pmasterID, otmp.pmasterName);}
                buildPage(fID,"LIST",otmp.ptable, otmp.pmasterID, otmp.pmasterName);
                buildPage(fID,"EDIT",otmp.ptable, otmp.pmasterID, otmp.pmasterName);
                buildPage(fID,"VIEW",otmp.ptable, otmp.pmasterID, otmp.pmasterName);
                buildForms(moduleID, otmp.id, fID, xD, xT);            
            }, function (err) {
                alert("form not created");
            });
        }
    };

//..
$scope.saveCode = function () {
    if (confirm("save code to database, minify to Script.min.js manually before :")) {
        $http.post("https://javascript-minifier.com/raw?input=JavaScript", "var x = 1; // abc").then
        (function (response) {
            alert(JSON.stringify(response));
        }, function (err) {
            alert("minifier");
        });
    }
};    

//..
    $scope.cModule = function (db, moduleID) {
        SearchSql = {};
        SearchSql.params = []; 
        SearchSql.sql = "";
        if (confirm("create module forms+ from diagram, delete old before: " + db)) {
            // delete any existing forms+ for module
            var xF = [];  // KB_forms for moduleID
            $http.post(sloc + 'KB_x_getAll?module=KB&table=forms&orderBy=sequence&masterID=' + moduleID + '&rowsPage=1000&pageCt=1', JSON.stringify(SearchSql)).then
            (function (response) {
                xF = response.data.rv;
                for(var x in xF){
                    deleteAllSublevelTables(xF[x].ID, xF[x].infoJSON.tablesID); // pages & fields
                    $http.get(sloc + 'KB_x_delete?module=KB&table=forms&ID=' + xF[x].ID + '&subtable=').then
                    (function (response) {
                    }, function (err) {
                        alert("error delete old form");
                    });
                }
            }, function (err) {
                alert("error read forms");
            });
            var xT = []; // table name -> ID for module
            for(var x in $scope.x_o.tables){
                if($scope.x_o.tables[x].db == db){
                    var o = {};
                    o.name = $scope.x_o.tables[x].name;
                    o.ID = x;
                    xT.push(o);
                }
            }
            if (confirm("confirm create module forms+ from diagram: " + db)) {
                var xD = [];  // KB_diagrams for moduleID
                $http.post(sloc + 'KB_x_getAll?module=KB&table=diagrams&orderBy=sequence&masterID=' + moduleID + '&rowsPage=1000&pageCt=1', JSON.stringify(SearchSql)).then
                (function (response) {
                    xD = response.data.rv;
                    buildForms(moduleID,"","",xD,xT);
                }, function (err) {
                    alert("error read diagrams");
                });
            }
        }
    };    

//..
    $scope.chart = function () {
        $scope.x_o.forms[$scope.x_form].pages[$scope.x_page].graph = false;
        $http.post(sloc + 'KB_chart?module=' + $scope.x_o.name, "dummy").then(function (response) {
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

//..
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
        $http.post(sloc + 'KB_carousel?module=' + $scope.x_o.name, JSON.stringify(xCarousel)).then(function (response) {
            var rv = response.data;
            var w = window.open("carousel");
            w.document.open("");
            w.document.write(rv);
            w.document.close();
        }, function (err) {
            alert("carousel error");
        });
    };

//..
    $scope.doc = function (pfield) {
        if ($scope.xElement.ID == "") {
            alert("save first !");
            return;
        }
        var d_m = {
            m:[],   // array of sorted master fields
            i:[],   // array of sorted child fields
            r:{},   // object of ref tables with array of sorted ref fields
            g:{},
            xMaster: $scope.xElement.infoJSON,
            sql:"", // select commands to retrieve child and ref data from db server, preceded by optional update command to link new children
            sqlS:[],// sequence of ref tables read from db server to associate model dm.r[] with data retrieved
            sqlG:[],// sequence of grand children tables read from db server to associate model dm.g[] with data retrieved
            form: $scope.x_form,
            masterID: $scope.xElement.ID,
            childTotalFields: $scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]].fieldsTotal
        };
        var vchildName = $scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]].tablesName;
        var vchildSubForms = $scope.x_o.forms[$scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]].name].subForms;
        // order by 
        var vob = ""; // sort for child sql
        var x = $scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]].orderBy.split(",");
        for (v in x) {
            if (vob !== "") {
                vob += " , ";
            }
            var xx = x[v].split(":");
            if (xx[0] === "sequence" || xx[0] === "name" || xx[0] === "date" ) {
                vob += " " + xx[0];
            } else {
                vob += " JSON_VALUE(infoJSON, '$." + xx[0] + "')";
            }
            if (xx[1] === "D") {
                vob += " DESC ";
            }
        }
        d_m.sql += "SELECT * FROM " + $scope.x_o.name + "_" + vchildName + " WHERE masterID = '" + d_m.masterID + "' ORDER BY " + vob + " for json path; ";
        
        var vmasterFields = $scope.x_o.forms[$scope.x_form].fieldsJSON;
        var vmasterLookups = $scope.x_o.forms[$scope.x_form].fieldsLookup;
        var vchildFields = $scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]].fieldsJSON;
        // fill d_m.m
        var x = vmasterFields.split(",");
        for (var v in x) {
            d_m.m.push(x[v]);
        }
        // fill d_m.i
        x = vchildFields.split(",");
        for (v in x) {
            d_m.i.push(x[v]);
        }
        // fill d_m.r
        if (vmasterLookups !== "") {
            x = vmasterLookups.split(",");
            for (v in x) {
                var lu = x[v].substring(0, x[v].length - 2);
                if ($scope.xElement.infoJSON[x[v]] !== undefined) {
                    d_m.sqlS.push(lu);
                    d_m.sql += "SELECT * FROM " + $scope.x_o.name + "_" + lu + " WHERE ID = '" + $scope.xElement.infoJSON[x[v]] + "' for json path;";
                }
                var xx = $scope.x_o.forms[lu].fieldsJSON.split(",");
                d_m.r[lu] = [];
                if (typeof xx !== undefined) {
                    for (var vv in xx) {
                        d_m.r[lu].push(xx[vv]);
                    }
                }
                d_m.r[lu].sort();
            }
        }
        // fill d_m.g
        if (vchildSubForms !== "") {
            for (v in vchildSubForms) {
                var sf = vchildSubForms[v];
                var sft = $scope.x_o.forms[sf].tablesName;
                d_m.sqlG.push(sf);
                d_m.sql += "SELECT JSON_VALUE(a.infoJSON,'$.date') date1, b.* from " + $scope.x_o.name + "_" + vchildName + " a inner join " + $scope.x_o.name + "_" + sft + " b on a.ID = b.masterID where a.masterID = '" + d_m.masterID + "' ORDER BY a.date for json path;";
                d_m.g[sf] = [];
                var xx = $scope.x_o.forms[sf].fieldsJSON.split(",");
                if (typeof xx !== undefined) {
                    for (var vv in xx) {
                        d_m.g[sf].push(xx[vv]);
                    }
                }
                d_m.g[sf].sort();
            }
        }
        var d_id = []; // shared ref keys master - child for filter 'combine' with no masterID
        var x1 = vmasterLookups.split(",");
        var x2 = vchildFields.split(",");
        for (var v1 in x1) {
            for (var v2 in x2) {
                if (x1[v1] == x2[v2]) {
                    d_id.push(x1[v1]);
                }
            }
        }
        var s = "UPDATE " + $scope.x_o.name + "_" + vchildName + " SET masterID = '" + d_m.masterID + "' WHERE masterID = '' ";
        for (var v in d_id) {
            s += " and JSON_VALUE(infoJSON,'$." + d_id[v] + "') = '" + $scope.xElement.infoJSON[d_id[v]] + "'";
        }
        d_m.sql = s + ";" + d_m.sql;
        d_m.m.sort();
        d_m.i.sort();
        $http.post(sloc + 'KB_doc?module=' + $scope.x_o.name, JSON.stringify(d_m)).then(function (response) {
            $scope.xElement.infoJSON[pfield] = response.data; // eg docinv1111-2222-3333
            $http.post(sloc + 'KB_x_addUpdate?module=' + defDB($scope.x_o.name, $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].db) + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xElement.ID + '&masterID=' + $scope.x_masterID + '&parentID=' + $scope.xElement.parentID + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy + '&sequence=' + $scope.xElement.sequence + '&uid=' + userid, JSON.stringify($scope.xElement.infoJSON)).then(function (response) {
                // display doc page
            }, function (err) {
                alert("save error");
            });
        }, function (err) {
            alert("doc error");
        });
    };
//..
//functions//
});