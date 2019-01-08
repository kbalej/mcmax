// set subforms
// set fieldsJSON, fieldsDate, fieldsCheckbox, fieldsLookup per form
// set html
// set x_o.lookups

function start(x_o) {

    var ca = x_o.columns;
    var c = {};

    removeTrailingComma = function (item) {
        var v = "";
        if (item.length > 0) {
            v = item.substring(0, item.length - 1);
        }
        return v;
    };

    var vFieldsLookup2 = "";    // lookup names,

    var vhtmlSearch = "";
    var vhtmlList = "";
    var vhtmlEdit = "";
    var vhtmlView = "";

    for (var f in x_o.forms) {
        var vFieldsJSON = "";
        var vFieldsDate = "";
        var vFieldsCheckbox = "";
        var vFieldsMap = "";
        var vFieldsLookup = ""; // field names,
        if (x_o.forms[f].parent !== undefined) {
            x_o.forms[x_o.forms[f].parent].subForms.push(x_o.forms[f].name);
        }  // update subForms of parent
        if (x_o.forms[f].tablesID !== undefined) {
            for (x in x_o.tables[x_o.forms[f].tablesID].columns) {
                c = x_o.columns[x_o.tables[x_o.forms[f].tablesID].columns[x]];
                if (!vFieldsJSON.includes(c.name)) { vFieldsJSON += c.name + ","; }
                if (c.fieldType === "lookup" && c.source === "table") {
                    if (!vFieldsJSON.includes(c.lookup + "Name,")) { vFieldsJSON += c.lookup + "Name,"; }
                    if (c.masterLookup !== undefined) {
                        if (!vFieldsJSON.includes(c.lookup + "masterID,")) { vFieldsJSON += c.lookup + "masterID,"; }
                        if (!vFieldsJSON.includes(c.lookup + "masterName,")) { vFieldsJSON += c.lookup + "masterName,"; }
                    }
                }
                if (c.fieldType === "image") {
                    if (!vFieldsJSON.includes(c.name + "Path,")) { vFieldsJSON += c.name + "Path,"; }
                    if (!vFieldsJSON.includes(c.name + "Capture,")) { vFieldsJSON += c.name + "Capture,"; }
                    if (!vFieldsJSON.includes(c.name + "Comment,")) { vFieldsJSON += c.name + "Comment,"; }
                    if (!vFieldsJSON.includes(c.name + "Width,")) { vFieldsJSON += c.name + "Width,"; }
                    if (!vFieldsJSON.includes(c.name + "Height,")) { vFieldsJSON += c.name + "Height,"; }
                }
                if (c.fieldType === "map") {
                    if (!vFieldsJSON.includes(c.name + "Capture,")) { vFieldsJSON += c.name + "Capture,"; }
                    if (!vFieldsJSON.includes(c.name + "Comment,")) { vFieldsJSON += c.name + "Comment,"; }
                    if (!vFieldsJSON.includes(c.name + "Width,")) { vFieldsJSON += c.name + "Width,"; }
                    if (!vFieldsJSON.includes(c.name + "Height,")) { vFieldsJSON += c.name + "Height,"; }
                    if (!vFieldsJSON.includes(c.name + "Longitude,")) { vFieldsJSON += c.name + "Longitude,"; }
                    if (!vFieldsJSON.includes(c.name + "Latitude,")) { vFieldsJSON += c.name + "Latitude,"; }
                    if (!vFieldsJSON.includes(c.name + "Zoom,")) { vFieldsJSON += c.name + "Zoom,"; }
                }
            }
            x_o.forms[f].fieldsJSON = removeTrailingComma(vFieldsJSON);
        }
        for (var p in x_o.forms[f].pages) {

            if (p.substring(0, 6) === "SEARCH") {
                vhtmlSearch += "<div ng-switch-when='" + x_o.forms[f].name + "'>";
                for (fi in x_o.forms[f].pages[p].fields) {
                    c = ca[x_o.forms[f].pages[p].fields[fi].columnsID];
                    if (c !== undefined) { // skip pages without fields
                        if (c.label !== undefined) { // show fields with label, only
                            var vfieldname = c.name; // for id and model
                            if (x_o.forms[f].pages[p].fields[fi].labelComplement !== undefined) { vfieldname += x_o.forms[f].pages[p].fields[fi].labelComplement }
                            vhtmlSearch += "<label for='" + x_o.forms[f].name + c.name + "'>" + c.label + " " + x_o.forms[f].pages[p].fields[fi].comparisonType + "</label >";
                            switch (c.fieldType) {
                                case "text":
                                case "password":
                                case "email":
                                case "url":
                                case "number":
                                case "date":
                                case "datetime":
                                case "local":
                                case "month":
                                case "time":
                                case "week":
                                case "checkBox":
                                case "image":
                                case "file":
                                case "map":
                                    vhtmlSearch += "<input id='" + x_o.forms[f].name + vfieldname + "' type='" + c.fieldType + "' class='form-control' ng-model='xSearch." + vfieldname + "' >";
                                    break;
                                case "textArea":
                                    vhtmlSearch += "<textarea id='" + x_o.forms[f].name + vfieldname + "' rows='" + c.rows + "' class='form-control' ng-model='xSearch." + vfieldname + "' ></textarea>";
                                    break;
                                case "lookup":
                                    vhtmlSearch += "<select id='" + x_o.forms[f].name + vfieldname + "' class='form-control' ng-model='xSearch." + vfieldname + "' ";
                                    if (x_o.forms[f].pages[p].fields[fi].labelComplement === "multiple") {
                                        vhtmlSearch += " multiple ";
                                    }
                                    if (c.source === "table") {
                                        // field must be included in EDIT pages to define x_o.lookups
                                        if (c.lookupFields === undefined) { c.lookupFields = '' } else { console.log(c.lookupFields); }
                                        vhtmlSearch += " ng-change=\"completeLookupField('xSearch',x_o.lookups." + c.lookup + ".name,'" + c.lookupFields + "')\" ng-options='it.ID as it.name for it in x_o.lookups." + c.lookup + ".collection'";
                                    }
                                    if (c.source === "model") {
                                        vhtmlSearch += " ng-options='" + c.modelPath + "'";
                                    }
                                    vhtmlSearch += " >";
                                    if (c.specific !== undefined) {
                                        var result = c.specific.match(/\w+/g);
                                        for (var x in result) {
                                            if (result[x] === "_") {
                                                vhtmlSearch += "<option value = ''> -- none --";
                                            } else {
                                                vhtmlSearch += "<option value = '" + result[x] + "'>" + result[x];
                                            }
                                        }
                                    }
                                    vhtmlSearch += "</select >";
                                    break;
                            }
                        }
                    }
                }
                vhtmlSearch += "</div>";
            }


            if (p.substring(0, 4) === "LIST") {
                var vh = "";
                var vd = "";
                for (var fi in x_o.forms[f].pages[p].fields) {
                    c = ca[x_o.forms[f].pages[p].fields[fi].columnsID];
                    if (c.fieldType !== undefined) {
                        vh += "<th ng-click=\"orderByMe('" + c.name + "')\">" + c.label + "</th>";
                        if (c.source !== undefined && c.fieldType === "lookup" && c.source === "table") {
                            vd += "<td ng-bind='item.infoJSON." + c.lookup + "Name'></td>";
                        } else if (c.fieldType === "email") {
                            vd += "<td><a href='mailto:{{item.infoJSON." + c.name + "}}'target='_blank'><span ng-if='item.infoJSON." + c.name + "' class='glyphicon glyphicon-envelope'></span></a></td>";
                        } else if (c.fieldType === "tel") {
                            vd += "<td><a href='tel:{{item.infoJSON." + c.name + "}}' target='_blank'><span ng-if='item.infoJSON." + c.name + "' class='glyphicon glyphicon-earphone'></span></a></td>";
                        } else if (c.fieldType === "url") {
                            vd += "<td><a href='{{item.infoJSON." + c.name + "}}' target='blank'><span ng-if='item.infoJSON." + c.name + "'>http</span></a></td>";
                        } else if (c.fieldType === "checkBox") {
                            vd += "<td><span ng-if='item.infoJSON." + c.name + "' class='glyphicon glyphicon-ok-sign'></span></td>";
                        } else if (c.fieldType === "image") {
                            vd += "<td><img ng-if='item.infoJSON." + c.name + "Path' src='item.infoJSON." + c.name + "Path' alt='item.infoJSON." + c.name + "Caption' style=''width: 42px; height: 42px; border: 0;''></td>";
                        } else if (c.fieldType === "file") {
                            vd += "<td><span ng-if='item.infoJSON." + c.name + "Caption'>item.infoJSON." + c.name + "Caption </span></td>";
                        } else {
                            if (c.fieldType === 'number') {
                                if (c.fractionSize === undefined) {
                                    vd += "<td align='right' ng-bind='item.infoJSON." + c.name + " | number : 2'></td>"; 
                                } else {
                                    vd += "<td align='right' ng-bind='item.infoJSON." + c.name + " | number : " + c.fractionSize + "'></td>";
                                }
                            } else if (c.fieldType === 'date' || c.fieldType === 'local') {
                                vd += "<td ng-bind='item.infoJSON." + c.name + ".substring(0, 10) | date '></td>";
                            } else {
                                vd += "<td ng-bind='item.infoJSON." + c.name + "'></td>";
                            }
                        }
                    }
                }
                vd += "<td><a href=\"#\" ng-click=\"xView(item)\"><span class=\"glyphicon glyphicon-eye-open\"></span></a><a ng-show=\"x_o.forms[x_form].orderBy == 'sequence'\" href=\"#\" ng-click=\"xUpDown(item,Number(item.sequence) - 15)\"><span class=\"glyphicon glyphicon-arrow-up\"></span></a><a ng-show=\"x_o.forms[x_form].orderBy == 'sequence'\" href=\"#\" ng-click=\"xUpDown(item,Number(item.sequence) + 15)\"><span class=\"glyphicon glyphicon-arrow-down\"></span></a></td>";
                vhtmlList += "<div ng-switch-when='" + x_o.forms[f].pages[p].name + x_o.forms[f].name + "'>";
                vhtmlList += "<table class='table table-striped' ng-switch='x_form'><thead><tr>" + vh + "</tr></thead><tbody>";
                if (x_o.forms[f].orderBy === "sequence") {
                    vhtmlList += "<tr id='{{item.ID}}' ondrop='drop(event)' ondragover='allowDrop(event)' draggable='true' ondragstart='drag(event)' ng-repeat='item in xList  | orderBy:myOrderBy'>" + vd;
                } else {
                    vhtmlList += "<tr ng-repeat='item in xList  | orderBy:myOrderBy'>" + vd;
                }
                vhtmlList += "</tr></tbody></table></div>";
            }

            //   if (p.substring(0, 4) === "VIEW") { }

            if (p.substring(0, 4) === "EDIT") {
                vhtmlEdit += "<div ng-switch-when='" + x_o.forms[f].pages[p].name + x_o.forms[f].name + "'>";
                vhtmlEdit += "<fieldset oninput='" + x_o.forms[f].pages[p].calcFormula.replace(/::/gi, x_o.forms[f].name) + "'>"
                for (fi in x_o.forms[f].pages[p].fields) {
                    c = ca[x_o.forms[f].pages[p].fields[fi].columnsID];
                    if (c !== undefined) { // skip pages without fields
                        if (c.label !== undefined) { // show fields with label, only
                            var vhide = "";   // label + input
                            if (c.hideIf !== undefined) {
                                vhide = " ng-hide=\"" + c.hideIf.replace(/_./gi, "xElement.infoJSON.").replace(/::/gi, "'") + "\" "; // replace _ by xElement.infoJSON and :: by '
                            }
                            switch (c.fieldType) {  // label
                                case "tel":
                                    vhtmlEdit += "<label for='" + x_o.forms[f].name + c.name + "'" + vhide + "><a href='tel:{{xElement.infoJSON." + c.name + "}}' target='_blank'><span ng-if='xElement.infoJSON." + c.name + "' class='glyphicon glyphicon-earphone'></span></a></label >";
                                    break;
                                case "email":
                                    vhtmlEdit += "<label for='" + x_o.forms[f].name + c.name + "'" + vhide + "><a href='mailto:{{xElement.infoJSON." + c.name + "}}' target='_blank'><span ng-if='xElement.infoJSON." + c.name + "' class='glyphicon glyphicon-envelope'></span></a></label >";
                                    break;
                                case "url":
                                    vhtmlEdit += "<label for='" + x_o.forms[f].name + c.name + "'" + vhide + "><a href='{{xElement.infoJSON." + c.name + "}}' target='blank'><span ng-if='xElement.infoJSON." + c.name + "'>http</span></a></label >";
                                    break;
                                case "image":
                                    break;
                                case "map":
                                    break;
                                default:
                                    vhtmlEdit += "<label for='" + x_o.forms[f].name + c.name + "'" + vhide + ">" + c.label + "</label >";
                                    break;
                            }
                            switch (c.fieldType) {  // input 
                                case "text":
                                case "password":
                                case "email":
                                case "url":
                                case "month":
                                case "time":
                                case "week":
                                case "checkBox":
                                    vhtmlEdit += "<input id='" + x_o.forms[f].name + c.name + "' " + vhide + " type='" + c.fieldType + "' class='form-control {{x_o.forms[x_form].pages[x_page].fields[" + c.name + "].validation}}' ng-model='xElement.infoJSON." + c.name + "' >";
                                    break;
                                case "date":
                                case "local":
                                    vhtmlEdit += "<input id='" + x_o.forms[f].name + c.name + "' " + vhide + " type='date' class='form-control {{x_o.forms[x_form].pages[x_page].fields[" + c.name + "].validation}}' ng-model='xElement.infoJSON." + c.name + "' >";
                                    break;
                                case "datetime":
                                    vhtmlEdit += "<input id='" + x_o.forms[f].name + c.name + "' " + vhide + " type='datetime-local' class='form-control {{x_o.forms[x_form].pages[x_page].fields[" + c.name + "].validation}}' ng-model='xElement.infoJSON." + c.name + "' >";
                                    break;
                                case "number":  // input type number does not display value, replaced by text
                                    if(c.autoNumber || c.calcNumber) {   // readonly
                                        vhtmlEdit += "<input id='" + x_o.forms[f].name + c.name + "' " + vhide + " type='text' class='form-control {{x_o.forms[x_form].pages[x_page].fields[" + c.name + "].validation}}' ng-model='xElement.infoJSON." + c.name + "' readonly >";
                                    }else {
                                        vhtmlEdit += "<input id='" + x_o.forms[f].name + c.name + "' " + vhide + " type='text' class='form-control {{x_o.forms[x_form].pages[x_page].fields[" + c.name + "].validation}}' ng-model='xElement.infoJSON." + c.name + "' >";
                                    }
                                    break;
                                case "textArea":
                                    vhtmlEdit += "<textarea id='" + x_o.forms[f].name + c.name + "' " + vhide + " rows='" + c.rows + "' class='form-control {{x_o.forms[x_form].pages[x_page].fields[" + c.name + "].validation}}' ng-model='xElement.infoJSON." + c.name + "' ></textarea>";
                                    break;
                                case "image":
                                    vhtmlEdit += "<div class='form-group'><div class='row'><div class='col-xs-8'>";
                                    vhtmlEdit += "<label>" + c.label + " </label>";
                                    vhtmlEdit += "<img ng-src=\"{{xElement.infoJSON." + c.name + "Path}}\" class='img-rounded' width='150'>";
                                    vhtmlEdit += "</div><div class='col-xs-4'>";
                                    vhtmlEdit += "<a href='#' onclick='$(\"#" + x_o.forms[f].name + c.name + "\").trigger(\"click\");' class='btn btn-default' role='button'>Select</a>";
                                    vhtmlEdit += "<button onclick='removePicture(\"" + c.name + "\")' class='btn btn-default' ng-show='xElement.infoJSON." + x_o.forms[f].name + c.name + "'><span class='glyphicon glyphicon-trash'></span></button>";
                                    vhtmlEdit += "<input id='" + x_o.forms[f].name + c.name + "' type='file' style='display:none' class='form-control' accept='image/*' onchange='changePicture(\"" + x_o.forms[f].name + c.name + "\",\"" + c.name + "\");' ng-model='xElement.infoJSON." + c.name + "'>";
                                    vhtmlEdit += "</div></div></div>";
                                    vhtmlEdit += "<input type='text' class='form-control' placeholder='Enter Path' ng-model='xElement.infoJSON." + c.name + "Path'>";
                                    vhtmlEdit += "<input type='text' class='form-control' placeholder='Enter Image Width' ng-model='xElement.infoJSON." + c.name + "Width'>";
                                    vhtmlEdit += "<input type='text' class='form-control' placeholder='Enter Image Height' ng-model='xElement.infoJSON." + c.name + "Height'>";
                                    vhtmlEdit += "<input type='text' class='form-control' placeholder='Enter Capture' ng-model='xElement.infoJSON." + c.name + "Capture'>";
                                    vhtmlEdit += "<textarea rows='5' class='form-control' placeholder='Enter Comment' ng-model='xElement.infoJSON." + c.name + "Comment'></textarea>";
                                    break;
                                case "map":
                                    vhtmlEdit += "<input type='text' class='form-control' placeholder='Enter Map Width' ng-model='xElement.infoJSON." + c.name + "Width'>";
                                    vhtmlEdit += "<input type='text' class='form-control' placeholder='Enter Mag Height' ng-model='xElement.infoJSON." + c.name + "Height'>";
                                    vhtmlEdit += "<input type='text' class='form-control' placeholder='Enter Capture' ng-model='xElement.infoJSON." + c.name + "Capture'>";
                                    vhtmlEdit += "<textarea rows='5' class='form-control' placeholder='Enter Comment' ng-model='xElement.infoJSON." + c.name + "Comment'></textarea>";
                                    vhtmlEdit += "<input type='text' class='form-control' placeholder='Longitude' readonly ng-model='xElement.infoJSON." + c.name + "Longitude'>";
                                    vhtmlEdit += "<input type='text' class='form-control' placeholder='Latitude' readonly ng-model='xElement.infoJSON." + c.name + "Latitude'>";
                                    vhtmlEdit += "<input type='text' class='form-control' placeholder='Zoom' readonly ng-model='xElement.infoJSON." + c.name + "Zoom'>";
                                    break;
                                case "doc":
                                    vhtmlEdit += "<input id='" + x_o.forms[f].name + c.name + "' type='text' class='form-control' ng-model='xElement.infoJSON." + c.name + "' readonly > <input type='button' class='form-control' ng-click='doc()' value='create and print' >";
                                    break;
                                case "lookup":
                                    vhtmlEdit += "<select id='" + x_o.forms[f].name + c.name + "' " + vhide + " class='form-control {{x_o.forms[x_form].pages[x_page].fields[" + c.name + "].validation}}' ng-model='xElement.infoJSON." + c.name + "' ";
                                    if (c.source === "table") {
                                        if (c.lookupFields == undefined) { c.lookupFields = '' }
                                        vhtmlEdit += " ng-change=\"completeLookupField('xElement',x_o.lookups." + c.lookup + ".name,'" + c.lookupFields + "')\" ng-options='it.ID as it.infoJSON.name for it in x_o.lookups." + c.lookup + ".collection'";
                                    }
                                    if (c.source === "model") {
                                        vhtmlEdit += " ng-options='" + c.modelPath + "'";
                                    }
                                    vhtmlEdit += " >";
                                    if (c.specific !== undefined) {
                                        result = c.specific.match(/\w+/g);
                                        for (x in result) {
                                            if (result[x] === "_") {
                                                vhtmlEdit += "<option value = ''> -- none --";
                                            } else {
                                                vhtmlEdit += "<option value = '" + result[x] + "'>" + result[x];
                                            }
                                        }
                                    }
                                    vhtmlEdit += "</select >";
                                    break;
                            }
                        }
                        if (c.fieldType === "date" || c.fieldType === "datetime" || c.fieldType === "local" || c.fieldType === "month" || c.fieldType === "time" || c.fieldType === "week") {
                            if (!vFieldsDate.includes(c.name)) { vFieldsDate += c.name + ","; }
                        }
                        if (c.fieldType === "checkBox") {
                            if (!vFieldsCheckbox.includes(c.name)) { vFieldsCheckbox += c.name + ","; }
                        }
                        if (c.fieldType === "map") {
                            if (!vFieldsMap.includes(c.name)) { vFieldsMap += c.name + ","; }
                        }
                        if (c.fieldType === "lookup" && c.source === "table") {
                            if (!vFieldsLookup.includes(c.name)) { vFieldsLookup += c.name + ","; }
                            if (!vFieldsLookup2.includes(c.lookup)) {
                                // set up lookups
                                vFieldsLookup2 += c.lookup + ",";
                                x_o.lookups[c.lookup] = {};
                                x_o.lookups[c.lookup].name = c.lookup;
                                x_o.lookups[c.lookup].getParameters = c.lookup + "&orderBy=" + x_o.forms[c.lookup].orderBy;
                                x_o.lookups[c.lookup].collection = [{}];
                                x_o.lookups[c.lookup].masterLookup = c.masterLookup;
                                // load function defined in Script.js
                            }
                        }
                    }
                }
                vhtmlEdit += "</fieldset>";
                vhtmlEdit += "</div>";
            }
        }
        x_o.forms[f].fieldsDate = removeTrailingComma(vFieldsDate);
        x_o.forms[f].fieldsCheckbox = removeTrailingComma(vFieldsCheckbox);
        x_o.forms[f].fieldsMap = removeTrailingComma(vFieldsMap);
        x_o.forms[f].fieldsLookup = removeTrailingComma(vFieldsLookup);
    }
    x_o.htmlSearch = vhtmlSearch;
    x_o.htmlList = vhtmlList;
    x_o.htmlEdit = vhtmlEdit;
    x_o.htmlView = vhtmlView;
    return x_o;
}
exports.start = start;