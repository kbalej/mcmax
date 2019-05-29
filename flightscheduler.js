var operations = [];
var airports = [];
function start(io,tname,tvalue) {
    if(tname!== undefined){
        if(tname == "airports"){
            airports = tvalue;
            return;
        }
        if(tname == "operations"){
            operations = tvalue;
            return;
        }
    }
    console.log("flightscheduler");
    if(operations.length < 1 || airports.length < 1){
        console.log("no airports or operations");
        return;
    }
    var current = new Date();
    for (var iop in operations) {
        var airport = airports.filter(function (e) { return e.ID == operations[iop].infoJSON.airportsID; });
        if (operations[iop].infoJSON.direction == "outbound") {
            operations[iop].infoJSON.path = airport[0].infoJSON.toAirport;
        } else {
            operations[iop].infoJSON.path = airport[0].infoJSON.fromAirport;
        }
        var h = operations[iop].infoJSON.path.replace(/::/gi, " ").replace(/\\n/gi, "");
        var vtaa = h.split(" ");
        var v = [];
        for (var i = 0; i < vtaa.length; i=i+5){
            var o = {};
            o.name = "" + vtaa[i];
            o.lat = 1 * vtaa[i+1];
            o.lng = 1 * vtaa[i+2];
            o.miles = 1 * vtaa[i+3];
            o.totMiles = 1 * vtaa[i+4];
            v.push(o);
        }
        operations[iop].infoJSON.apath = v;
        var departure = new Date(operations[iop].infoJSON.date.substring(0, 10) + "T" + operations[iop].infoJSON.time);
        if (departure < current) {
            var minutes = Math.abs((current.getTime() - departure.getTime()) / 1000 / 60);
            var miles = minutes * 500 / 60; // assumed speed per minute
            if(operations[iop].infoJSON.waiting == undefined){operations[iop].infoJSON.waiting = "";}
            if(miles >= operations[iop].infoJSON.apath[operations[iop].infoJSON.apath.length - 1].totMiles && operations[iop].infoJSON.waiting !== "yes") { // >= total flight miles 
                var newDeparture = current;
                newDeparture = new Date(newDeparture.setHours(newDeparture.getHours() + 3)); // date + time
                operations[iop].infoJSON.date = newDeparture.toISOString().substring(0, 10); // date as yyyy-mm-dd
                operations[iop].infoJSON.time = newDeparture.toISOString().substring(11,16); // time
                operations[iop].infoJSON.waypoint = operations[iop].infoJSON.apath[operations[iop].infoJSON.apath.length - 1].name;
                operations[iop].infoJSON.locationLatitude = operations[iop].infoJSON.apath[operations[iop].infoJSON.apath.length - 1].lat;
                operations[iop].infoJSON.locationLongitude = operations[iop].infoJSON.apath[operations[iop].infoJSON.apath.length - 1].lng;
                operations[iop].infoJSON.locationCapture = "landed";
                console.log(operations[iop].infoJSON.flightNumber + " landed at " + operations[iop].infoJSON.apath[operations[iop].infoJSON.apath.length - 1].name);
                if (operations[iop].infoJSON.direction == "outbound") {
                    operations[iop].infoJSON.path = airport[0].infoJSON.fromAirport;
                    operations[iop].infoJSON.direction = "inbound";
                } else {
                    operations[iop].infoJSON.path = airport[0].infoJSON.toAirport;
                    operations[iop].infoJSON.direction = "outbound";
                }
                operations[iop].infoJSON.path = operations[iop].infoJSON.path.replace(/::/gi, " ").replace(/\\n/gi, "");
                operations[iop].infoJSON.apath = null;
                operations[iop].infoJSON.waiting = "yes";
                io.emit("flightschedular",JSON.stringify(operations[iop]));
            } else {
                operations[iop].infoJSON.waiting = "";
                for (var i = 0; i < operations[iop].infoJSON.apath.length; i++)
                {
                    if(miles < operations[iop].infoJSON.apath[i].totMiles){ // autoskip i = 0, 0 for totMiles
                        var percentage = 1 - (operations[iop].infoJSON.apath[i].totMiles - miles) / operations[iop].infoJSON.apath[i].miles;
                        operations[iop].infoJSON.locationLatitude = operations[iop].infoJSON.apath[i].lat + (operations[iop].infoJSON.apath[i].lat - operations[iop].infoJSON.apath[i-1].lat) * percentage; 
                        operations[iop].infoJSON.locationLongitude = operations[iop].infoJSON.apath[i].lng + (operations[iop].infoJSON.apath[i].lng - operations[iop].infoJSON.apath[i-1].lng) * percentage;
                        operations[iop].infoJSON.locationCapture = ("in flight towards " + operations[iop].infoJSON.apath[i].name + " "  + operations[iop].infoJSON.apath[operations[iop].infoJSON.apath.length - 1].name);
                        operations[iop].infoJSON.locationCapture = operations[iop].infoJSON.locationCapture.replace(/\\n/gi, "");
                        operations[iop].infoJSON.waypoint = ("in flight towards " + operations[iop].infoJSON.apath[operations[iop].infoJSON.apath.length - 1].name);
                        operations[iop].infoJSON.waypoint = operations[iop].infoJSON.waypoint.replace(/\\n/gi, "");
                        console.log(operations[iop].infoJSON.flightNumber + " " + operations[iop].infoJSON.locationCapture);
                        operations[iop].infoJSON.apath = null;
                        io.emit("flightschedular",JSON.stringify(operations[iop]));
                        break;
                    }
                }
            }
        }
    }
};
exports.start = start;