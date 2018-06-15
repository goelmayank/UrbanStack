const functions = require('firebase-functions');
let apiKey = 'AIzaSyD_sAu7TZJWzrmMi1SygxEG3Smdp3Ihb0A';

var gMapsClient = require('@google/maps').createClient({
    key: apiKey
});
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

/*
Expects origin, destination and passengerKey from user
Gets the geo json data using google directions api
Should call hyperledger fabric rest server createTrip endpoint with following data:
o Route overallRoute
o TripLeg[] tentativeTripLegs
    -- > Passenger passenger
*/
exports.createTrip = functions.https.onRequest((req, res) => {
    try {
        var req_query = req.query;
        var request = {
            origin: req_query.origin,
            destination: req_query.destination,
            mode: "transit"
        };
        console.log('**********request req_query************\n', request)
        console.log('finding tripLeg...')
        gMapsClient.directions(request, function(err, r) {
            console.log("inside directions callback", err, r)
            if (err) {
                console.log("ERRRRRRRR", err);
                res.status(401).send(err.toString());
            } else {
                console.log("Response", r.json);
                // return res.status(200).json(r.json);
                var json = r.json;
                var overall_route = json.routes[0].legs[0];
                var steps = json.routes[0].legs[0].steps;
                console.log("origin", overall_route.origin || "incorrect path");
                console.log("destination", overall_route.destination || "incorrect path");
                console.log("start_time", overall_route.start_time || "incorrect path");
                console.log("end_time", overall_route.end_time || "incorrect path");
                console.log("duration", overall_route.duration || "incorrect path");
                console.log("distance", overall_route.distance || "incorrect path");
                console.log("travel_mode", overall_route.travel_mode || "incorrect path");
                var route = {
                    start_location: overall_route.start_location || "incorrect path",
                    end_location: overall_route.end_location || "incorrect path",
                    duration: overall_route.duration || "incorrect path",
                    distance: overall_route.distance || "incorrect path",
                    travel_mode: overall_route.travel_mode || "incorrect path",
                };
                console.log("** ** ** ** ** route ** ** ** ** ** ** \n ", route);
                var tripLegs = [];
                for (let i = 0; i < steps.length; i++) {
                    console.log("start_location", steps[i].origin || "incorrect path");
                    console.log("start_location", steps[i].destination || "incorrect path");
                    console.log("duration", steps[i].duration || "incorrect path");
                    console.log("distance", steps[i].distance || "incorrect path");
                    console.log("travel_mode", steps[i].travel_mode || "incorrect path");
                    var tripLeg = {
                        start_location: steps[i].start_location || "incorrect path",
                        end_location: steps[i].end_location || "incorrect path",
                        duration: steps[i].duration || "incorrect path",
                        distance: steps[i].distance || "incorrect path",
                        travel_mode: steps[i].travel_mode || "incorrect path",
                    };
                    console.log("** ** ** ** ** tripLeg ** ** ** ** ** ** \n ", tripLeg);
                    tripLegs.push(tripLeg);
                }
                console.log("** ** ** ** ** tripLegs ** ** ** ** ** ** \n ", tripLegs);
                var createTripJson = {
                    overallRoute: route,
                    tentativeTripLegs: tripLegs,
                    passenger: 'org.urbanstack.Passenger#' + req_query.participantKey
                }

                console.log("** ** ** ** ** createTripJson ** ** ** ** ** ** \n ", createTripJson);
                return res.status(200).json(createTripJson);
            }
        });
    } catch (e) {
        console.log(e);
        res.status(401).send({
            error: 'Server error occured. Retry after some time'
        });
    }
});