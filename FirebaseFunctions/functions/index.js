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
                var json = r.json;
                console.log("Response", r.json);
                // return res.status(200).json(r.json);
                var overall_route_path = json.routes[0].legs[0];
                var start_location = overall_route_path.start_location;
                var end_location = overall_route_path.end_location;
                var duration = parseFloat(overall_route_path.duration) || 0.0;
                var distance = parseFloat(overall_route_path.distance) || 0.0;
                var overallRoute = JSON.stringify({
                    "$class": "org.urbanstack.Route",
                    "start_location": start_location,
                    "end_location": end_location,
                    "duration": duration,
                    "distance": distance,
                    "status": "CREATED"
                });
                console.log("** ** ** ** ** overallRoute ** ** ** ** ** ** \n ", overallRoute);
                var tentativeTripLegs = [];
                var steps = json.routes[0].legs[0].steps;
                for (let i = 0; i < steps.length; i++) {
                    var tripLeg_start_location = steps[i].start_location;
                    console.log("tripLeg_start_location", tripLeg_start_location);
                    var tripLeg_end_location = steps[i].end_location;
                    console.log("tripLeg_end_location", tripLeg_end_location);
                    var tripLeg_duration = parseFloat(steps[i].duration) || 0.0;
                    console.log("tripLeg_duration", tripLeg_duration);
                    var tripLeg_distance = parseFloat(steps[i].distance) || 0.0;
                    console.log("tripLeg_distance", tripLeg_distance);
                    var tripLeg_travel_mode = steps[i].travel_mode || "Bus";
                    console.log("tripLeg_travel_mode", tripLeg_travel_mode);
                    var transitProvider = 'org.urbanstack.TransitProvider#' + (steps[i].transit_details.line.agencies[0].name || 'DIMTS');
                    console.log("transitProvider", transitProvider);
                    var fare = 10.0;
                    console.log("fare", fare);
                    // var fare = Math.trunc(distance * farePerKm)
                    var tripLeg = JSON.stringify({
                        "$class": "org.urbanstack.TripLeg",
                        "tripLegId": 1,
                        "route": {
                            "$class": "org.urbanstack.Route",
                            "start_location": tripLeg_start_location,
                            "end_location": tripLeg_end_location,
                            "duration": tripLeg_duration,
                            "distance": tripLeg_distance,
                            "status": "CREATED",
                            "fare": fare
                        },
                        "transitMode": tripLeg_travel_mode,
                        "transitProvider": transitProvider
                    });
                    console.log("** ** ** ** ** tripLeg ** ** ** ** ** ** \n ", tripLeg);
                    tentativeTripLegs.push(tripLeg);
                }
                console.log("** ** ** ** ** tripLegs ** ** ** ** ** ** \n ", tentativeTripLegs);
                var createTripJson = JSON.stringify({
                    "$class": "org.urbanstack.CreateTrip",
                    "overallRoute": overallRoute,
                    "tentativeTripLegs": tentativeTripLegs,
                    "passenger": 'org.urbanstack.Passenger#' + req_query.participantKey
                });

                console.log("** ** ** ** ** createTripJson ** ** ** ** ** ** \n ", createTripJson);
                // return res.status(200).json(createTripJson);
                var options = {
                    method: 'POST',
                    uri: base_url + '.CreateTrip',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: createTripJson
                };

                rp(options).then(function(response) {
                        console.log("** ** ** ** ** Succesfully created Trip ** ** ** ** ** ** \n ", response);
                        res.status(200).json(response);
                    })
                    .catch(function(err) {
                        // API call failed...
                        res.status(401).send(err.toString());

                    });

            }
        });
    } catch (e) {
        console.log(e);
        res.status(401).send(e.toString());
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
            method: 'POST',
            uri: base_url + '.Passenger',
            headers: {
                'Content-Type': 'application/json'
            },
            body: passengerJson
        };

        rp(options).then(function(response) {
                console.log("** ** ** ** ** response ** ** ** ** ** ** \n ", response);
                res.status(200).json(response);
            })
            .catch(function(err) {
                // API call failed...
                res.status(401).send(err.toString());

            });

    } catch (e) {
        console.log(e);
        res.status(401).send({
            error: e.toString()
        });
    }
});

exports.createTransitProvider = functions.https.onRequest((req, res) => {
    try {
        var req_query = req.query;
        var balance = parseFloat(req_query.balance);
        var fName = req_query.fName;
        var lname = req_query.lname;
        var email = req_query.email;
        var transitMode = req_query.transitMode;
        var paymentPreference = req_query.paymentPreference;
        console.log('**********request query************\n', req_query);

        var TransitProviderJson = JSON.stringify({
            "$class": "org.urbanstack.TransitProvider",
            "balance": balance,
            "participantKey": fName,
            "contact": {
                "$class": "org.urbanstack.Contact",
                "fName": fName,
                "lname": lname,
                "email": email
            },
            "transitMode": transitMode,
            "paymentPreference": paymentPreference
        });

        console.log("** ** ** ** ** TransitProviderJson ** ** ** ** ** ** \n ", TransitProviderJson);
        // return res.status(200).json(TransitProviderJson);
        var options = {
            method: 'POST',
            uri: base_url + '.TransitProvider',
            headers: {
                'Content-Type': 'application/json'
            },
            body: TransitProviderJson
        };

        rp(options).then(function(response) {
                res.status(200).json(response);
            })
            .catch(function(err) {
                // API call failed...
                res.status(401).send('Server error occured in response promise block. Retry after some time');

            });

    } catch (e) {
        console.log(e);
        res.status(401).send(
            'Server error occured. Retry after some time'
        );
    }
});