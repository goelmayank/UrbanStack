let apiKey = 'AIzaSyAaXO23aeFwBmXlSRweQhCdEUYoAW1OPYk';

var gMapsClient = require('@google/maps').createClient({
    key: apiKey
});
/**********
 *
 *
 * @function getTripLeg
 *
 * @params
 * latlng1 		// latlng object of place 1
 * latlng2 		// latlng object of place 2
 * mode			// mode of travel
 * dept 		// departure time in seconds ( no decimals !important)
 * callback 	// @params : origin<string> destination<string> start_time<double>
  end_time<double> duration<string>, distance<string> travel_mode<string> fare<double>
 ***********/

exports.getTripLeg = function({ origin, destination }, callback) {
    var request = {
        origin: origin,
        destination: destination,
        mode: "transit"
    };

    return gMapsClient.directions(request, function(err, response) {
        console.log("inside directions callback", err, response)
        if (err) {
            console.log("ERRRRRRRR", err);
            throw err;
        }
        // console.log(response)
        if (response.status == 200 && response.json.status == "OK") {
            console.log(response.json);
            return callback2(response.json);
        }
    })

    function callback2(r) {
        console.log('++++++ trip fare callback2 ++++', r)
        if (r) {
            var origin = r.routes[0].legs[0].steps[0].origin || "default";
            var destination = r.routes[0].legs[0].steps[0].destination || "default";
            var start_time = r.routes[0].legs[0].steps[0].start_time || "default";
            var end_time = r.routes[0].legs[0].steps[0].end_time || "default";
            var duration = r.routes[0].legs[0].steps[0].duration || "default";
            var distance = r.routes[0].legs[0].steps[0].distance || "default";
            var travel_mode = r.routes[0].legs[0].steps[0].travel_mode || "default";
            var fare = r.routes[0].legs[0].steps[0].fare || "default";
            console.log(fare)
            return callback(origin, destination, start_time, end_time, duration, distance, travel_mode, fare)
        }
    }
}