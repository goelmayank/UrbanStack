const functions = require('firebase-functions');
let apiKey = 'AIzaSyD_sAu7TZJWzrmMi1SygxEG3Smdp3Ihb0A';

var gMapsClient = require('@google/maps').createClient({
    key: apiKey
});
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

/*
Expects origin and destination from user
Gets the geo json data using google directions api
Should call hyperledger fabric rest server createTrip endpoint with following data:
o Route overallRoute
o TripLeg[] tentativeTripLegs
    -- > Passenger passenger
*/
exports.createTrip = functions.https.onRequest((req, res) => {
    try {
        var data = req.query;
        var request = {
            origin: data.origin,
            destination: data.destination,
            mode: "transit"
        };
        console.log('**********request data************\n', request)
        console.log('finding tripLeg...')
        gMapsClient.directions(request, function(err, response) {
            console.log("inside directions callback", err, response)
            if (err) {
                console.log("ERRRRRRRR", err);
                res.status(401).send(err.toString());
            } else {
                console.log("Response", response);

                var tripLeg = {
                    origin: r.routes[0].legs[0].steps[0].origin || "incorrect path",
                    destination: r.routes[0].legs[0].steps[0].destination || "incorrect path",
                    start_time: r.routes[0].legs[0].steps[0].start_time || "incorrect path",
                    end_time: r.routes[0].legs[0].steps[0].end_time || "incorrect path",
                    duration: r.routes[0].legs[0].steps[0].duration || "incorrect path",
                    distance: r.routes[0].legs[0].steps[0].distance || "incorrect path",
                    travel_mode: r.routes[0].legs[0].steps[0].travel_mode || "incorrect path",
                    fare: r.routes[0].legs[0].steps[0].fare || "incorrect path"
                };
                console.log("** ** ** ** ** tripLeg ** ** ** ** ** ** \n ", tripLeg);
                return res.status(200).json(tripLeg);
            }
        });
    } catch (e) {
        console.log(e);
        res.status(401).send({
            error: 'Server error occured. Retry after some time'
        });
    }
});