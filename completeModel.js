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

    var vFieldsLookup2 = ""; // lookup names,

    var vhtmlSearch = "";
    var vhtmlList = "";
    var vhtmlEdit = "";
    var vhtmlView = "";

    for (var f in x_o.forms) {
        var vFieldsJSON = "";
        var vFieldsTotal = "";
        var vFieldsDate = "";
        var vFieldsAuto = "";
        var vFieldsCheckbox = "";
        var vFieldsMap = "";
        var vFieldsImage = "";
        var vFieldsLookup = ""; // field names,
        if (x_o.forms[f].parentID  !== undefined && x_o.forms[f].parentID  !== null && x_o.forms[f].parentID !== "") {
            var h="";
            for(var x in x_o.forms){
                if(x_o.forms[x].ID == x_o.forms[f].parentID){
                    h=x_o.forms[x].name;
                }
            }
            if(h!==""){x_o.forms[h].subForms.push(x_o.forms[f].name);}
        } // update subForms of parent
        if (x_o.forms[f].tablesID !== undefined) {
            for (x in x_o.tables[x_o.forms[f].tablesID].columns) {
                c = x_o.columns[x_o.tables[x_o.forms[f].tablesID].columns[x]];
                if (!vFieldsJSON.includes(c.name)) {
                    vFieldsJSON += c.name + ",";
                }
                if (c.fieldType === "lookup" && c.source === "table") {
                    if (!vFieldsJSON.includes(c.lookup + "Name,")) {
                        vFieldsJSON += c.lookup + "Name,";
                    }
                    if (c.masterLookup !== undefined) {
                        if (!vFieldsJSON.includes(c.lookup + "masterID,")) {
                            vFieldsJSON += c.lookup + "masterID,";
                        }
                        if (!vFieldsJSON.includes(c.lookup + "masterName,")) {
                            vFieldsJSON += c.lookup + "masterName,";
                        }
                    }
                }
                if (c.fieldType === "image") {
                    if (!vFieldsJSON.includes(c.name + "Path,")) {
                        vFieldsJSON += c.name + "Path,";
                    }
                    if (!vFieldsJSON.includes(c.name + "Capture,")) {
                        vFieldsJSON += c.name + "Capture,";
                    }
                    if (!vFieldsJSON.includes(c.name + "Comment,")) {
                        vFieldsJSON += c.name + "Comment,";
                    }
                    if (!vFieldsJSON.includes(c.name + "Width,")) {
                        vFieldsJSON += c.name + "Width,";
                    }
                    if (!vFieldsJSON.includes(c.name + "Height,")) {
                        vFieldsJSON += c.name + "Height,";
                    }
                }
                if (c.fieldType === "map") {
                    if (!vFieldsJSON.includes(c.name + "Capture,")) {
                        vFieldsJSON += c.name + "Capture,";
                    }
                    if (!vFieldsJSON.includes(c.name + "Comment,")) {
                        vFieldsJSON += c.name + "Comment,";
                    }
                    if (!vFieldsJSON.includes(c.name + "Longitude,")) {
                        vFieldsJSON += c.name + "Longitude,";
                    }
                    if (!vFieldsJSON.includes(c.name + "Latitude,")) {
                        vFieldsJSON += c.name + "Latitude,";
                    }
                    if (!vFieldsJSON.includes(c.name + "Zoom,")) {
                        vFieldsJSON += c.name + "Zoom,";
                    }
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
                            if (x_o.forms[f].pages[p].fields[fi].labelComplement !== undefined) {
                                vfieldname += x_o.forms[f].pages[p].fields[fi].labelComplement
                            }
                            vhtmlSearch += "<label for='" + x_o.forms[f].name + c.name + "'>" + c.label + " " + x_o.forms[f].pages[p].fields[fi].comparisonType + "</label >";
                            switch (c.fieldType) {
                                case "text":
                                case "password":
                                case "email":
                                case "url":
                                case "number":
                                case "date":
                                case "local":
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
                                        if (c.lookupFields === undefined) {
                                            c.lookupFields = ''
                                        }
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
                var vt = "";
                for (var fi in x_o.forms[f].pages[p].fields) {
                    c = ca[x_o.forms[f].pages[p].fields[fi].columnsID];
                    if (c.fieldType !== undefined) {
                        if (c.fieldType === 'number') {
                            //vh += "<th class='alignRight' ng-click=\"orderByMe('" + c.name + "')\">" + c.label + "</th>";
                        } else {
                            //vh += "<th ng-click=\"orderByMe('" + c.name + "')\">" + c.label + "</th>";
                        }
                        if (c.source !== undefined && c.fieldType === "lookup" && c.source === "specific") {
                            if(x_o.forms[f].pages[p].inlineEDIT && !x_o.forms[f].pages[p].fields[fi].readOnly){
                                vd += "<td><span ng-hide='ieElement.ID === item.ID && ieeditingInProgress' ng-bind='item.infoJSON." + c.name + "'></span>";
                                vd += "<span ng-show='ieElement.ID === item.ID && ieeditingInProgress'><select class='form-control' ng-model='ieElement.infoJSON." + c.name + "' >";
                                var result = c.specific.match(/\w+/g);
                                for (x in result) {
                                    if (result[x] === "_") {
                                        vd += "<option value = '' > -- none --</option>";
                                    } else {
                                        var xx = result[x].split(":");
                                        if(xx.length>1){
                                            vd += "<option value = '" + xx[0] + "' >" + xx[1] + "</option>"; 
                                        }else{
                                            vd += "<option value = '" + result[x] + "' >" + result[x] + "</option>";
                                        }
                                    }
                                }
                                vd += "</select></span></td>";
                            }else
                            {
                                vd += "<td ng-bind='item.infoJSON." + c.name + "'></td>";
                            }
                        } else if (c.source !== undefined && c.fieldType === "lookup" && c.source === "table") {
                            if(x_o.forms[f].pages[p].inlineEDIT && !x_o.forms[f].pages[p].fields[fi].readOnly){
                                vd += "<td><span ng-hide='ieElement.ID === item.ID && ieeditingInProgress'><span ng-bind='item.infoJSON." + c.lookup + "Name'></span></span>";
                                vd += "<span ng-show='ieElement.ID === item.ID && ieeditingInProgress'><select class='form-control' ng-model='ieElement.infoJSON." + c.name + "' ";
                                if (c.lookupFields == undefined) {
                                    c.lookupFields = ''
                                }
                                vd += "ng-change=\"select(item.infoJSON." + c.name + ",'" + c.lookup + "');completeLookupField('ieElement',x_o.lookups." + c.lookup + ".name,'" + c.lookupFields + "');\" >";
                                vd += "<OPTION ng-repeat='item in x_o.lookups." + c.lookup + ".tree1' value='{{item.ID}}' ng-selected='item.sel' > ";
                                vd += "{{spacesListTree(item.level)}} {{item.name}} </OPTION></select></span></td>";
                            }else
                            {
                                vd += "<td ng-bind='item.infoJSON." + c.lookup + "Name'></td>";
                            }
                        } else if (c.fieldType === "email") {
                            if(x_o.forms[f].pages[p].inlineEDIT && !x_o.forms[f].pages[p].fields[fi].readOnly)
                            {
                                vd += "<td><span ng-hide='ieElement.ID === item.ID && ieeditingInProgress'><a href='mailto:{{item.infoJSON." + c.name + "}}'target='_blank'><span ng-if='item.infoJSON." + c.name + "' class='glyphicon glyphicon-envelope'></span></a></span>";
                                vd += "<span ng-show='ieElement.ID === item.ID && ieeditingInProgress'><input type='" + c.fieldType + "' class='form-control' ng-model='ieElement.infoJSON." + c.name + "' ></span></td>";
                            }else
                            {
                                vd += "<td><a href='mailto:{{item.infoJSON." + c.name + "}}'target='_blank'><span ng-if='item.infoJSON." + c.name + "' class='glyphicon glyphicon-envelope'></span></a></td>";
                            }
                        } else if (c.fieldType === "tel") {
                            if(x_o.forms[f].pages[p].inlineEDIT && !x_o.forms[f].pages[p].fields[fi].readOnly)
                            {
                                vd += "<td><span ng-hide='ieElement.ID === item.ID && ieeditingInProgress'><a href='tel:{{item.infoJSON." + c.name + "}}' target='_blank'><span ng-if='item.infoJSON." + c.name + "' class='glyphicon glyphicon-earphone'></span></a></span>";
                                vd += "<span ng-show='ieElement.ID === item.ID && ieeditingInProgress'><input type='" + c.fieldType + "' class='form-control' ng-model='ieElement.infoJSON." + c.name + "' ></span></td>";                            
                            }else
                            {
                                vd += "<td><a href='tel:{{item.infoJSON." + c.name + "}}' target='_blank'><span ng-if='item.infoJSON." + c.name + "' class='glyphicon glyphicon-earphone'></span></a></td>";
                            }
                        } else if (c.fieldType === "url") {
                            if(x_o.forms[f].pages[p].inlineEDIT && !x_o.forms[f].pages[p].fields[fi].readOnly)
                            {
                                vd += "<td><span ng-hide='ieElement.ID === item.ID && ieeditingInProgress'><a href='{{item.infoJSON." + c.name + "}}' target='blank'><span ng-if='item.infoJSON." + c.name + "'>http</span></a></span>";
                                vd += "<span ng-show='ieElement.ID === item.ID && ieeditingInProgress'><input type='" + c.fieldType + "' class='form-control' ng-model='ieElement.infoJSON." + c.name + "' ></span></td>";                            
                            }else
                            {
                                vd += "<td><a href='{{item.infoJSON." + c.name + "}}' target='blank'><span ng-if='item.infoJSON." + c.name + "'>http</span></a></td>";
                            }
                        } else if (c.fieldType == "checkBox") {
                            if(x_o.forms[f].pages[p].inlineEDIT && !x_o.forms[f].pages[p].fields[fi].readOnly)
                            {
                                vd += "<td><span ng-hide='ieElement.ID === item.ID && ieeditingInProgress' ng-if='item.infoJSON." + c.name + "' class='glyphicon glyphicon-ok-sign'></span>";
                                vd += "<span ng-show='ieElement.ID === item.ID && ieeditingInProgress'><input type='" + c.fieldType + "' class='form-control' ng-model='ieElement.infoJSON." + c.name + "' ></span></td>";                            
                            }else
                            {
                                vd += "<td><span ng-if='item.infoJSON." + c.name + "' class='glyphicon glyphicon-ok-sign'></span></td>";
                            }
                        } else if (c.fieldType === "image") {
                            if(x_o.forms[f].pages[p].inlineEDIT && !x_o.forms[f].pages[p].fields[fi].readOnly)
                            {
                                vd += "<td><span ng-hide='ieElement.ID === item.ID && ieeditingInProgress'><img ng-if='item.infoJSON." + c.name + "Path' ng-src='{{item.infoJSON." + c.name + "Path}}' alt='item.infoJSON." + c.name + "Caption' style=''width: 42px; height: 42px; border: 0;''></span>";
                                vd += "<span ng-show='ieElement.ID === item.ID && ieeditingInProgress'><input type='text' class='form-control' ng-model='ieElement.infoJSON." + c.name + "Path' placeholder='Enter path' ></span></td>";                            
                            }else
                            {
                                vd += "<td><img ng-if='item.infoJSON." + c.name + "Path' ng-src='{{item.infoJSON." + c.name + "Path}}' width='100' alt='item.infoJSON." + c.name + "Caption' style=''width: 42px; height: 42px; border: 0;''></td>";                            
                            }
                        } else if (c.fieldType === "file") {
                            if(x_o.forms[f].pages[p].inlineEDIT && !x_o.forms[f].pages[p].fields[fi].readOnly)
                            {
                                vd += "<td><span ng-hide='ieElement.ID === item.ID && ieeditingInProgress' ng-if='item.infoJSON." + c.name + "Caption'>item.infoJSON." + c.name + "Caption </span>";
                                vd += "<span ng-show='ieElement.ID === item.ID && ieeditingInProgress'><input type='text' class='form-control' ng-model='ieElement.infoJSON." + c.name + "Caption' placeholder='Enter caption' ></span></td>";                            
                            }else
                            {
                                vd += "<td><span ng-if='item.infoJSON." + c.name + "Caption'>item.infoJSON." + c.name + "Caption </span></td>";
                            }
                        } else {
                            if (c.fieldType === 'number') {
                                if (c.fractionSize === undefined) {
                                    if(x_o.forms[f].pages[p].inlineEDIT && !x_o.forms[f].pages[p].fields[fi].readOnly)
                                    {
                                        vd += "<td><span ng-hide='ieElement.ID === item.ID && ieeditingInProgress'><span align='right' ng-bind='item.infoJSON." + c.name + " | number : 2'></span></span>";
                                        vd += "<span ng-show='ieElement.ID === item.ID && ieeditingInProgress'><input type='" + c.fieldType + "' class='form-control' ng-model='ieElement.infoJSON." + c.name + "' ></span></td>";                            
                                    }else
                                    {
                                        vd += "<td align='right' ng-bind='item.infoJSON." + c.name + " | number : 2'></td>";
                                    }
                                 } else {
                                    if(x_o.forms[f].pages[p].inlineEDIT && !x_o.forms[f].pages[p].fields[fi].readOnly)
                                    {
                                        vd += "<td><span ng-hide='ieElement.ID === item.ID && ieeditingInProgress'><span align='right' ng-bind='item.infoJSON." + c.name + " | number : " + c.fractionSize + "'></span></span>";
                                        vd += "<span ng-show='ieElement.ID === item.ID && ieeditingInProgress'><input type='" + c.fieldType + "' class='form-control' ng-model='ieElement.infoJSON." + c.name + "' ></span></td>";                            
                                    }else
                                    {
                                        vd += "<td align='right' ng-bind='item.infoJSON." + c.name + " | number : " + c.fractionSize + "'></td>";
                                    }
                                }
                            } else if (c.fieldType === 'date' || c.fieldType === 'local') {
                                if(x_o.forms[f].pages[p].inlineEDIT && !x_o.forms[f].pages[p].fields[fi].readOnly)
                                {
                                    vd += "<td><span ng-hide='ieElement.ID === item.ID && ieeditingInProgress'><span ng-bind='item.infoJSON." + c.name + ".substring(0, 10) | date '></span></span>";
                                    vd += "<span ng-show='ieElement.ID === item.ID && ieeditingInProgress'><input type='date' class='form-control' ng-model='ieElement.infoJSON." + c.name + "' ></span></td>";                            
                                }else
                                {
                                    vd += "<td ng-bind='item.infoJSON." + c.name + ".substring(0, 10) | date '></td>";
                                }
                            } else {
                                if(x_o.forms[f].pages[p].inlineEDIT && !x_o.forms[f].pages[p].fields[fi].readOnly)
                                {
                                    vd += "<td><span ng-hide='ieElement.ID === item.ID && ieeditingInProgress'><span ng-bind-html='item.infoJSON." + c.name + "'></span></span>";
                                    vd += "<span ng-show='ieElement.ID === item.ID && ieeditingInProgress'><input type='text' class='form-control' ng-model='ieElement.infoJSON." + c.name + "' ></span></td>";                            
                                }else
                                {
                                    vd += "<td ng-bind='item.infoJSON." + c.name + "'></td>";
                                }
                            }
                        }
                    }
                    if (c.totalNumber) {
                        vt += "<td class='alignRight'><span ng-bind='xTotal." + c.name + " | number : 2'></span></td>";
                    } else {
                        vt += "<td></td>";
                    }
                }
                vd += "<td><a ng-show='!ieeditingInProgress' href=\"#\" ng-click=\"xView(item)\"><span class=\"glyphicon glyphicon-eye-open\"></span></a>";
                if(x_o.forms[f].pages[p].inlineEDIT)
                {
                    vd += "<a ng-show='x_o.forms[x_form]._U && !ieeditingInProgress' ng-click='ieeditSwitch(item)' href=\"#\"> <span class='glyphicon glyphicon-edit'></span></a>";
                    vd += "<a ng-show='x_o.forms[x_form]._D && !ieeditingInProgress' ng-click='iedelete(xEditForm)' href=\"#\"> <span class='glyphicon glyphicon-remove'></span></a>";
                    vd += "<a ng-show='ieElement.ID === item.ID && ieeditingInProgress' ng-click='ieupdate(xEditForm)' href=\"#\"> <span class='glyphicon glyphicon-save'></span></a>";
                    vd += "<a ng-show='ieElement.ID === item.ID && ieeditingInProgress' ng-click='ieeditSwitch(item)' href=\"#\"> <span class='glyphicon glyphicon-remove'></span></a>";
                }
                vd += "<a ng-show=\"x_o.forms[x_form].orderBy == 'sequence && !ieeditingInProgress'\" href=\"#\" ng-click=\"xUpDown(item,-15)\"> <span class=\"glyphicon glyphicon-arrow-up\"></span></a>";
                vd += "<a ng-show=\"x_o.forms[x_form].orderBy == 'sequence && !ieeditingInProgress'\" href=\"#\" ng-click=\"xUpDown(item,15)\"> <span class=\"glyphicon glyphicon-arrow-down\"></span></a></td>";
                vhtmlList += "<div ng-switch-when='" + x_o.forms[f].pages[p].name + x_o.forms[f].name + "'>";
                vhtmlList += "<table class='table table-striped' ng-switch='x_form'><thead><tr>" + vh + "</tr></thead><tbody>";
                if (x_o.forms[f].orderBy === "sequence") {
                    vhtmlList += "<tr id='{{item.ID}}' ondrop='drop(event)' ondragover='allowDrop(event)' draggable='true' ondragstart='drag(event)' ng-repeat='item in xList | orderBy:myOrderBy'>" + vd;
                } else {
                    vhtmlList += "<tr ng-repeat='item in xList  | orderBy:myOrderBy'>" + vd;
                }
                vhtmlList += "</tr></tbody><tfoot><tr>" + vt + "</tr></tfoot></table></div>";
            }

            if (p.substring(0, 4) === "VIEW") {
                vhtmlView += "<div ng-switch-when='" + x_o.forms[f].pages[p].name + x_o.forms[f].name + "'>";
                for (fi in x_o.forms[f].pages[p].fields) {
                    c = ca[x_o.forms[f].pages[p].fields[fi].columnsID];
                    if (c !== undefined) { 
                        if (c.label !== undefined) { // show fields with label, only
                            var vhide = ""; // label + input
                            if (c.hideIf !== undefined) {
                                vhide = " ng-hide=\"" + c.hideIf.replace(/_/gi, "xElement.infoJSON.").replace(/::/gi, "'") + "\" "; // replace _ by xElement.infoJSON and :: by '
                            }
                            switch (c.fieldType) { // label
                                case "tel":
                                    vhtmlView += "<label for='" + "V" + x_o.forms[f].name + c.name + "'" + vhide + "><a href='tel:{{xElement.infoJSON." + c.name + "}}' target='_blank'><span class='glyphicon glyphicon-earphone'></span></a></label >";
                                    break;
                                case "email":
                                    vhtmlView += "<label for='" + "V" + x_o.forms[f].name + c.name + "'" + vhide + "><a href='mailto:{{xElement.infoJSON." + c.name + "}}' target='_blank'><span class='glyphicon glyphicon-envelope'></span></a></label >";
                                    break;
                                case "url":
                                    vhtmlView += "<label for='" + "V" + x_o.forms[f].name + c.name + "'" + vhide + "><a href='{{xElement.infoJSON." + c.name + "}}' target='blank'>" + c.label + "</a></label >";
                                    break;
                                case "map":
                                    break;
                                default:
                                    vhtmlView += "<label for='" + "V" + x_o.forms[f].name + c.name + "'" + vhide + ">" + c.label + "</label >";
                                    break;
                            }
                            switch (c.fieldType) { // input 
                                case "text":
                                case "password":
                                case "email":
                                case "tel":
                                case "color":
                                case "date":    
                                case "url":
                                    break;
                                case "checkBox":
                                    vhtmlView += "<input readonly id='V" + x_o.forms[f].name + c.name + "' " + vhide + " type='" + c.fieldType + "' class='form-control {{x_o.forms[x_form].pages[x_page].fields[" + c.name + "].validation}}' ng-model='xElement.infoJSON." + c.name + "' >";
                                    break;
                                case "local":
                                    vhtmlView += "<input readonly id='V" + x_o.forms[f].name + c.name + "' " + vhide + " type='date' class='form-control' ng-model='xElement.infoJSON." + c.name + "' >";
                                    break;
                                case "number": // input type number does not display value, replaced by text
                                    if (c.autoNumber || c.calcNumber) { // readonly
                                        vhtmlView += "<input readonly id='V" + x_o.forms[f].name + c.name + "' " + vhide + " type='text' class='form-control' ng-model='xElement.infoJSON." + c.name + "' readonly >";
                                        if (c.autoNumber && !vFieldsAuto.includes(c.name)) {
                                            vFieldsAuto += c.name + ",";
                                        }
                                        if (c.totalNumber && !vFieldsTotal.includes(c.name)) {
                                            vFieldsTotal += c.name + ",";
                                        }
                                    } else {
                                        vhtmlView += "<input readonly id='V" + x_o.forms[f].name + c.name + "' " + vhide + " type='text' class='form-control' ng-model='xElement.infoJSON." + c.name + "' >";
                                    }
                                    break;
                                case "html":
                                    vhtmlView += "<div class='form-group'><div class='row'><div class='col-xs-8'>";
                                    vhtmlView += "<iframe srcdoc=\"{{xElement.infoJSON." + c.name + "}}\"></iframe>";
                                    vhtmlView += "</div></div></div>";
                                    break;  
                                case "textArea":
                                    vhtmlView += "<textarea readonly id='V" + x_o.forms[f].name + c.name + "' " + vhide + " rows='" + c.rows + "' class='form-control' ng-bind='xElement.infoJSON." + c.name + "' ></textarea>";
                                    break;
                                case "image":
                                    vhtmlView += "<div class='form-group'><div class='row'><div class='col-xs-8'>";
                                    vhtmlView += "<center><img ng-src=\"{{xElement.infoJSON." + c.name + "Path}}\" class='img-rounded' width=\"{{xElement.infoJSON." + c.name + "Width}}\" height=\"{{xElement.infoJSON." + c.name + "Height}}\">";
                                    vhtmlView += "<p ng-bind='xElement.infoJSON." + c.name + "Capture'></p></center>";
                                    vhtmlView += "</div></div></div>";
                                    break;
                                case "utube":
                                    vhtmlView += "<div class='form-group'><div class='row'><div class='col-xs-8'>";
                                    vhtmlView += "<iframe width=\"{{xElement.infoJSON." + c.name + "Width}}\" height=\"{{xElement.infoJSON." + c.name + "Height}}\" ng-src=\"{{xElement.infoJSON." + c.name + "Path}}\"></iframe>";
                                    vhtmlView += "</div></div></div>";
                                    break;  
                                case "map":
                                    vhtmlView += "<input readonly type='text' class='form-control' placeholder='Enter Capture' ng-model='xElement.infoJSON." + c.name + "Capture'>";
                                    vhtmlView += "<textarea readonly rows='5' class='form-control' placeholder='Enter Comment' ng-model='xElement.infoJSON." + c.name + "Comment'></textarea>";
                                    break;
                                case "doc":
                                    vhtmlView += "<a href='{{sloc}}{{xElement.infoJSON." + c.name + "}}.html' target='_blank'> {{xElement.infoJSON." + c.name + "}}</a> <input type='button' ng-hide='xElement.infoJSON." + c.name + " || xElement.ID === \"\"' class='form-control' ng-click='doc(\"" + c.name + "\")' value='create doc and save' >";
                                    break;
                                case "lookup":
                                    if (c.source === "table") {
                                        vhtmlView += "<select readonly id='V" + x_o.forms[f].name + c.name + "' " + vhide + " class='form-control' ng-model='xElement.infoJSON." + c.name + "' ";
                                        if (c.lookupFields == undefined) {
                                            c.lookupFields = ''
                                        }
                                        vhtmlView += "ng-change=\"select(xElement.infoJSON." + c.name + ",'" + c.lookup + "');completeLookupField('xElement',x_o.lookups." + c.lookup + ".name,'" + c.lookupFields + "');\" >";
                                        vhtmlView += "<OPTION ng-repeat='item in x_o.lookups." + c.lookup + ".tree1' value='{{item.ID}}' ng-selected='item.sel' > ";
                                        vhtmlView += "{{spacesListTree(item.level)}} {{item.name}} </OPTION> ";
                                    }
                                    if (c.source === "model") {
                                        vhtmlView += "<select readonly id='V" + x_o.forms[f].name + c.name + "' " + vhide + " class='form-control' ng-model='xElement.infoJSON." + c.name + "' ";
                                        vhtmlView += " ng-options='" + c.modelPath + "' >";
                                        if (c.other) {
                                            vhtmlView += "<input readonly type='text' class='form-control' placeholder='Enter free text option' ng-model='xElement.infoJSON." + c.name + "'>";
                                        }
                                    }
                                    if (c.source === "specific") {
                                        vhtmlView += "<select readonly id='V" + x_o.forms[f].name + c.name + "' " + vhide + " class='form-control' ng-model='xElement.infoJSON." + c.name + "' >";
                                    }
                                    if (c.specific !== undefined) {
                                        result = c.specific.match(/\w+/g);
                                        for (x in result) {
                                            if (result[x] === "_") {
                                                vhtmlView += "<option value = '' > -- none --</option>";
                                            } else {
                                                vhtmlView += "<option value = '" + result[x] + "' >" + result[x] + "</option>";
                                            }
                                        }
                                    }
                                    vhtmlView += "</select>";
                                    break;
                            }
                        }
                        if (c.fieldType === "date" || c.fieldType === "local") {
                            if (!vFieldsDate.includes(c.name)) {
                                vFieldsDate += c.name + ",";
                            }
                        }
                        if (c.fieldType === "checkBox") {
                            if (!vFieldsCheckbox.includes(c.name)) {
                                vFieldsCheckbox += c.name + ",";
                            }
                        }
                        if (c.fieldType === "map") {
                            if (!vFieldsMap.includes(c.name)) {
                                vFieldsMap += c.name + ",";
                            }
                        }
                        if (c.fieldType === "image") {
                            if (!vFieldsImage.includes(c.name)) {
                                vFieldsImage += c.name + ",";
                            }
                        }
                        if (c.fieldType === "lookup" && c.source === "table") {
                            if (!vFieldsLookup.includes(c.name)) {
                                vFieldsLookup += c.name + ",";
                            }
                            if (!vFieldsLookup2.includes(c.lookup)) {
                                // set up lookups
                                vFieldsLookup2 += c.lookup + ",";
                                x_o.lookups[c.lookup] = {};
                                x_o.lookups[c.lookup].name = c.lookup;
                                x_o.lookups[c.lookup].getParameters = c.lookup + "&orderBy=" + x_o.forms[c.lookup].orderBy;
                                x_o.lookups[c.lookup].collection = [];
                                x_o.lookups[c.lookup].masterLookup = c.masterLookup;
                                // load function defined in Script.js
                            }
                        }
                    }
                }
                vhtmlView += "</div>";
            }

            if (p.substring(0, 4) === "EDIT") {
                vhtmlEdit += "<div ng-switch-when='" + x_o.forms[f].pages[p].name + x_o.forms[f].name + "'>";
                if(x_o.tables[x_o.forms[f].tablesID].calcFormula == undefined){
                    vhtmlEdit += "<fieldset oninput=''>";
                }else{
                    vhtmlEdit += "<fieldset oninput='" + x_o.tables[x_o.forms[f].tablesID].calcFormula.replace(/::/gi, x_o.forms[f].name) + "'>";
                }
                for (fi in x_o.forms[f].pages[p].fields) {
                    c = ca[x_o.forms[f].pages[p].fields[fi].columnsID];
                    if (c !== undefined) { // skip pages without fields
                        if (c.label !== undefined) { // show fields with label, only
                            var vhide = ""; // label + input
                            if (c.hideIf !== undefined) {
                                vhide = " ng-hide=\"" + c.hideIf.replace(/_/gi, "xElement.infoJSON.").replace(/::/gi, "'") + "\" "; // replace _ by xElement.infoJSON and :: by '
                            }
                            switch (c.fieldType) { // label
                                case "tel":
                                    vhtmlEdit += "<label for='" + x_o.forms[f].name + c.name + "'" + vhide + "><a href='tel:{{xElement.infoJSON." + c.name + "}}' target='_blank'><span class='glyphicon glyphicon-earphone'></span></a></label >";
                                    break;
                                case "email":
                                    vhtmlEdit += "<label for='" + x_o.forms[f].name + c.name + "'" + vhide + "><a href='mailto:{{xElement.infoJSON." + c.name + "}}' target='_blank'><span class='glyphicon glyphicon-envelope'></span></a></label >";
                                    break;
                                case "url":
                                    vhtmlEdit += "<label for='" + x_o.forms[f].name + c.name + "'" + vhide + "><a href='{{xElement.infoJSON." + c.name + "}}' target='blank'>" + c.label + "</a></label>";
                                    break;
                                case "map":
                                    break;
                                default:
                                    vhtmlEdit += "<label for='" + x_o.forms[f].name + c.name + "'" + vhide + ">" + c.label + "</label >";
                                    break;
                            }
                            if(x_o.forms[f].pages[p].fields[fi].readOnly){ vhide += " readonly "} // for editable forms with locked fields
                            switch (c.fieldType) { // input 
                                case "text":
                                case "password":
                                case "email":
                                case "tel":
                                case "url":
                                case "color":
                                case "date":
                                    vhtmlEdit += "<input id='" + x_o.forms[f].name + c.name + "' " + vhide + " type='" + c.fieldType + "' class='form-control {{x_o.forms[x_form].pages[x_page].fields[" + c.name + "].validation}}' ng-model='xElement.infoJSON." + c.name + "' >";
                                    break;
                                case "checkBox":
                                    vhtmlEdit += "<input id='" + x_o.forms[f].name + c.name + "' " + vhide + " type='" + c.fieldType + "' class='form-control {{x_o.forms[x_form].pages[x_page].fields[" + c.name + "].validation}}' ng-model='xElement.infoJSON." + c.name + "' >";
                                    break;
                                case "local":
                                    vhtmlEdit += "<input id='" + x_o.forms[f].name + c.name + "' " + vhide + " type='date' class='form-control {{x_o.forms[x_form].pages[x_page].fields[" + c.name + "].validation}}' ng-model='xElement.infoJSON." + c.name + "' >";
                                    break;
                                case "number": // input type number does not display value, replaced by text
                                    if (c.autoNumber || c.calcNumber) { // readonly
                                        vhtmlEdit += "<input id='" + x_o.forms[f].name + c.name + "' " + vhide + " type='text' class='form-control {{x_o.forms[x_form].pages[x_page].fields[" + c.name + "].validation}}' ng-model='xElement.infoJSON." + c.name + "' readonly >";
                                        if (c.autoNumber && !vFieldsAuto.includes(c.name)) {
                                            vFieldsAuto += c.name + ",";
                                        }
                                        if (c.totalNumber && !vFieldsTotal.includes(c.name)) {
                                            vFieldsTotal += c.name + ",";
                                        }
                                    } else {
                                        vhtmlEdit += "<input id='" + x_o.forms[f].name + c.name + "' " + vhide + " type='text' class='form-control {{x_o.forms[x_form].pages[x_page].fields[" + c.name + "].validation}}' ng-model='xElement.infoJSON." + c.name + "' >";
                                    }
                                    break;
                                case "html":
                                case "textArea":
                                    vhtmlEdit += "<textarea id='" + x_o.forms[f].name + c.name + "' " + vhide + " rows='" + c.rows + "' class='form-control {{x_o.forms[x_form].pages[x_page].fields[" + c.name + "].validation}}' ng-model='xElement.infoJSON." + c.name + "' ></textarea>";
                                    break;
                                case "image":
                                    vhtmlEdit += "<div class='form-group'><div class='row'><div class='col-xs-8'>";
                                    vhtmlEdit += "<img ng-src=\"{{xElement.infoJSON." + c.name + "Path}}\" class='img-rounded' width=\"{{xElement.infoJSON." + c.name + "Width}}\" height=\"{{xElement.infoJSON." + c.name + "Height}}\">";
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
                                case "utube":
                                    vhtmlEdit += "<div class='form-group'><div class='row'><div class='col-xs-8'>";
                                    vhtmlEdit += "<iframe width=\"{{xElement.infoJSON." + c.name + "Width}}\" height=\"{{xElement.infoJSON." + c.name + "Height}}\" ng-src=\"{{xElement.infoJSON." + c.name + "Path }}\"></iframe>";
                                    vhtmlEdit += "<input type='text' class='form-control' placeholder='Enter Path' ng-model='xElement.infoJSON." + c.name + "Path'>";
                                    vhtmlEdit += "<input type='text' class='form-control' placeholder='Enter uTube Width' ng-model='xElement.infoJSON." + c.name + "Width'>";
                                    vhtmlEdit += "<input type='text' class='form-control' placeholder='Enter utube Height' ng-model='xElement.infoJSON." + c.name + "Height'>";
                                    vhtmlEdit += "</div></div></div>";
                                    break;                                
                                case "map":
                                    vhtmlEdit += "<input type='text' class='form-control' placeholder='Enter Capture' ng-model='xElement.infoJSON." + c.name + "Capture'>";
                                    vhtmlEdit += "<textarea rows='5' class='form-control' placeholder='Enter Comment' ng-model='xElement.infoJSON." + c.name + "Comment'></textarea>";
                                    vhtmlEdit += "<input type='text' class='form-control' placeholder='Latitude' ng-model='xElement.infoJSON." + c.name + "Latitude'>";
                                    vhtmlEdit += "<input type='text' class='form-control' placeholder='Longitude' ng-model='xElement.infoJSON." + c.name + "Longitude'>";
                                    vhtmlEdit += "<input type='text' class='form-control' placeholder='Zoom' ng-model='xElement.infoJSON." + c.name + "Zoom'>";
                                    break;
                                case "doc":
                                    vhtmlEdit += "<a href='{{sloc}}{{xElement.infoJSON." + c.name + "}}.html' target='_blank'> {{xElement.infoJSON." + c.name + "}}</a> <input type='button' ng-hide='xElement.infoJSON." + c.name + " || xElement.ID === \"\"' class='form-control' ng-click='doc(\"" + c.name + "\")' value='create doc and save' >";
                                    break;
                                case "dbtc":
                                    vhtmlEdit += " {{xElement.infoJSON." + c.name + "}} <input type='button' ng-hide='xElement.ID === \"\"' class='form-control' ng-click='dbtc(\"" + c.name + "\",xElement.masterID,xElement.name)' value='create db table' >";
                                    break;
                                case "dbqc":
                                    vhtmlEdit += " {{xElement.infoJSON." + c.name + "}} <input type='button' ng-hide='xElement.ID === \"\"' class='form-control' ng-click='dbqc(\"" + c.name + "\",xElement.masterID,xElement.ID,xElement.infoJSON.name)' value='create query for db table' >";
                                    break;                                
                                case "bDB":
                                    vhtmlEdit += " {{xElement.infoJSON." + c.name + "}} <input type='button' class='form-control' ng-click='bDB(\"" + c.name + "\",xElement.ID,xElement.infoJSON.name)' value='backup db to mongo and mysql' >";
                                    break;
                                case "cModule":
                                    vhtmlEdit += " {{xElement.infoJSON." + c.name + "}} <input type='button' class='form-control' ng-click='cModule(xElement.infoJSON.name, xElement.ID)' value='create module from diagram' >";
                                    break;
                                case "cTables":
                                    vhtmlEdit += " {{xElement.infoJSON." + c.name + "}} <input type='button' class='form-control' ng-click='cTables(xElement.infoJSON.name, xElement.ID)' value='create tables from diagram' >";
                                    break;
                                case "lookup":
                                    if (c.source === "table") {
                                        vhtmlEdit += "<select id='" + x_o.forms[f].name + c.name + "' " + vhide + " class='form-control {{x_o.forms[x_form].pages[x_page].fields[" + c.name + "].validation}}' ng-model='xElement.infoJSON." + c.name + "' ";
                                        if (c.lookupFields == undefined) {
                                            c.lookupFields = ''
                                        }
                                        vhtmlEdit += "ng-change=\"select(xElement.infoJSON." + c.name + ",'" + c.lookup + "');completeLookupField('xElement',x_o.lookups." + c.lookup + ".name,'" + c.lookupFields + "');\" >";
                                        vhtmlEdit += "<OPTION ng-repeat='item in x_o.lookups." + c.lookup + ".tree1' value='{{item.ID}}' ng-selected='item.sel' > ";
                                        vhtmlEdit += "{{spacesListTree(item.level)}} {{item.name}} </OPTION> ";
                                    }
                                    if (c.source === "model") {
                                        vhtmlEdit += "<select id='" + x_o.forms[f].name + c.name + "' " + vhide + " class='form-control {{x_o.forms[x_form].pages[x_page].fields[" + c.name + "].validation}}' ng-model='xElement.infoJSON." + c.name + "' ";
                                        vhtmlEdit += " ng-options='" + c.modelPath + "' >";
                                    }
                                    if (c.source === "specific") {
                                        vhtmlEdit += "<select id='" + x_o.forms[f].name + c.name + "' " + vhide + " class='form-control {{x_o.forms[x_form].pages[x_page].fields[" + c.name + "].validation}}' ng-model='xElement.infoJSON." + c.name + "' >";
                                    }
                                    if (c.specific !== undefined) {
                                        result = c.specific.match(/\w+/g);
                                        for (x in result) {
                                            if (result[x] === "_") {
                                                vhtmlEdit += "<option value = '' > -- none --</option>";
                                            } else {
                                                var xx = result[x].split(":");
                                                if(xx.length>1){
                                                    vhtmlEdit += "<option value = '" + xx[0] + "' >" + xx[1] + "</option>"; 
                                                }else{
                                                    vhtmlEdit += "<option value = '" + result[x] + "' >" + result[x] + "</option>";
                                                }
                                            }
                                        }
                                    }
                                    vhtmlEdit += "</select>";
                                    break;
                            }
                        }
                        if (c.fieldType === "date" || c.fieldType === "local") { 
                            if (!vFieldsDate.includes(c.name)) {
                                vFieldsDate += c.name + ",";
                            }
                        }
                        if (c.fieldType === "checkBox") {
                            if (!vFieldsCheckbox.includes(c.name)) {
                                vFieldsCheckbox += c.name + ",";
                            }
                        }
                        if (c.fieldType === "map") {
                            if (!vFieldsMap.includes(c.name)) {
                                vFieldsMap += c.name + ",";
                            }
                        }
                        if (c.fieldType === "image") {
                            if (!vFieldsImage.includes(c.name)) {
                                vFieldsImage += c.name + ",";
                            }
                        }
                        if (c.fieldType === "lookup" && c.source === "table") {
                            if (!vFieldsLookup.includes(c.name)) {
                                vFieldsLookup += c.name + ",";
                            }
                            if (!vFieldsLookup2.includes(c.lookup)) {
                                // set up lookups
                                vFieldsLookup2 += c.lookup + ",";
                                x_o.lookups[c.lookup] = {};
                                x_o.lookups[c.lookup].name = c.lookup;
                                x_o.lookups[c.lookup].getParameters = c.lookup;
                                x_o.lookups[c.lookup].collection = [];
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
        x_o.forms[f].fieldsTotal = removeTrailingComma(vFieldsTotal);
        x_o.forms[f].fieldsAuto = removeTrailingComma(vFieldsAuto);
        x_o.forms[f].fieldsCheckbox = removeTrailingComma(vFieldsCheckbox);
        x_o.forms[f].fieldsMap = removeTrailingComma(vFieldsMap)
        x_o.forms[f].fieldsImage = removeTrailingComma(vFieldsImage)
        x_o.forms[f].fieldsLookup = removeTrailingComma(vFieldsLookup);
    }
    x_o.htmlSearch = vhtmlSearch;
    x_o.htmlList = vhtmlList;
    x_o.htmlEdit = vhtmlEdit;
    x_o.htmlView = vhtmlView;
    return x_o;
}
exports.start = start;