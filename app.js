const polyline = require("@mapbox/polyline");
const fetch = require("node-fetch");
const express = require("express");
const app = express();

const hostname = "127.0.0.1";
const port = 3000;
const otpHost = 'localhost:8080';

let time = [];
let legInfo = [];

//Body Parser middleware
app.use(express.json());

//Post request that will handle returning the json of route info
app.post('/', (req, res) => {
    console.log(req.body);
    let url = urlCreator(req.body)
    console.log(url);
   fetch(url).then( async (response) => {
       let body = await response.json();
    res.send(jsonParsing(body.plan, body.plan.itineraries[0].legs));
   });
});

//This fetch would be a seperate function called from the urlCreator with the created url
// fetch(
//     "http://localhost:8080/otp/routers/default/plan?fromPlace=25.863925,-80.331163&toPlace=25.773868,-80.336200&time=6:54pm&date=2-12-2020&mode=TRANSIT,WALK&maxWalkDistance=500&arriveBy=false"
// )
//     .then(res => res.json())
//     .then(body => jsonParsing(body.plan, body.plan.itineraries[0].legs))
//     .catch(err => console.log(err));


//Function to create the URL to make the call to the OTP API
function urlCreator(reqBody) {
    fromPlace = reqBody.fromPlace;
    toPlace = reqBody.toPlace;
    startTime = reqBody.startTime;
    startDate = reqBody.startDate;
    return url = 'http://' + otpHost + '/otp/routers/default/plan?fromPlace=' + fromPlace + '&toPlace=' + toPlace + '&time=' + startTime + '&date=' + startDate + '&mode=TRANSIT,WALK&maxWalkDistance=500&arriveBy=false';
}

//Function that will parse the api call and return the important stuff
function jsonParsing(jsonData, jsonLegData) {
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
            legPolyline : decodeGeometry(jsonLegData[j].legGeometry.points)});
    }
    return {time, legInfo};
}

function decodeGeometry(encoded) {
    //returns an array of long and lat each element corresponding to a point
    let decoded = polyline.decode(encoded);
    return decoded;
}

app.listen(port, () => console.log(`App listening on port ${port}!`))
