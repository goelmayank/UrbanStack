'use strict';

/**
 * Create vPassenger Transaction
 * @param {org.urbanstack.CreateTrip} tripData
 * @transaction
 * Input:
 * TripLeg[] tentativeTripLegs
 * String passengerKey
 */
async function createTrip(tripData) {
    var factory = getFactory();
    var NS = 'org.urbanstack';

    var vPassengerId = parseInt(Math.random() * 100000000);
    var vPassenger = factory.newResource(NS, 'vPassenger', vPassengerId);

    vPassenger.vPassengerId = vPassengerId;
    vPassenger.passenger = tripData.passenger;

    tripData.tentativeTripLegs.forEach(route => {

        var tripLeg = factory.newResource(NS, 'TripLeg', tripLegId);
        tripLeg.TripLegStatus = "CREATED";
        tripLeg.transitProvider = tripData.transitProvider;

        var leg_route = factory.newConcept(NS, "Route");

        leg_route.transitMode = tripData.tentativeTripLegs.origin;
        leg_route.origin = tripData.tentativeTripLegs.origin;
        leg_route.destination = tripData.tentativeTripLegs.destination;
        leg_route.start_time = tripData.tentativeTripLegs.start_time;
        leg_route.end_time = tripData.tentativeTripLegs.end_time;
        leg_route.duration = tripData.tentativeTripLegs.duration;
        leg_route.distance = tripData.tentativeTripLegs.distance;
        leg_route.status = tripData.tentativeTripLegs.status;
        leg_route.fare = tripData.tentativeTripLegs.fare;
        leg_route.transitProvider = tripData.tentativeTripLegs.transitProvider;

        tripLeg.route = leg_route;

        vPassenger.tentativeTripLegs.push(tripLeg);
        transitProvider.tentativeTripLegs.push(tripLegId);


        //save the TripLeg
        const TripLeg = await getAssetRegistry('org.urbanstack.TripLeg');
        await TripLeg.add(tripData.tripLeg);
    });

    var route = factory.newConcept(NS, "Route");

    route.transitMode = tripData.overallRoute.origin;
    route.origin = tripData.overallRoute.origin;
    route.destination = tripData.overallRoute.destination;
    route.start_time = tripData.overallRoute.start_time;
    route.end_time = tripData.overallRoute.end_time;
    route.duration = tripData.overallRoute.duration;
    route.distance = tripData.overallRoute.distance;
    route.status = tripData.overallRoute.status;
    route.fare = tripData.overallRoute.fare;

    tripLeg.route = route;

    //save the vPassenger
    vPassenger.vPassengerRoute = "CREATED";
    const vPassenger = await getAssetRegistry('org.urbanstack.vPassenger');
    await vPassenger.update(tripData.vPassenger);

    // Emit the event TripCreated
    var event = factory.newEvent(NS, 'TripCreated');
    event.vPassengerId = vPassengerId;
    emit(event);
}

/**
 * Book vPassenger Transaction
 * @param {org.urbanstack.ConfirmTripLeg} tripData
 * @transaction
 * Input:
 * DateTime start_time
 * TripLeg tripLeg
 * String passengerKey
 */
async function ConfirmTripLeg(tripData) {
    /**
     * 1. Validate the start_time data
     * If the date is a past date then throw an error
     */
    var factory = getFactory();
    var NS = 'org.urbanstack';
    var tripLeg = tripData.tripLeg;
    var timeNow = new Date().getTime();
    var schedTime = new Date(tripData.start_time).getTime();
    if (schedTime < timeNow) {
        throw new Error("start_timed time cannot be in the past!!!");
    }

    //save the TripLeg
    tripLeg.TripLegStatus = "COFIRMED";
    const TripLeg = await getAssetRegistry('org.urbanstack.TripLeg');
    await TripLeg.update(tripLeg);

    var transitProvider = tripLeg.transitProvider;
    transitProvider.confirmedTripLegs.splice(transitProvider.confirmedTripLegs.indexOf(tripLeg.tripLegId), 1);
    transitProvider.confirmedTripLegs.push(tripLeg.tripLegId);

    //save Transit Provider
    const TransitProvider = await getParticipantRegistry('org.urbanstack.TransitProvider');
    await TransitProvider.update(transitProvider);

    tripData.vPassenger.currentTripLeg = tripLeg;
    //save the vPassenger
    const vPassenger = await getAssetRegistry('org.urbanstack.vPassenger');
    await vPassenger.update(tripData.vPassenger);

    // Successfully confirmed
    var event = factory.newEvent(NS, 'TripLegConfirmed');
    event.tripLeg = tripLeg.tripLegId;
    event.passengerKey = tripData.passengerKey;
    emit(event);

}

/**
 * Bus Scan Transaction
 * @param {org.urbanstack.BusScan} tripData
 * @transaction
 * 
 * Input
 * String MiD
 * Place currentLocation
 * -- > vPassenger vPassenger
 * -- > TransitProvider transitProvider
 * **/
