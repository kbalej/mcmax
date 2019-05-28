var operations = [{'ID': '264C3A6B-CBBE-4C64-8968-FA4859CBB895','infoJSON':{"airportsID":"6A119A64-3085-4A87-B637-95C2C60C1D5F","airportsName":"KSFO","flightNumber":"111","date":"2019-05-24T08:00:00.000Z","time":"16:40","direction":"outbound","path":"KSEA 47.45020 -122.31200 0 0::\nBTG 45.74780 -122.59200 102 102::\nDREWS 42.72910 -122.89000 181 284::\nOED 42.47960 -122.91300 15 299::\nLIPWO 42.23020 -122.88700 15 314::\nTALEM 42.14710 -122.87800 5 319::\nZUNAS 41.85950 -122.84800 17 337::\nHOMEG 41.33580 -122.85100 31 368::\nHUPTU 39.50000 -122.74400 110 478::\nSTIKM 38.53330 -122.65000 58 537::\nKSFO 37.61850 -122.37500 56 593","apath":[],"locationCapture":"landed","waypoint":"KSEA"}}];
var airports = [{'ID': '6A119A64-3085-4A87-B637-95C2C60C1D5F', 'infoJSON':{"name":"KSFO","description":"San Francisco International Airport","locationLongitude":"-122.378955","locationLatitude":"37.621313","locationZoom":"5","locationCapture":"San Francisco International Airport","locationWidth":"auto","locationComment":"KSFO(San Francisco International Airport) is the largest airport in Northern California and the second busiest in California, after Los Angeles International Airport.It is 13 miles(21 km) south of downtown San Francisco, California, United States, near Millbrae and San Bruno in unincorporated San Mateo County.It has flights to points throughout North America and is a major gateway to Europe and Asia.","toAirport":"KSEA 47.45020 -122.31200 0 0::\nBTG 45.74780 -122.59200 102 102::\nDREWS 42.72910 -122.89000 181 284::\nOED 42.47960 -122.91300 15 299::\nLIPWO 42.23020 -122.88700 15 314::\nTALEM 42.14710 -122.87800 5 319::\nZUNAS 41.85950 -122.84800 17 337::\nHOMEG 41.33580 -122.85100 31 368::\nHUPTU 39.50000 -122.74400 110 478::\nSTIKM 38.53330 -122.65000 58 537::\nKSFO 37.61850 -122.37500 56 593","fromAirport":"KSFO 37.61850 -122.37500 0 0::STIKM 38.53330 -122.65000 56 56::HUPTU 39.50000 -122.74400 58 114::HOMEG 41.33580 -122.85100 110 225::ZUNAS 41.85950 -122.84800 31 256::TALEM 42.14710 -122.87800 17 273::LIPWO 42.23020 -122.88700 5 278::OED 42.47960 -122.91300 15 293::DREWS 42.72910 -122.89000 15 308::BTG 45.74780 -122.59200 181 490::KSEA 47.45020 -122.31200 102 593"}}];
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
    if(operations.length < 1 || airports.length < 1){
        return;
    }
    console.log("flightscheduler");
    var current = new Date();
    for (var iop in operations) {
        var h  = operations[iop].infoJSON.path.replace(/::/gi, " ").replace(/\\n/gi, ""); // :: at end of each waypoint except last, remove \n 
        operations[iop].infoJSON.path = h;
        var vta = h; 
        var vtaa = vta.split(" ");
        var v = [];
        for (var i = 0; i < vtaa.length; i=i+5){
            var o = {};
            o.name = vtaa[i];
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
                console.log("landed at " + operations[iop].infoJSON.apath[operations[iop].infoJSON.apath.length - 1].name);
                var airport = airports.filter(function (e) { return e.ID == operations[iop].infoJSON.airportsID; });
                if (operations[iop].infoJSON.direction == "outbound") {
                    operations[iop].infoJSON.path = airport[0].infoJSON.fromAirport;
                    operations[iop].infoJSON.direction = "inbound";
                } else {
                    operations[iop].infoJSON.path = airport[0].infoJSON.toAirport;
                    operations[iop].infoJSON.direction = "outbound";
                }
                h = operations[iop].infoJSON.path.replace(/::/gi, " ").replace(/\\n/gi, "");
                operations[iop].infoJSON.path = h;
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
                        operations[iop].infoJSON.locationCapture = "in flight towards " + operations[iop].infoJSON.apath[i].name + " / "  + operations[iop].infoJSON.apath[operations[iop].infoJSON.apath.length - 1].name;
                        operations[iop].infoJSON.waypoint = "in flight towards " + operations[iop].infoJSON.apath[operations[iop].infoJSON.apath.length - 1].name;
                        console.log(operations[iop].infoJSON.locationCapture);
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