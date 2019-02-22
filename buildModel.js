var completeModel = require("./completeModel");

function start(vmodules, vforms, vpages, vfields, vtables, vcolumns, querystring, callback) {
    var buildForms = function (id) {
        var oo = {};
        var t_forms = vforms.filter(function (e) { return e.masterID === id; });
        for (var x in t_forms) {
            oo[t_forms[x].infoJSON.name] = t_forms[x].infoJSON;
            oo[t_forms[x].infoJSON.name].subForms = [];
            oo[t_forms[x].infoJSON.name].pages = buildPages(t_forms[x].ID);
        }
        return oo;
    };
    var buildPages = function (id) {
        var oo = {};
        var t_pages = vpages.filter(function (e) { return e.masterID === id; });
        for (var x in t_pages) {
            if (t_pages[x].infoJSON.calcFormula === undefined) { t_pages[x].infoJSON.calcFormula = ''}
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
            oo[vtables[x].ID] = vtables[x].infoJSON;
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
    o.ID = t_modules[0].infoJSON.ID;
    o.name = t_modules[0].infoJSON.name;
    o.forms = buildForms(t_modules[0].ID);
    o.tables = buildTables();
    o.columns = buildColumns();
    o.lookups = {};
    var rv = JSON.stringify(completeModel.start(o));
    callback(false, rv);
}
exports.start = start;