async function BusScan(tripData) {
    var factory = getFactory();
    var NS = 'org.urbanstack';

    var tripLeg = tripData.vPassenger.currentTripLeg;
    if (!tripLeg) {
        // no tripLeg found
        var event = factory.newEvent(NS, 'CreateNewTripLeg');
        event.vPassengerId = tripData.vPassengerId;
        event.tripLegId = tripLegId;
        emit(event);
    } else {
        if (transitProvider.paymentPreference == "START") {
            var transitProvider = tripData.transitProvider;
            var passenger = tripData.vPassenger.passenger;
            var fare = tripLeg.fare;

            passenger.balance -= fare;
            //save the Passenger
            const Passenger = await getParticiapantRegistry('org.urbanstack.Passenger');
            await Passenger.update(passenger);

            transitProvider.balance += fare;
            //save Transit Provider
            const TransitProvider = await getParticipantRegistry('org.urbanstack.TransitProvider');
            await TransitProvider.update(tripData.transitProvider);
        }

        tripLeg.MIds.push(tripData.MiD);
        tripLeg.start_time = tripData.timestamp;

        tripData.tripLeg.TripLegStatus = "BOARDEDBUS";
        //save the TripLeg
        const TripLeg = await getAssetRegistry('org.urbanstack.TripLeg');
        await TripLeg.update(tripData.tripLeg);

        // Successful transaction
        var event = factory.newEvent(NS, 'QRScannedOnBus');
        event.duration = tripLeg.duration;
        event.origin = tripLeg.origin;
        event.destination = tripLeg.destination;
        event.fare = tripLeg.fare;
        emit(event);
    }
}

/**
 * Start Trip Transaction
 * @param {org.urbanstack.ConfirmTripLeg} tripData
 * @transaction
 *
 * Input
 * String MiD
 * Place currentLocation
 * -- > vPassenger vPassenger
 * -- > TransitProvider transitProvider
 * **/
async function StartTrip(tripData) {
    var factory = getFactory();
    var NS = 'org.urbanstack';

    var tripLeg = tripData.vPassenger.currentTripLeg;
    if (!tripLeg) {
        // no tripLeg found
        var event = factory.newEvent(NS, 'CreateNewTripLeg');
        event.vPassengerId = tripData.vPassengerId;
        event.tripLegId = tripLegId;
        emit(event);
    } else {
        if (transitProvider.paymentPreference == "START") {
            var transitProvider = tripData.transitProvider;
            var passenger = tripData.vPassenger.passenger;
            var fare = tripLeg.fare;

            passenger.balance -= fare;
            //save the Passenger
            const Passenger = await getParticiapantRegistry('org.urbanstack.Passenger');
            await Passenger.update(passenger);

            transitProvider.balance += fare;
            //save Transit Provider
            const TransitProvider = await getParticipantRegistry('org.urbanstack.TransitProvider');
            await TransitProvider.update(tripData.transitProvider);
        }

        tripLeg.MIds.push(tripData.MiD);
        tripLeg.start_time = tripData.timestamp;

        tripLeg.TripLegStatus = "STARTED";
        //save the TripLeg
        const TripLeg = await getAssetRegistry('org.urbanstack.TripLeg');
        await TripLeg.update(tripData.tripLeg);

        // Successful transaction
        var event = factory.newEvent(NS, 'TripStarted');
        event.duration = tripLeg.duration;
        event.origin = tripLeg.origin;
        event.destination = tripLeg.destination;
        event.fare = tripLeg.fare;

        emit(event);
    }
}

/**
 * End Trip Transaction
 * @param {org.urbanstack.ConfirmTripLeg} tripData
 * @transaction
 *
 * Input
 * String MiD
 * Place currentLocation
 * -- > vPassenger vPassenger
 * -- > TransitProvider transitProvider
 * **/
async function EndTrip(tripData) {
    var factory = getFactory();
    var NS = 'org.urbanstack';

    var tripLeg = tripData.vPassenger.currentTripLeg;
    if (!tripLeg) {
        // no tripLeg found
        var event = factory.newEvent(NS, 'CreateNewTripLeg');
        event.vPassengerId = tripData.vPassengerId;
        event.tripLegId = tripLegId;
        emit(event);
    } else {
        if (transitProvider.paymentPreference == "END") {
            var transitProvider = tripData.transitProvider;
            var passenger = tripData.vPassenger.passenger;
            var fare = tripLeg.fare;

            passenger.balance -= fare;
            //save the Passenger
            const Passenger = await getParticiapantRegistry('org.urbanstack.Passenger');
            await Passenger.update(passenger);

            transitProvider.balance += fare;
            //save Transit Provider
            const TransitProvider = await getParticipantRegistry('org.urbanstack.TransitProvider');
            await TransitProvider.update(tripData.transitProvider);
        }

        tripLeg.MIds.push(tripData.MiD);
        tripLeg.END_time = tripData.timestamp;

        tripData.tripLeg.TripLegStatus = "ENDED";
        //save the TripLeg
        const TripLeg = await getAssetRegistry('org.urbanstack.TripLeg');
        await TripLeg.update(tripData.tripLeg);

        // Successful transaction
        var event = factory.newEvent(NS, 'TripEnded');
        event.MiD = tripData.MiD;
        event.currentLocation = tripData.currentLocation;
        event.fare = tripData.fare;
        emit(event);
    }
}