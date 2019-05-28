var completeModel = require("./completeModel");

function start(vmodules, vforms, vpages, vfields, vtables, vcolumns, vFiles, querystring, io, callback) {
    var buildForms = function (id) {
        var oo = {};
        var t_forms = vforms.filter(function (e) { return e.masterID === id; });
        for (var x in t_forms) {
            t_forms[x].infoJSON.ID = t_forms[x].ID; // copy ID to infoJSON for cModule
            oo[t_forms[x].infoJSON.name] = t_forms[x].infoJSON;
            oo[t_forms[x].infoJSON.name].parentID = t_forms[x].parentID;
            oo[t_forms[x].infoJSON.name].subForms = [];
            oo[t_forms[x].infoJSON.name].pages = buildPages(t_forms[x].ID);
        }
        return oo;
    };
    var buildPages = function (id) {
        var oo = {};
        var t_pages = vpages.filter(function (e) { return e.masterID === id; });
        for (var x in t_pages) {
            if (t_pages[x].infoJSON.calcFormula === undefined) { t_pages[x].infoJSON.calcFormula = '' }
            oo[t_pages[x].infoJSON.name] = t_pages[x].infoJSON;
            oo[t_pages[x].infoJSON.name].fields = buildFields(t_pages[x].ID);
        }
        return oo;
    };
    var buildFields = function (id) {
        var oo = {};
        var t_fields = vfields.filter(function (e) { return e.masterID === id; });
        for (var x in t_fields) {
            var vfn = t_fields[x].infoJSON.columnsName;
            if (t_fields[x].infoJSON.labelComplement !== undefined) { vfn += t_fields[x].infoJSON.labelComplement; }
            oo[vfn] = t_fields[x].infoJSON;
        }
        return oo;
    };
    var buildTables = function () {
        var oo = {};
        for (var x in vtables) {
            oo[vtables[x].ID] = vtables[x].infoJSON; // key = table ID, value = infoJSON +
            oo[vtables[x].ID].parentID = vtables[x].parentID;
            oo[vtables[x].ID].modulesID = vtables[x].masterID;
            var h = vmodules.filter(function (e) { return e.ID == vtables[x].masterID; });
            if(h.length<1){
                console.log(vtables[x].infoJSON);
            }else{
                oo[vtables[x].ID].db = h[0].infoJSON.name;
            }
            oo[vtables[x].ID].columns = listColumns(vtables[x].ID);
        }
        return oo;
    };
    var buildColumns = function () {
        var oo = {};
        for (var x in vcolumns) {
            oo[vcolumns[x].ID] = vcolumns[x].infoJSON;
        }
        return oo;
    };
    var listColumns = function (id) {
        var a = [];
        var t_columns = vcolumns.filter(function (e) { return e.masterID === id; });
        for (var x in t_columns) {
            a.push(t_columns[x].ID);
        }
        return a;
    };
    var t_modules = vmodules.filter(function (e) { return e.infoJSON.name === querystring.module; });
    var o = {};
    if (t_modules[0] === undefined) {
        callback(true, "not found");
    } else {
        o.dbs = {};
        for (var x in vmodules) {
            var h = {};
            h["name"] = vmodules[x].infoJSON.name;
            o.dbs[vmodules[x].ID] = h;
        }
        o.ID = t_modules[0].ID;
        o.name = t_modules[0].infoJSON.name;
        if (t_modules[0].infoJSON.description !== undefined) { o.description = t_modules[0].infoJSON.description; }
        if (t_modules[0].infoJSON.logo !== undefined) { o.description = t_modules[0].infoJSON.logo; }
        o.forms = buildForms(t_modules[0].ID);
        o.tables = buildTables();
        o.columns = buildColumns();
        o.lookups = {};
        o.Files = vFiles;
        var rv = JSON.stringify(completeModel.start(o));
        callback(false, rv);
    }
}
exports.start = start;