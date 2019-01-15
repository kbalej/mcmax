var mmApp = angular.module("mmApp", ['ngSanitize']);
mmApp.controller("mmCtrl", function ($scope, $timeout, $http, $sce) {

    //$scope.x_o//
    //$scope.sloc = "http://172.22.22.64:8888/"; // node on Max Server
    //$scope.floc = "file:///home/kb/Documents/p/UploadedFiles/";
    $scope.sloc="http://localhost:8888/";  // node on Asus
    $scope.floc="file:///Users/Admin/Onedrive/p_A/UploadedFiles/";
    // build load function
    for (var x in $scope.x_o.lookups) {
        if ($scope.x_o.lookups[x].masterLookup == undefined || $scope.x_o.lookups[x].masterLookup == null) { // masterLookup
            $scope.x_o.lookups[x].load = function () {
                $http.post($scope.sloc + 'KB_x_getAll?module=' + $scope.x_o.name + '&table=' + this.getParameters + '&rowsPage=999999&pageCt=1', JSON.stringify({ "params": [], "sql": "" })).then
                    (function (response) {
                        $scope.x_o.lookups[response.data.table].collection = response.data.rv;
                    }, function
                        (err) {
                        $scope.x_o.lookups[err.data.table].collection = [{}];
                    });
            };
        } else {
            $scope.x_o.lookups[x].load = function () {
                if (typeof this.masterID !== undefined && this.masterID !== null) {
                    $http.post($scope.sloc + 'KB_x_getAll?module=' + $scope.x_o.name + '&table=' + this.getParameters + '&masterID=' + this.masterID + '&rowsPage=999999&pageCt=1', JSON.stringify({ "params": [], "sql": "" })).then
                        (function (response) {
                            $scope.x_o.lookups[response.data.table].collection = response.data.rv;
                        }, function (err) {
                            $scope.x_o.lookups[err.data.table].collection = [{}];
                        });
                } else {
                    $scope.x_o.lookups[this.name].collection = [{}];
                }
            };
        }
    }

    $scope.x_n = [];
    $scope.x_rowsPage = 50;
    $scope.x_rowsMax = 1;
    $scope.x_pageCt = 1;

    var ca = $scope.x_o.columns;
    var c = {};

    removeString = function (s) {
        var v = s;
        try {
            if (v.includes('STRING:')) { v = v.substring(7); }
        } catch (err) {
            v = undefined;
        }
        return v;
    };

    removeTrailingComma = function (item) {
        var v = "";
        if (item.length > 0) {
            v = item.substring(0, item.length - 1);
        }
        return v;
    };

    $scope.orderByMe = function (x) {       // sort LIST items by clicking on column header
        if (typeof $scope.myOrderBy === undefined) {
            $scope.myOrderBy = "infoJSON." + x;
        } else {
            $scope.myOrderBy = undefined;
        }
    };


    // map handling

    initMap = function (p) {    // map field, eg 'map'
        var geocoder = new google.maps.Geocoder();
        var map = new google.maps.Map(document.getElementById("Googlemap"), {
            center: { lat: 46.07869193484069, lng: 7.215027570724487 },
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
        }
        else {
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

    // load top level lookups
    for (var lu in $scope.x_o.lookups) {
        if ($scope.x_o.lookups[lu].masterLookup == undefined || $scope.x_o.lookups[lu].masterLookup == null) {
            $scope.x_o.lookups[lu].load();
        }
    }

    // after modification of lookup field
    $scope.completeLookupField = function (buffer, item, lookupFields) {
        // complete buffer (xElement or xSearch): <item>Name + masterID + masterName + lookupFields
        var t_p = eval("$scope." + buffer + ".infoJSON." + item + "ID");
        var t_c = $scope.x_o.lookups[item].collection;
        var t_e = t_c.filter(function (e) { return e.ID == t_p; });
        eval('$scope.' + buffer + '.infoJSON.' + item + 'Name = t_e[0].infoJSON.name');
        if (typeof $scope.x_o.lookups[item].masterLookup !== undefined) {
            eval('$scope.' + buffer + '.infoJSON.' + item + 'masterID = $scope.x_o.lookups.' + item + '.masterID');
            eval('$scope.' + buffer + '.infoJSON.' + item + 'masterName = $scope.x_o.lookups.' + item + '.masterName');
        }
        if (lookupFields === undefined || lookupFields !== '') {
            var result = lookupFields.match(/\w+/g);
            for (var i = 0; i < result.length; i = i + 2) {
                eval('$scope.' + buffer + '.infoJSON.' + result[i + 1] + ' = t_e[0].infoJSON.' + result[i]);  // eg cost unitCost
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


    // when starting add / view 

    $scope.initLookups = function () {
        //        if ($scope.x_form === 'fields') { debugger; } 
        var lu;
        var y = "" + $scope.x_o.forms[$scope.x_form].fieldsLookup;
        var x = y.split(",");
        if (x !== undefined && x !== null && x !== '') {
            for (var v in x) {
                if ($scope.xElement.infoJSON[x[v]] !== undefined) {
                    var vlookup = x[v].substring(0, x[v].length - 2);
                    if ($scope.x_o.lookups[vlookup] !== undefined) {
                        if ($scope.x_o.lookups[vlookup].masterLookup !== undefined && $scope.x_o.lookups[vlookup].masterLookup !== null) { // sublevel
                            if ($scope.x_o.lookups[vlookup].masterID !== $scope.xElement.infoJSON[vlookup + 'masterID']) {
                                $scope.xElement.infoJSON[vlookup + 'ID'] = undefined;
                                $scope.xElement.infoJSON[vlookup + 'Name'] = undefined;
                                $scope.xElement.infoJSON[vlookup + 'masterID'] = undefined;
                                $scope.xElement.infoJSON[vlookup + 'masterName'] = undefined;
                            }
                            //alert(JSON.stringify($scope.xElement.infoJSON));
                            for (lu in $scope.x_o.lookups) {
                                if ($scope.x_o.lookups[lu].masterLookup === vlookup) {
                                    if ($scope.x_o.lookups[lu].masterID !== $scope.xElement.infoJSON[$scope.x_o.lookups[lu].name + 'masterID']) {
                                        $scope.x_o.lookups[lu].masterID = removeString($scope.xElement.infoJSON[$scope.x_o.lookups[lu].name + 'masterID']);
                                        $scope.x_o.lookups[lu].masterName = $scope.xElement.infoJSON[$scope.x_o.lookups[lu].name + 'masterName'];
                                        $scope.x_o.lookups[lu].load();
                                    }
                                    //alert(JSON.stringify($scope.x_o.lookups[lu]));
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

    $scope.setDefaultsElement = function () {   // for empty xElement fields
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
                                            d.setDate(d.getDate() + i)
                                        }
                                        $scope.xElement.infoJSON[c.name] = d;
                                    } else {
                                        $scope.xElement.infoJSON[c.name] = new Date(c.default);
                                    }
                                } else {
                                    $scope.xElement.infoJSON[c.name] = c.default;
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    $scope.validateElement = function (e, flag) { // xElement.infoJSON + flag, true for validation, false for fieldError removal only
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
                                    t_val[c.name].html = [];       // pointer to model fields for each xElement field
                                    t_val[c.name].html.push(p + " " + fi);
                                    if (c.required !== undefined) { t_val[c.name].required = c.required.replace(/_./gi, "$scope.xElement.infoJSON.").replace(/::/gi, "'"); }
                                    if (c.pattern !== undefined) { t_val[c.name].regex = c.pattern; }
                                    if (c.excluded !== undefined) { t_val[c.name].excluded = c.excluded; }
                                    if (c.fieldType === 'number') { t_val[c.name].number = true; }
                                } else {
                                    t_val[c.name].html.push(p + " " + fi);
                                }
                            }
                        } else { alert("bad " + $scope.x_form + " " + p + " " + fi) };
                    } else { alert("bad fi"); }
                }
            }
        }
        if (flag) {
            for (x in e) {
                if (t_val[x] !== undefined) { t_val[x].value = e[x]; }
            }
            for (t in t_val) {
                if (t_val[t].value === undefined) {
                    if (t_val[t].required !== undefined) {
                        try {
                            res = eval(t_val[t].required); // eg $scope.xElement.infoJSON.x === 'abc' || $scope.xElement.infoJSON.y (=exists) && $scope.xElement.infoJSON.z > 3
                        }
                        catch (err) {
                            res = false;
                        }
                        finally {
                            if (res) {
                                t_val[t].status = false;
                                mess.push(t_val[t].name + ": regex required");
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
                    if (t_val[t].excluded !== undefined) {    // check for forbidden characters
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
            } else {
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
            }
            return vok;
        }
    };

    // *** login page

    $scope.x_page = "LOGIN";
    $scope.error = "";
    $scope.login = { "usrname": "", "password": "" };

    $scope.log_in = function () {
        $http.post($scope.sloc + 'login', JSON.stringify($scope.login)).then
            (function (response) {
                $scope.error = "";
                $scope.x_page = "NONE";    // show main menu only
            },
            function (err) {
                $scope.error = ">> e r r o r <<";
            });
    };

    // *** navbar

    $scope.navMain = function (item) {
        $scope.x_form = item;
        $scope.x_masterID = "";
        $scope.x_masterName = "";
        $scope.x_n = [];
        $scope.x_pageCt = 1;
        $scope.myOrderBy = undefined;
        $scope.xSearchListTitle = "";
        $scope.xSearchSql = {};
        $scope.xSearchSql.params = [];
        $scope.xSearchSql.sql = "";
        $scope.xInit();
    };

    $scope.navUp = function (item) {
        var temp = { "form": "" };
        while (temp.form !== item.form || temp.form === "") {
            temp = $scope.x_n.pop();
        }
        $scope.x_masterID = temp.masterID;
        $scope.x_masterName = temp.masterName;
        $scope.x_pageCt = temp.pageCt;
        $scope.x_form = temp.form;
        $scope.x_page = temp.page;

        $scope.xSearch = Object.assign({}, temp.xSearch);
        $scope.xSearchListTitle = temp.xSearchListTitle;
        $scope.xSearchSql = temp.xSearchSql;
        $scope.xElement = Object.assign({}, temp.xElement);
        $scope.myOrderBy = undefined;
        $http.post($scope.sloc + 'KB_x_getAll?module=' + $scope.x_o.name + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&jsonFields=' + $scope.x_o.forms[$scope.x_form].fieldsJSON + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy + '&masterID=' + $scope.x_masterID + '&rowsPage=' + $scope.x_rowsPage + '&pageCt=' + $scope.x_pageCt, JSON.stringify($scope.xSearchSql)).then
            (function (response) {
                $scope.xList = response.data.rv;
                if ($scope.xList.length > 0) {
                    $scope.x_rowsMax = Math.round($scope.xList[0].rowCount / $scope.x_rowsPage + .5);
                }
                $scope.xInit();
            }, function (err) {
                alert("error navUp");
                $scope.xList = [{}];
            });
    };

    $scope.navDown = function (item) {
        $scope.x_n.push({ "form": $scope.x_form, "page": $scope.x_page, "masterID": $scope.x_masterID, "masterName": $scope.x_masterName, "pageCt": $scope.x_pageCt, "xSearch": Object.assign({}, $scope.xSearch), "xSearchListTitle": $scope.xSearchListTitle, "xSearchSql": $scope.xSearchSql, "xElement": Object.assign({}, $scope.xElement) });
        $scope.x_masterID = $scope.xElement.ID;
        $scope.x_masterName = $scope.xElement.infoJSON.name;
        $scope.x_form = item;
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
        $scope.xSearch = {};    // no infoJSON
        $scope.xSearchListTitle = "";
        $scope.xSearchSql = {};
        $scope.xSearchSql.params = [];
        $scope.xSearchSql.sql = "";
        $scope.x_page = "SEARCH";
    };

    $scope.xStartSearch = function () {
        var searchParameters = [];

        var s = ""; ss = "";
        for (var x in $scope.xSearch) {

            var vcomparisonType = "equal";  // default
            if ($scope.x_o.forms[$scope.x_form].pages[$scope.x_page].fields[x].comparisonType !== undefined) {
                vcomparisonType = $scope.x_o.forms[$scope.x_form].pages[$scope.x_page].fields[x].comparisonType;
            }
            if (s.length > 0) {
                s += " AND ";
                ss += " AND ";
            }
            var c = ca[$scope.x_o.forms[$scope.x_form].pages[$scope.x_page].fields[x].columnsID];   // access to fieldType

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
                default:    // equal
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

        $scope.xSearchSql = {};
        $scope.xSearchSql.params = searchParameters;  // array of objects: field, compare, value
        $scope.xSearchSql.sql = s;
        $scope.xSearchListTitle = ss;
        $scope.xInit();
    };

    $scope.xInit = function () {
        $scope.xTree = {};
        $scope.x_page = "LIST";
        $http.post($scope.sloc + 'KB_x_getAll?module=' + $scope.x_o.name + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&jsonFields=' + $scope.x_o.forms[$scope.x_form].fieldsJSON + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy + '&masterID=' + $scope.x_masterID + '&rowsPage=' + $scope.x_rowsPage + '&pageCt=' + $scope.x_pageCt, JSON.stringify($scope.xSearchSql)).then
            (function (response) {
                $scope.xList = response.data.rv;
                $scope.xTree = function () {
                    return {}; // ... build from $scope.xList
                };
                if ($scope.xList.length > 0) {
                    if ($scope.x_rowsMax !== Math.round(response.data.rowCount / $scope.x_rowsPage + .5))
                        $scope.x_rowsMax = Math.round(response.data.rowCount / $scope.x_rowsPage + .5);
                }
            }, function (err) {
                alert("error xInit " + JSON.stringify(err));
                $scope.xList = [{}];
            });
    };

    $scope.xAdd = function () {
        $scope.x_page = "EDIT";
        $scope.xElement = { "ID": "", "infoJSON": {} };
        $scope.validateElement($scope.xElement.infoJSON, false);
        $scope.setDefaultsElement();
        $scope.initLookups();
        var y = "" + $scope.x_o.forms[$scope.x_form].fieldsMap;
        if (y !== "") {
            initMap(y);
        }
    };

    $scope.xView = function (item) {
        $scope.x_page = "EDIT";
        $scope.xElement = item;
        $scope.validateElement($scope.xElement.infoJSON, false);
        $scope.initLookups();
        // adjust comboBox fields
        var y = "" + $scope.x_o.forms[$scope.x_form].fieldsCheckbox;
        var x = y.split(",");
        if (typeof x !== undefined && x !== null) {
            for (var v in x) {
                if ($scope.xElement.infoJSON[x[v]] === "true") {
                    $scope.xElement.infoJSON[x[v]] = true;
                }
            }
        }
        // adjust date fields
        y = "" + $scope.x_o.forms[$scope.x_form].fieldsDate;
        x = y.split(",");
        if (typeof x !== undefined && x !== null) {
            for (v in x) {
                if ($scope.xElement.infoJSON[x[v]]) {
                    $scope.xElement.infoJSON[x[v]] = new Date($scope.xElement.infoJSON[x[v]].substring(0, 10));
                }
            }
        }
        y = "" + $scope.x_o.forms[$scope.x_form].fieldsMap;
        if (y !== "") {
            initMap(y);
        }
    };

    $scope.xSave = function (f) {
        if ($scope.validateElement($scope.xElement.infoJSON, true)) {
            $http.post($scope.sloc + 'KB_x_addUpdate?module=' + $scope.x_o.name + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xElement.ID + '&masterID=' + $scope.x_masterID + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy, JSON.stringify($scope.xElement.infoJSON)).then
                (function (response) {
                    $scope.xCancel(f);
                }, function (err) {
                    alert("save error");
                });
        }
    };

    $scope.xCancel = function (f) {
        f.$setPristine();
        $scope.xInit();
    };

    $scope.xDelete = function (f) {
        if (confirm("confirm deletion") === true) {
            $http.get($scope.sloc + 'KB_x_delete?module=' + $scope.x_o.name + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xElement.ID).then
                (function (response) {
                    $scope.xCancel(f);
                }, function (err) {
                    alert("error 4");
                });
        }
    };

    $scope.xUpDown = function (item, s) {
        $scope.myOrderBy = undefined;
        $http.get($scope.sloc + 'KB_x_sequencePut?module=' + $scope.x_o.name + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + item.ID + '&masterID=' + item.masterID + '&s=' + s + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy).then
            (function (response) {
                $scope.xInit();
            }, function (err) {
                alert("error 5");
            });
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
            $scope.xUpDown(tFrom[0], tTo[0].sequence + 5);
        }
    };

});