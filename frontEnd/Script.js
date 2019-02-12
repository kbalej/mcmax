var mmApp = angular.module("mmApp", ['ngSanitize']);
mmApp.controller("mmCtrl", function ($scope, $timeout, $http, $sce) {

    //$scope.x_o//
    
    //$scope.sloc="http://mcmax.azurewebsites.net/"; // node on Azure, no port
    //$scope.floc="http://mcmax.azurewebsites.net/UploadedFiles/";  
    
    $scope.sloc="http://172.22.22.51:8888/"; // node on Max Server
    $scope.floc="file:///home/kb/Documents/p/UploadedFiles/";
    
    //$scope.sloc="http://localhost:8888/";  // node on Asus
    //$scope.floc="file:///Users/Admin/Onedrive/p_A/UploadedFiles/";
    // build load function
    for (var x in $scope.x_o.lookups) { 
        if ($scope.x_o.lookups[x].masterLookup == undefined || $scope.x_o.lookups[x].masterLookup == null) { // masterLookup 
            $scope.x_o.lookups[x].load = function () { 
                $http.post($scope.sloc + 'KB_x_getAll?module=' + $scope.x_o.name + '&table=' + this.getParameters + '&rowsPage=999999&pageCt=1', JSON.stringify({ "params": [], "sql": "" })).then 
                    (function (response) { 
                        $scope.x_o.lookups[response.data.table].collection = response.data.rv; 
                        $scope.x_o.lookups[response.data.table].tree = convertListTree(response.data.rv); 
                        $scope.x_o.lookups[response.data.table].tree1 = $scope.x_o.lookups[response.data.table].tree.filter(function (e) { return e.show }); 
                    }, function (err) { 
                        $scope.x_o.lookups[err.data.table].collection = null; 
                        $scope.x_o.lookups[err.data.table].tree = null; 
                        $scope.x_o.lookups[err.data.table].tree1 = null; 
                    }) 
                }; 
        } else { 
            $scope.x_o.lookups[x].load = function () { 
                if (this.masterID !== undefined && this.masterID !== null) { 
                    $http.post($scope.sloc + 'KB_x_getAll?module=' + $scope.x_o.name + '&table=' + this.getParameters + '&masterID=' + this.masterID + '&rowsPage=999999&pageCt=1', JSON.stringify({ "params": [], "sql": "" })).then 
                        (function (response) { 
                            $scope.x_o.lookups[response.data.table].collection = response.data.rv; 
                            $scope.x_o.lookups[response.data.table].tree = convertListTree(response.data.rv); 
                            $scope.x_o.lookups[response.data.table].tree1 = $scope.x_o.lookups[response.data.table].tree.filter(function (e) { return e.show }); 
                        }, function (err) { 
                            $scope.x_o.lookups[err.data.table].collection = null; 
                            $scope.x_o.lookups[err.data.table].tree = null; 
                            $scope.x_o.lookups[err.data.table].tree1 = null; 
                        });
                } else { 
                    $scope.x_o.lookups[this.name].collection = null; 
                    $scope.x_o.lookups[this.name].tree = null; 
                    $scope.x_o.lookups[this.name].tree1 = null; 
                } 
            }; 
        } 
    } 

    $scope.x_n = [];
    $scope.x_rowsPage = 20;
    $scope.x_rowsMax = 1;
    $scope.x_pageCt = 1;

    var ca = $scope.x_o.columns;
    var c = {};

    $scope.mymenu = function (e) {
        if(e === "quit"){
            window.close();
        };
        if(e === "mydata"){
            $scope.x_form = "mydata";
            $scope.x_page = "EDIT";
            $scope.xElement = $scope.myData;
        };
    };

    $scope.select = function (id, table) { 
        if(selectListTree(id, $scope.x_o.lookups[table].tree)){ 
            $scope.x_o.lookups[table].tree1 = null; 
            $scope.x_o.lookups[table].tree1 = $scope.x_o.lookups[table].tree.filter(function (e) { return e.show }); 
        }
    };

    $scope.treeUpdate = function () { // called when initialising new or edited xElement
        //if($scope.x_o.forms[$scope.x_form].name == "forms"){debugger;}
        var y = "" + $scope.x_o.forms[$scope.x_form].fieldsLookup;
        if(y !== ""){
            var x = y.split(",");
            if (x.length > 0) {
                for (var v in x) {
                    var vid ="";
                    if ($scope.xElement.infoJSON[x[v]] !== undefined) {
                        vid = $scope.xElement.infoJSON[x[v]];
                    }
                    var l = x[v].substring(0, x[v].length - 2); // lookup name
                    var t = $scope.x_o.lookups[l].tree;
                    for (var h in t) {
                        if(t[h].level > 0) {
                            if(t[h].ID === vid) {t[h].show = true;} else {t[h].show = false;}
                        }
                    }
                    $scope.x_o.lookups[l].tree1 = null; 
                    $scope.x_o.lookups[l].tree1 = $scope.x_o.lookups[l].tree.filter(function (e) { return e.show }); 
                }
            }
        }
    };

    $scope.spacesListTree = function (level) { 
        var s = "", i; 
        for (i = 0; i < level; i++) { s += "...."; } 
        return s; 
    }; 
 
    convertListTree1 = function (level, id, list, tree) { 
        level += 1; 
        var t = list.filter(function (e) { 
            v_h = "";
            if(e.parentID === undefined || e.parentID === null)  {
                v_h = "";
            }
            else {
                v_h = e.parentID;
            }
            return v_h == id; 
            }); 
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
            if(t[x].parentID === undefined || t[x].parentID === null)  {
                o.parentID = "";
            } else {
                o.parentID = t[x].parentID; 
            }
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
            if (tree[x].parentID == id) {ct+=1;}
        }
        if(ct<1) {return false;}

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
        if ($scope.myOrderBy === undefined) {
            var x1 = x.replace("ID","Name"); // replace xID by xName
            $scope.myOrderBy = "infoJSON." + x1;    
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


    // when starting add / view. for table lookup 

    $scope.initLookups = function () {
        //if($scope.x_o.forms[$scope.x_form].name == "modules"){debugger;}
        var lu;
        var y = "" + $scope.x_o.forms[$scope.x_form].fieldsLookup;
        var x = y.split(",");
        if (x[0] !== undefined && x[0] !== "") {
            for (var v in x) {
                var vlookup = x[v].substring(0, x[v].length - 2);
                $scope.x_o.lookups[vlookup].load();
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
                                    if(r){ // eg '-10today' for 10 days before today, +-number first !
                                        var d = new Date();
                                        if (!isNaN(i)) {
                                            d.setDate(d.getDate() + i);
                                        }
                                        $scope.xElement.infoJSON[c.name]=d;
                                        $scope.xEditFormDirty = true;
                                    } else {
                                        $scope.xElement.infoJSON[c.name] = new Date(c.default);    
                                        $scope.xEditFormDirty = true;
                                    }
                                } else {
                                    if (c.fieldType === "lookup" && c.source === "table") {
                                        var t = $scope.x_o.lookups[c.lookup].collection.filter(function (e) {return (e.infoJSON.name == c.default);});
                                        if(t.length > 0) {
                                            $scope.xElement.infoJSON[c.name.substring(0,c.name.length - 2) + "Name"] = c.default;
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
            // update xElement calcNumbers from form field value - angular link not operational for calculated fields
            // $scope.xElement.infoJSON.net = document.getElementById("<form>net").value
            var t_c = $scope.x_o.tables[$scope.x_o.forms[$scope.x_form].tablesID].columns;
            for (var c in t_c) {
                if ($scope.x_o.columns[t_c[c]].calcNumber !== undefined && $scope.x_o.columns[t_c[c]].calcNumber) {
                    if (eval("document.getElementById('"+$scope.x_o.forms[$scope.x_form].name + $scope.x_o.columns[t_c[c]].name+"').value") !== undefined) {
                        eval("$scope.xElement.infoJSON[$scope.x_o.columns[t_c[c]].name] = document.getElementById('"+$scope.x_o.forms[$scope.x_form].name + $scope.x_o.columns[t_c[c]].name+"').value");
                    }
                }
            }
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
            }
            return vok;
        }
    };

    // *** login page

    $scope.x_page = "LOGIN";
    $scope.error = "";
    $scope.login = { "usrname": "", "password": "" };
    var userid = "";

    $scope.log_in = function () {
        var searchParameters = [];
        var o = {};
        o.field = "un";
        o.compare = "EQUAL";
        o.value = $scope.login.usrname;
        searchParameters.push(o);
        o = {};
        o.field = "pwd";
        o.compare = "EQUAL";
        o.value = $scope.login.password;
        searchParameters.push(o);
        $scope.xSearchSql = {};
        $scope.xSearchSql.params = searchParameters;  // array of objects: field, compare, value
        $scope.xSearchSql.sql = "JSON_VALUE(infoJSON,'$.un') = '" + $scope.login.usrname + "' and JSON_VALUE(infoJSON,'$.pwd') = '" + $scope.login.password + "'";
        $http.post($scope.sloc + "KB_x_getAll?module=KB&table=users&jsonFields=&orderBy=name&masterID=&rowsPage=1&pageCt=1", JSON.stringify($scope.xSearchSql)).then
            (function (response) {
                if(response.data.rv.length > 0) {
                    userid = response.data.rv[0].ID;
                    $scope.myData = response.data.rv[0];
                    $scope.error = "";
                    $scope.x_page = " ";    // show main menu only
                } else {
                    $scope.error = ">> user name / password unknown <<";    
                }
            },
            function (err) {
                $scope.error = ">> e r r o r <<";
            });
    };

    // *** navbar

    $scope.navMain = function (item) {
        $scope.x_form = item;
        if ($scope.x_o.forms[$scope.x_form].rowsPage !== undefined) { $scope.x_rowsPage = $scope.x_o.forms[$scope.x_form].rowsPage;}
        $scope.x_pageCt = 1;
        $scope.x_masterID = "";
        $scope.x_n = [];
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
        $scope.retrievePrevious(temp,"","");
        $scope.x_page = "LIST";  // navUp to LIST, not EDIT
        $scope.xEditFormDirty = false;
        $scope.xInitComplete();
    };

    $scope.retrievePrevious = function (temp, vto, vfromValue) {
        $scope.x_masterID = temp.masterID;
        $scope.x_form = temp.form;
        if ($scope.x_o.forms[$scope.x_form].rowsPage !== undefined) { $scope.x_rowsPage = $scope.x_o.forms[$scope.x_form].rowsPage;}
        $scope.x_pageCt = temp.pageCt;
        $scope.x_page = temp.page;
        $scope.xSearch = Object.assign({}, temp.xSearch);
        $scope.xSearchListTitle = temp.xSearchListTitle;
        $scope.xSearchSql = temp.xSearchSql;
        $scope.xElement = Object.assign({}, temp.xElement);
        if(vto !== "" && vfromValue !== "") {
            $scope.xElement.infoJSON[vto] = vfromValue;
        }
        $scope.myOrderBy = undefined;
    };

    $scope.navDown = function (item) {
        $scope.x_n.push({ "form": $scope.x_form, "page": $scope.x_page, "masterID": $scope.x_masterID, "pageCt": $scope.x_pageCt, "xSearch": Object.assign({}, $scope.xSearch), "xSearchListTitle": $scope.xSearchListTitle, "xSearchSql": $scope.xSearchSql, "xElement": Object.assign({}, $scope.xElement) });
        $scope.x_masterID = $scope.xElement.ID;
        $scope.x_form = item;
        if ($scope.x_o.forms[$scope.x_form].rowsPage !== undefined) { $scope.x_rowsPage = $scope.x_o.forms[$scope.x_form].rowsPage;}
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
        $scope.xEditFormDirty = false;
        if($scope.x_page !== "TREE") { $scope.x_page = "LIST"; } // after drag and drop keep TREE
        $scope.xInitComplete();
    };
    $scope.buildTree = function (l, id) {
        var llevel = l + 1;
        var t = [];
        if(id === "") {
            t = $scope.xList.filter(function (e) { return e.parentID === undefined || e.parentID === id; });
        } else {
            t = $scope.xList.filter(function (e) { return e.parentID === id; });
        }
        for (var x in t) {
            var n = {};
            n.ID = t[x].ID;
            n.sequence=t[x]._sequence;
            n.display=t[x].infoJSON.name;
            n.level = llevel;
            var tt = $scope.xList.filter(function (e) { return e.parentID == t[x].ID; });
            n.numberChildren = tt.length;
            if(n.numberChildren > 0) {
                n.status = "-";
            } else {
                n.status = " ";
            }
            n.show = true;
            $scope.xTree[t[x].ID] = n;
            if(n.numberChildren > 0) {$scope.buildTree(llevel, t[x].ID);}
        }
    };
    $scope.xInitComplete = function () {
        $http.post($scope.sloc + 'KB_x_getAll?module=' + $scope.x_o.name + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&jsonFields=' + $scope.x_o.forms[$scope.x_form].fieldsJSON + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy + '&masterID=' + $scope.x_masterID + '&rowsPage=' + $scope.x_rowsPage + '&pageCt=' + $scope.x_pageCt, JSON.stringify($scope.xSearchSql)).then
            (function (response) {
                $scope.xList = response.data.rv;
                $scope.xTree = {};
                for (var x in $scope.xList) {
                    $scope.xList[x]._sequence = x;
                }
                $scope.buildTree(-1, "");
                $scope.xTotal = {};
                // calc totals for x_o.forms[x_forms].fieldsTotal
                if($scope.x_o.forms[$scope.x_form].fieldsTotal !== undefined && $scope.x_o.forms[$scope.x_form].fieldsTotal !== ""){
                    var ttot = $scope.x_o.forms[$scope.x_form].fieldsTotal.split(",");
                    if(ttot !== undefined && ttot !== "" ){
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
                $scope.xList = [{}];
            }
        );
    };

    $scope.xAdd = function () {
        $scope.x_page = "EDIT";
        $scope.xElement = { "ID": "", "parentID": "", "sequence": 999999, "infoJSON": {} };
        $scope.validateElement($scope.xElement.infoJSON, false);
        $scope.initLookups(); // must precede setDefaultsElement for table lookup fields
        $scope.setDefaultsElement();
        $scope.treeUpdate();
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
        $scope.treeUpdate();
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
                    var h1 = new Date(h[0],h[1] - 1,h[2] );
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
        if($scope.x_form === "mydata"){
            $http.post($scope.sloc + 'KB_x_addUpdate?module=KB&table=users&ID=' + $scope.xElement.ID + '&masterID=' + $scope.xElement.masterID + '&orderBy=&parentID=' + $scope.xElement.parentID + '&sequence=' + $scope.xElement.sequence +'&uid=' + userid, JSON.stringify($scope.xElement.infoJSON)).then
                (function (response) {
                    $scope.xCancel(f);
                }, function (err) {
                    alert("save error");
                    $scope.xCancel(f);
                }
            );
        } else {
            if ($scope.validateElement($scope.xElement.infoJSON, true)) {
                // adjust date fields
                var x = $scope.x_o.forms[$scope.x_form].fieldsDate.split(",");
                if (x !== undefined && x !== null) {
                    for (v in x) {
                        if ($scope.xElement.infoJSON[x[v]]) {
                            $scope.xElement.infoJSON["_"+x[v]] = $scope.xElement.infoJSON[x[v]].toISOString();
                        }
                    }
                }
                var autoColumns = [];
                if($scope.x_o.forms[$scope.x_form].fieldsAuto !== undefined && $scope.x_o.forms[$scope.x_form].fieldsAuto !== "" ) {
                    var autoColumns = $scope.x_o.forms[$scope.x_form].fieldsAuto.split(",");
                }
                if($scope.xElement.ID === "" && autoColumns.length > 0){     // insert only
                    $http.post($scope.sloc + 'KB_getAuto?module=' + $scope.x_o.name + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName, $scope.x_o.forms[$scope.x_form].fieldsAuto).then
                        (function (response) {
                            var av = response.data.split(","); 
                            for (v in autoColumns){
                                if($scope.xElement.infoJSON[autoColumns[v]] === undefined ){ $scope.xElement.infoJSON[autoColumns[v]]=av[v]; }  // max + 1
                            }
                            $http.post($scope.sloc  + 'KB_x_addUpdate?module=' + $scope.x_o.name + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xElement.ID + '&masterID=' + $scope.x_masterID + '&parentID=' + $scope.xElement.parentID + '&sequence=' + $scope.xElement.sequence +'&uid=' + userid, JSON.stringify($scope.xElement.infoJSON)).then
                            (function (response) {
                                $scope.xCancel(f);
                            }, function (err) {
                                alert("save error");
                            }
                        );
                            }, function (err) {
                            alert("error auto " + JSON.stringify(err));
                        }
                    );
                } else {
                    $http.post($scope.sloc  + 'KB_x_addUpdate?module=' + $scope.x_o.name + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xElement.ID + '&masterID=' + $scope.x_masterID + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy + '&parentID=' + $scope.xElement.parentID + '&sequence=' + $scope.xElement.sequence +'&uid=' + userid, JSON.stringify($scope.xElement.infoJSON)).then
                        (function (response) {
                            $scope.xCancel(f);
                        }, function (err) {
                            alert("save error");
                        }
                    );
                }
            }
        }
    };

    $scope.xCancel = function (f) {
        f.$setPristine();
        if($scope.x_form === "mydata"){
            $scope.x_form = "";
            $scope.x_page = "LOGIN";
            $scope.error = "";
            $scope.login = { "usrname": "", "password": "" };
            userid = "";
            $scope.x_n = [];
            $scope.xEditFormDirty = false;
        } else {
            $scope.xInit();
        }
    };

    $scope.xDelete = function (f) {
        if (confirm("confirm deletion")) {
            var vst = "";
            if($scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]] == undefined) {
                vst="";
            } else {
                vst=$scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]].tablesName;
            }
            $http.get($scope.sloc + 'KB_x_delete?module=' + $scope.x_o.name + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xElement.ID + '&subtable=' + vst).then
                (function (response) {
                    $scope.xCancel(f);
                }, function (err) {
                    alert("error 4");
                }
            );
        }
    };

    $scope.xUpDown = function (item, s) {
        $scope.myOrderBy = undefined;
        $http.get($scope.sloc  + 'KB_x_sequencePut?module=' + $scope.x_o.name + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + item.ID + '&masterID=' + item.masterID + '&s=' + s + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy).then
            (function (response) {
                $scope.xInit();
            }, function (err) {
                alert("error 5");
            });
    };
    
    $scope.copyTotal = function () {
        var vp = $scope.x_o.forms[$scope.x_form].pages[$scope.x_page].copyTotal.split(" ");
        if (vp.length !== 2) {return;}
        var vfrom = vp[0];
        var vto = vp[1];
        var vfromValue = $scope.xTotal[vfrom];
        var temp = $scope.x_n.pop(); // navUp to EDIT
        $scope.retrievePrevious(temp, vto, vfromValue);
        $scope.xEditFormDirty = true; // for manual save
        $scope.xInitComplete();
    };
    
    $scope.dbtc = function (pfield,db,table) {
        if(db === undefined || table == undefined) { return; }
        if(windows.confirm("create db table")) {
            $http.post($scope.sloc + 'KB_table?module=' + db + "&table=" + table, "dummy").then  // module for db
                (function (response) {
                    $scope.xElement.infoJSON[pfield] = response.data;
                }, function (err) {
                    alert("db table not created");
                }
            );
        }
    };
        
    $scope.chart = function () {
        $scope.x_o.forms[$scope.x_form].pages[$scope.x_page].graph = false;
        $http.post($scope.sloc + 'KB_chart?module=' + $scope.x_o.name, "dummy").then
            (function (response) {
                var rv = response.data;
                var w = window.open("chart");
                w.document.open("");
                w.document.write(rv);
                w.document.close();
                $scope.x_o.forms[$scope.x_form].pages[$scope.x_page].graph = true;
            }, function (err) {
                alert("chart error");
                $scope.x_o.forms[$scope.x_form].pages[$scope.x_page].graph = true;
            }
        );
    };
    
    $scope.carousel = function () {
        var xCarousel = {};
        var vimg = $scope.x_o.forms[$scope.x_form].fieldsImage;
        if(vimg !== undefined && vimg !== "") {
            for (var x in $scope.xList) {
                var o = {};
                o.Picture = $scope.xList[x].infoJSON[vimg + "Path"];
                o.Description = $scope.xList[x].infoJSON[vimg + "Capture"];
                xCarousel[$scope.xList[x].ID] = o;
            }
        }
        $http.post($scope.sloc + 'KB_carousel?module=' + $scope.x_o.name, JSON.stringify(xCarousel)).then
            (function (response) {
                var rv = response.data;
                var w = window.open("carousel");
                w.document.open("");
                w.document.write(rv);
                w.document.close();
            }, function (err) {
                alert("carousel error");
            }
        );
    };

    $scope.doc = function (pfield) {
        if($scope.xElement.ID == "") {
            alert("save first !"); return;
        }
        var d_m = {};
        d_m.m=[]; // array of sorted master fields
        d_m.i=[]; // array of sorted child fields
        d_m.r={}; // object of ref tables with array of sorted ref fields
        d_m.g={};
        d_m.xMaster=$scope.xElement.infoJSON;
        d_m.sql = ""; // select commands to retrieve child and ref data from db server, preceded by optional update command to link new children
        d_m.sqlS=[]; // sequence of ref tables read from db server to associate model dm.r[] with data retrieved
        d_m.sqlG=[]; // sequence of grand children tables read from db server to associate model dm.g[] with data retrieved
        d_m.form=$scope.x_form;
        d_m.masterID = $scope.xElement.ID;
        var d_childName = $scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]].tablesName;
        var d_childSubForms = $scope.x_o.forms[$scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]].name].subForms;
        // order by 
        var vob = ""; // sort for child sql
        var x = $scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]].orderBy.split(",");
        for (v in x) {
            if( vob !== "" ) { vob += " , ";}
            var xx = x[v].split(":")
            if(xx[0] === "sequence"){
                vob += " " + xx[0];
            } else {
                vob += " JSON_VALUE(infoJSON, '$." + xx[0] + "')";
            }
            if(xx[1] === "D"){
                vob += " DESC ";
            }
        }
        d_m.sql += "SELECT * FROM " + $scope.x_o.name + "_" + d_childName + " WHERE masterID = '" + d_m.masterID + "' ORDER BY " + vob + " for json path;";
        var d_masterFields = $scope.x_o.forms[$scope.x_form].fieldsJSON;
        var d_masterLookups = $scope.x_o.forms[$scope.x_form].fieldsLookup;
        var d_childFields = $scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]].fieldsJSON;
        d_m.childTotalFields = $scope.x_o.forms[$scope.x_o.forms[$scope.x_form].subForms[0]].fieldsTotal;
        // fill d_m.m
        var x = d_masterFields.split(",");
        for (var v in x) { d_m.m.push(x[v]); }
        // fill d_m.i
        x = d_childFields.split(",");
        for (v in x) { 
            d_m.i.push(x[v]); 
        }
        // fill d_m.r
        x = d_masterLookups.split(",");
        if ( x !== undefined){
            for (v in x) { 
                var lu = x[v].substring(0,x[v].length - 2);
                if($scope.xElement.infoJSON[x[v]] !== undefined) {
                    d_m.sqlS.push(lu);
                    d_m.sql += "SELECT * FROM " + $scope.x_o.name + "_" + lu + " WHERE ID = '" + $scope.xElement.infoJSON[x[v]] + "' for json path;";
                }
                var xx = $scope.x_o.forms[lu].fieldsJSON.split(",");
                d_m.r[lu] = [];
                if (xx !== undefined) {
                    for (var vv in xx) { d_m.r[lu].push(xx[vv]); }
                }
                d_m.r[lu].sort();
            }
        }
        // fill d_m.g
        x = d_childSubForms;
        if ( x !== undefined){
            for (v in x) { 
                var sf = x[v];
                var sft = $scope.x_o.forms[sf].tablesName;
                d_m.sqlG.push(sf);
                d_m.sql += "SELECT JSON_VALUE(a.infoJSON,'$.date') date, b.* from VS_" + d_childName + " a inner join VS_" + sft + " b on a.ID = b.masterID where a.masterID = '" + d_m.masterID + "' ORDER BY JSON_VALUE(a.infoJSON,'$.date') for json path;";
                var xx = $scope.x_o.forms[sf].fieldsJSON.split(",");
                d_m.g[sf] = [];
                if (xx !== undefined) {
                    for (var vv in xx) { d_m.g[sf].push(xx[vv]); }
                }
                d_m.g[sf].sort();
            }
        }
        var d_id = [];  // shared ref keys master - child for filter 'combine' with no masterID
        var x1 = d_masterLookups.split(",");
        var x2 = d_childFields.split(",");
        for (var v1 in x1){
            for (var v2 in x2){
                if(x1[v1] === x2[v2]){ d_id.push(x1[v1]); }
            }
        }
        var s = "UPDATE " + $scope.x_o.name + "_" + d_childName + " SET masterID = '" + d_m.masterID + "' WHERE masterID='' ";
        for (var v in d_id){ 
            s += " and JSON_VALUE(infoJSON,'$." + d_id[v] + "') = '" + $scope.xElement.infoJSON[d_id[v]] + "'";
        }
        d_m.sql = s + ";" + d_m.sql;        
        d_m.m.sort();
        d_m.i.sort();
        $http.post($scope.sloc + 'KB_doc?module=' + $scope.x_o.name, JSON.stringify(d_m)).then
            (function (response) {
                $scope.xElement.infoJSON[pfield] = response.data; // eg docinv1111-2222-3333
                $http.post($scope.sloc  + 'KB_x_addUpdate?module=' + $scope.x_o.name + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xElement.ID + '&masterID=' + $scope.x_masterID + '&parentID=' + $scope.xElement.parentID + '&sequence=' + $scope.xElement.sequence +'&uid=' + userid, JSON.stringify($scope.xElement.infoJSON)).then
                    (function (response) {
                        // display doc page
                    }, function (err) {
                        alert("save error");
                    });
            }, function (err) {
                alert("doc error");
            }
        );
    };
    
    $scope.spaces = function (level) {   // used by tree table
        var s = "", i;
        for(i = 0; i < level; i++ ) { s +="    "; }
        return s;
    };

    $scope.treeCollapse = function () {
        for(var x in $scope.xTree) {
            if($scope.xTree[x].numberChildren < 1) {
                $scope.xTree[x].status = " ";
            } else {
                $scope.xTree[x].status = "+";
            }
            if($scope.xTree[x].level > 0){
                $scope.xTree[x].show = false;
            } else {
                $scope.xTree[x].show = true;
            }
        }
    };

    $scope.treeExpand = function () {
        for(var x in $scope.xTree) {
            if($scope.xTree[x].numberChildren < 1) {
                $scope.xTree[x].status = " ";
            } else {
                $scope.xTree[x].status = "-";
            }
            $scope.xTree[x].show = true;
        }
    };

    $scope.collapseChildren = function(id) {
        var t = $scope.xList.filter(function (e) { return e.parentID === id });
        for (var x in t) {
            $scope.xTree[t[x].ID].show = false;
            if($scope.xTree[t[x].ID].numberChildren < 1){
                $scope.xTree[t[x].ID].status=" ";
            } else {
                $scope.xTree[t[x].ID].status="+";
            }
            if($scope.xTree[t[x].ID].numberChildren > 0) { $scope.collapseChildren(t[x].ID);}
        }
    };

    $scope.treeClick = function (id) {

        if($scope.xTree[id].status === ' ') { return;}
        if($scope.xTree[id].status === '+') { // open next level
            var t = $scope.xList.filter(function (e) { return e.parentID === id });
            for (var x in t) {
                $scope.xTree[t[x].ID].show = true;
                if($scope.xTree[t[x].ID].numberChildren < 1){
                    $scope.xTree[t[x].ID].status = " ";
                } else {
                    $scope.xTree[t[x].ID].status = "-";
                }
            }
            $scope.xTree[id].status = '-';
        } else { // collapsed
            $scope.collapseChildren(id);
            $scope.xTree[id].status = '+';
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
            if($scope.x_page === 'LISTTREE') {
                $scope.xElement = $scope.xList[tFrom[0].sequence];
                $scope.xElement.sequence = $scope.xList[tTo[0].sequence].sequence;
                var dir = prompt("A-bove, B-elow, U-nderneath(for child)","A");
                if(dir.toUpperCase=="B") {
                    $scope.xElement.sequence += 5;
                }
                if(dir.toUpperCase=="A") {
                    $scope.xElement.sequence -= 5;
                }
                if(dir.toUpperCase=="U") {
                    $scope.xElement.parentID = $scope.xList[tTo[0].sequence].ID;
                    $scope.xElement.sequence = 0; // top of sublevel
                }
                $http.post($scope.sloc  + 'KB_x_addUpdate?module=' + $scope.x_o.name + '&table=' + $scope.x_o.forms[$scope.x_form].tablesName + '&ID=' + $scope.xElement.ID + '&masterID=' + $scope.xElement.masterID + '&parentID=' + $scope.xElement.parentID + '&sequence=' + $scope.xElement.sequence +'&uid=' + userid + '&orderBy=' + $scope.x_o.forms[$scope.x_form].orderBy, JSON.stringify($scope.xElement.infoJSON)).then
                    (function (response) {
                        $scope.init();

                    }, function (err) {
                        alert("drop save error");
                    });
            } else { // LIST drag and drop
                var dir = prompt("A-bove, B-elow","A");
                if(dir.toUpperCase()=="B") {
                    $scope.xUpDown(tFrom[0], tTo[0].sequence + 5);
                }
                if(dir.toUpperCase()=="A") {
                    $scope.xUpDown(tFrom[0], tTo[0].sequence - 5);
                }
            }
        }
    };
});