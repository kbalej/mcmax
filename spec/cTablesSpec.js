'use strict';
var cTables = require('../src/cTables');
describe('cTables tests:',function(){
    // IN diagrams for module modulesID: [ { ID, parentID, infoJSON{table, tablesID,tablesName} }... ]
    var xD = [
        {'ID':'1','parentID':'','infoJSON':{'table':'taa','tablesID':'','tablesName':''}},
        {'ID':'2','parentID':'1','infoJSON':{'table':'tbb','tablesID':'','tablesName':''}} 
    ];
    // OUT {<table name>:{ oldID, newID, parentID }... }
    var xR = {};
    // parentID = ''
    // if tablesID in infoJSON
    //       old ID = xD[x].infoJSON.tablesID
    //       new ID = ''
    //       name = xD[x].infoJSON.tablesName
    // if no tablesID in infoJSON
    //       new ID = xD[x].ID
    //       old ID = ''
    //       name = xD[x].infoJSON.table
    // if not table exists in xR
    //       add to xR
    // has parent in xD
    //       get ID of parent table
    //           if ID not included in xR[name].parentID
    //                add to xR[name].parentID
    // 
    var tt = []; // display tables to be created
    for(var x in xD){
        var parentID = '';
        var oldID = '';
        var newID = '';
        var name = '';
        if(xD[x].infoJSON.tablesID !== undefined && xD[x].infoJSON.tablesID !== ''){
            oldID = xD[x].infoJSON.tablesID;
            name = xD[x].infoJSON.tablesName;
        }else{
            newID = xD[x].ID;
            name = xD[x].infoJSON.table;
        }
        if(xR[name] == undefined){
            var h={};
            h.oldID = oldID;
            h.newID = newID;
            h.parentID = parentID;
            xR[name]=h;
            tt.push(name);
        }
        if(xD[x].parentID !== undefined && xD[x].parentID !== ''){
            var id;
            // filter into tXD
            var txD = xD.filter(function (e) {return e.ID == xD[x].parentID});
            if(txD[0].infoJSON.tablesID !== undefined && txD[0].infoJSON.tablesID !== ''){
                id = txD[0].infoJSON.tablesID;
            }else{
                // check if parent in xR
                // if
                //      id = oldID or newID
                // if not
                //      add parent to xR, newID = xD[x].ID
                //      id = take xD[x].ID
                var tname = txD[0].infoJSON.table;
                if(xR[tname] == undefined){
                    var h={};
                    h.oldID = "";
                    h.newID = txD[0].ID;
                    h.parentID = "";
                    xR[tname]=h;
                    tt.push(tname);
                    id=txD[0].ID;
                }else{
                    if(xR[tname].oldID == ""){
                        id=xR[tname].newID;
                    }else{
                        id=xR[tname].oldID;
                    }
                }
            }
            var n;
            if(xR[name].oldID == ''){
                n=xR[name].newID;
            }else{
                n=xR[name].oldID;
            }
            if(!xR[name].parentID.includes(n)){
                xR[name].parentID += n;
            }
        }
    }
    tt.sort();
    if (tt.length > 0 && confirm(tt + ": CREATE NEW DB TABLES")) {
        // tables with no old ID are created
        // modulesID = param, used us masterID 
        // all tables are inserted / updated in KB_tables
        //     with final dummy to rebuild sequenence in database
    }

    it('table should be created', function(){
        var a;
        expect(a).toBe(true);
    })
    it('table should not be created', function(){
        var a;
        expect(a).toBe(true);
    })
    it('table should be inserted', function(){
        var a;
        expect(a).toBe(true);
    })
    it('table should be updated', function(){
        var a;
        expect(a).toBe(true);
    })
    it('table should have no parent', function(){
        var a;
        expect(a).toBe(true);
    })
    it('table should have 1 parent', function(){
        var a;
        expect(a).toBe(true);
    })
    it('table should have 2 parents', function(){
        var a;
        expect(a).toBe(true);
    })
    it('final result array', function(){
        var a;
        expect(a).toBe(true);
    })
});