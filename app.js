const http = require("http");
const polyline = require("@mapbox/polyline");
const fetch = require("node-fetch");
const express = require("express");

const hostname = "127.0.0.1";
const port = 3000;

let time = [];
let legInfo = [];

/*
/ fromPlace
/ toPlace
/ time
/ date
/ mode
/ maxWalkDistance
/ arriveBy
*/
fetch(
    "http://localhost:8080/otp/routers/default/plan?fromPlace=25.863925,-80.331163&toPlace=25.773868,-80.336200&time=6:54pm&date=2-12-2020&mode=TRANSIT,WALK&maxWalkDistance=500&arriveBy=false"
)
    .then(res => res.json())
    .then(body => jsonParsing(body.plan, body.plan.itineraries[0].legs))
    .catch(err => console.log(err));

//Function that will parse the api call and return the important stuff
function jsonParsing(jsonData, jsonLegData) {
    console.log(jsonData.to.lat);
    time.push({
        walkingTime : jsonData.itineraries[0].walkTime,
        transitTime : jsonData.itineraries[0].transitTime,
        waitingTime : jsonData.itineraries[0].waitingTime,
        start : jsonData.itineraries[0].startTime,
        end : jsonData.itineraries[0].endTime,
        transfers : jsonData.itineraries[0].transfers,
    });
    for (j=0; j < jsonLegData.length; j++) {
        legInfo.push({ currentLeg:j + 1,
            transitMode:jsonLegData[j].mode, 
            legDuration : (jsonLegData[j].endTime - jsonLegData[j].startTime) / 1000,
            departurePlace : jsonLegData[j].from.name,
            departureTime : jsonLegData[j].from.departure,
            arrivalPlace : jsonLegData[j].to.name,
            arrivalTime : jsonLegData[j].to.arrival,
            legPolyline : jsonLegData[j].legGeometry.points});
    }
    console.log(time);
    console.log(legInfo);
}

function decodeGeometry(encoded) {
    //returns an array of long and lat each element corresponding to a point
    let decoded = polyline.decode(encoded);
    return decoded;
}

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end(coordinates);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
