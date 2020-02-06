const http = require("http");
const polyline = require("@mapbox/polyline");
const fetch = require("node-fetch");

const hostname = "127.0.0.1";
const port = 3000;

fetch(
    "http://localhost:8080/otp/routers/default/plan?fromPlace=25.863771,-80.331855&toPlace=25.79594,-80.25834&time=3:54pm&date=1-31-2020&mode=TRANSIT,WALK&maxWalkDistance=500&arriveBy=false"
)
    .then(res => res.json())
    .then(body => jsonParsing(body.plan, body.plan.itineraries[0].legs))
    .catch(err => console.log(err));

//returns the polyline for all steps in an itinerary
function getPolyline(jsonLegData) {
    var polylineArray = [jsonLegData[0].legGeometry.points];
    for (i = 1; i < jsonLegData.length; i++) {
        polylineArray = polylineArray.concat([
            jsonLegData[i].legGeometry.points
        ]);
    }
    return polylineArray;
}

//Function that will parse the api call and return the important stuff
function jsonParsing(jsonData, jsonLegData) {
    let polylines = getPolyline(jsonLegData);   
    console.log(polylines);
    let routeDuration = jsonData.itineraries[0].duration;
    console.log("Route Duration: " + routeDuration/60 + " minutes.");
    //console.log(jsonData.itineraries[0]);
    //console.log(jsonLegData[0].legGeometry.points);
}

function decodeGeometry(encoded) {
    //returns an array of long and lat each element corresponding to a point
    let decoded = polyline.decode(encoded);
    return decoded;
}

let decodedArray = decodeGeometry("coz|CbyhiN@z@JR~AvAnApA`@`@aAvA]f@II");

//let coordinates = decoded[0];
for (i = 0; i < decodedArray.length; i++) {
    console.log(decodedArray[i]);
}

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end(coordinates);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
