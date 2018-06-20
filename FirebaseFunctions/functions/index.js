const functions = require('firebase-functions');
let apiKey = 'AIzaSyD_sAu7TZJWzrmMi1SygxEG3Smdp3Ihb0A';

var gMapsClient = require('@google/maps').createClient({
    key: apiKey
});
var rp = require('request-promise');
var base_url = 'http://13.126.30.199:3000/api/org.urbanstack';

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
        console.log('**********request query************\n', request)
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

                var route = {
                    start_location: overall_route.start_location || "incorrect path",
                    end_location: overall_route.end_location || "incorrect path",
                    duration: parseFloat(overall_route.duration) || "incorrect path",
                    distance: parseFloat(overall_route.distance) || "incorrect path",
                    travel_mode: overall_route.travel_mode || "incorrect path",
                };
                console.log("** ** ** ** ** route ** ** ** ** ** ** \n ", route);
                var tripLegs = [];
                for (let i = 0; i < steps.length; i++) {
                    var tripLeg = {
                        start_location: steps[i].start_location || "incorrect path",
                        end_location: steps[i].end_location || "incorrect path",
                        duration: parseFloat(steps[i].duration) || "incorrect path",
                        distance: parseFloat(steps[i].distance) || "incorrect path",
                        travel_mode: steps[i].travel_mode || "incorrect path",
                    };
                    console.log("** ** ** ** ** tripLeg ** ** ** ** ** ** \n ", tripLeg);
                    tripLegs.push(tripLeg);
                }
                console.log("** ** ** ** ** tripLegs ** ** ** ** ** ** \n ", tripLegs);
                var createTripJson = JSON.stringify({
                    "$class": "org.urbanstack.CreateTrip",
                    overallRoute: route,
                    tentativeTripLegs: tripLegs,
                    passenger: 'org.urbanstack.Passenger#' + req_query.participantKey
                });

                console.log("** ** ** ** ** createTripJson ** ** ** ** ** ** \n ", createTripJson);
                // return res.status(200).json(createTripJson);
                var options = {
                    uri: base_url + '.CreateTrip',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: createTripJson,
                    json: true,
                    method: 'POST',
                    encoding: null,
                    resolveWithFullResponse: true,
                    rejectUnauthorized: false
                };

                rp(options).then(function(response) {
                        res.status(200).json(response.body);
                    })
                    .catch(function(err) {
                        // API call failed...
                        res.status(401).send({ error: 'Server error occured in response promise block. Retry after some time' });

                    });

            }
        });
    } catch (e) {
        console.log(e);
        res.status(401).send({
            error: 'Server error occured. Retry after some time'
        });
    }
});

exports.createPassenger = functions.https.onRequest((req, res) => {
    try {
        var req_query = req.query;
        var balance = parseFloat(req_query.balance);
        var fName = req_query.fName;
        var lname = req_query.lname;
        var email = req_query.email;
        console.log('**********request query************\n', req_query);

        var passengerJson = JSON.stringify({
            "$class": "org.urbanstack.Passenger",
            "balance": balance,
            "participantKey": fName,
            "contact": {
                "$class": "org.urbanstack.Contact",
                "fName": fName,
                "lname": lname,
                "email": email
            }
        });

        console.log("** ** ** ** ** passengerJson ** ** ** ** ** ** \n ", passengerJson);
        // return res.status(200).json(passengerJson);
        var options = {
            uri: base_url + '.Passenger',
            headers: {
                'Content-Type': 'application/json'
            },
            body: passengerJson,
            json: true,
            method: 'POST',
            encoding: null,
            resolveWithFullResponse: true,
            rejectUnauthorized: false
        };

        rp(options).then(function(response) {
                res.status(200).json(response.body);
            })
            .catch(function(err) {
                // API call failed...
                res.status(401).send({
                    error: 'Server error occured in response promise block. Retry after some time'
                });

            });

    } catch (e) {
        console.log(e);
        res.status(401).send({
            error: 'Server error occured. Retry after some time'
        });
    }
});

// exports.createTransitProvider = functions.https.onRequest((req, res) => {
//     try {
//         var req_query = req.query;
//         var balance = parseFloat(req_query.balance);
//         var fName = req_query.fName;
//         var lname = req_query.lname;
//         var email = req_query.email;
//         var transitMode = req_query.transitMode;
//         var paymentPreference = req_query.paymentPreference;
//         console.log('**********request query************\n', req_query);

//         var passengerJson = JSON.stringify({
//             "$class": "org.urbanstack.TransitProvider",
//             "balance": balance,
//             "participantKey": fName,
//             "contact": {
//                 "$class": "org.urbanstack.Contact",
//                 "fName": fName,
//                 "lname": lname,
//                 "email": email
//             },
//             "TransitMode": transitMode,
//             "PaymentPreference": paymentPreference
//         });

//         console.log("** ** ** ** ** TransitProviderJson ** ** ** ** ** ** \n ", TransitProviderJson);
//         // return res.status(200).json(TransitProviderJson);
//         var options = {
//             uri: base_url + '.TransitProvider',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: TransitProviderJson,
//             json: true,
//             method: 'GET',
//             encoding: null,
//             resolveWithFullResponse: true,
//             rejectUnauthorized: false
//         };

//         rp(options).then(function(response) {
//                  res.status(200).json(response.body);
//             })
//             .catch(function(err) {
//                 // API call failed...
//                 res.status(401).send({
//                     error: 'Server error occured in response promise block. Retry after some time'
//                 });

//             });

//     } catch (e) {
//         console.log(e);
//         res.status(401).send({
//             error: 'Server error occured. Retry after some time'
//         });
//     }
// });