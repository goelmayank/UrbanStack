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
    vPassenger.passengerKey = tripData.passengerKey;

    tripData.tentativeTripLegs.forEach(tripLeg => {
        tripLeg.TripLegStatus = "STARTED";
        vPassenger.tentativeTripLegs.push(tripLeg);
        return getParticipantRegistry('org.urbanstack.TransitProvider')
            .then(function(transitProviderRegistry) {
                return transitProviderRegistry.get(tripLeg.transitProviderKey);
            }).then(function(transitProvider) {
                if (!transitProvider) throw new Error("Transit Provider with: " + tripLeg.transitProviderKey, " Not Found!!!");
                transitProvider.tentativeTripLegs.push(tripLegId);
            });
    });

    // Emit the event TripCreated
    var event = factory.newEvent(NS, 'TripCreated');
    event.vPassengerId = vPassengerId;
    emit(event);

    //save the vPassenger
    const TripLeg = await getAssetRegistry('org.urbanstack.vPassenger');
    await TripLeg.update(tripData.vPassenger);

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

    tripLeg.transitProvider = tripData.transitProvider;
    //save the TripLeg
    tripLeg.TripLegStatus = "COFIRMED";
    const TripLeg = await getAssetRegistry('org.urbanstack.TripLeg');
    await TripLeg.update(tripLeg);

    tripLeg.transitProvider.tentativeTripLegs.push(tripLeg.tripLegId);
    //save Transit Provider
    const TransitProvider = await getParticipantRegistry('org.urbanstack.TransitProvider');
    await TransitProvider.update(tripLeg.transitProvider);

    tripData.vPassenger.currentTripLeg = tripLeg;
    //save the vPassenger
    const TripLeg = await getAssetRegistry('org.urbanstack.vPassenger');
    await TripLeg.update(tripData.vPassenger);

    // Successfully confirmed
    var event = factory.newEvent(NS, 'TripLegConfirmed');
    event.tripLeg = tripLeg.tripLegId;
    event.passengerKey = tripData.passengerKey;
    emit(event);

}

/**
 * Create vPassenger Transaction
 * @param {org.urbanstack.BusScan} tripData
 * @transaction
 * 
 * Input
 * String vPassengerId
 * String transitProviderKey
 * String MiD
 * **/
async function BusScan(tripData) {
    var factory = getFactory();
    var NS = 'org.urbanstack';

    var tripLeg = tripData.vPassenger.currentTripLeg;
    var transitProvider = tripData.transitProvider;
    if (!tripLeg) {
        // Successful update
        var event = factory.newEvent(NS, 'CreateNewTripLeg');
        event.vPassengerId = tripData.vPassengerId;
        event.tripLegId = tripLegId;
        emit(event);
    } else {

        var fare = tripLeg.fare;

        tripLeg.deviceIds.push(tripData.MiD);
        tripLeg.start_time = tripData.timestamp;
        tripLeg.transitProviderKey = transitProvider.transitProviderKey;
        tripData.tripLeg.TripLegStatus = "BOARDEDBUS";
        //save the TripLeg
        const TripLeg = await getAssetRegistry('org.urbanstack.TripLeg');
        await TripLeg.update(tripData.tripLeg);

        var passenger = tripData.vPassenger.passenger;
        passenger.balance -= fare;
        //save the Passenger
        const Passenger = await getParticiapantRegistry('org.urbanstack.Passenger');
        await Passenger.update(passenger);


        transitProvider.balance += fare;
        //save Transit Provider
        const TransitProvider = await getParticipantRegistry('org.urbanstack.TransitProvider');
        await TransitProvider.update(tripData.transitProvider);

        // Successful scan
        var event = factory.newEvent(NS, 'QRScannedOnBus');
        event.MiD = tripData.transitProviderKey;
        event.origin = tripData.origin;
        event.destination = tripData.destination;
        event.fare = tripData.fare;
        emit(event);
    }
}

/**
 * Start vPassenger Transaction
 * @param {org.urbanstack.ConfirmTripLeg} tripData
 * @transaction
 * Input:
 * DateTime start_time
 * TripLeg[] tentativeTripLegs
 * String passengerKey
 */
async function StartTrip(tripData) {
    var factory = getFactory();
    var NS = 'org.urbanstack';

    var tripLeg = tripData.vPassenger.currentTripLeg;
    var transitProvider = tripData.transitProvider;
    if (!tripLeg) {
        // Successful update
        var event = factory.newEvent(NS, 'CreateNewTripLeg');
        event.vPassengerId = tripData.vPassengerId;
        event.tripLegId = tripLegId;
        emit(event);
    } else {

        var fare = tripLeg.fare;

        tripLeg.deviceIds.push(tripData.MiD);
        tripLeg.start_time = tripData.timestamp;
        tripLeg.transitProviderKey = transitProvider.transitProviderKey;
        tripData.tripLeg.TripLegStatus = "START";
        //save the TripLeg
        const TripLeg = await getAssetRegistry('org.urbanstack.TripLeg');
        await TripLeg.update(tripData.tripLeg);

        var passenger = tripData.vPassenger.passenger;
        passenger.balance -= fare;
        //save the Passenger
        const Passenger = await getParticiapantRegistry('org.urbanstack.Passenger');
        await Passenger.update(passenger);


        transitProvider.balance += fare;
        //save Transit Provider
        const TransitProvider = await getParticipantRegistry('org.urbanstack.TransitProvider');
        await TransitProvider.update(tripData.transitProvider);

        // Successful scan
        var event = factory.newEvent(NS, 'TripStarted');
        event.MiD = tripData.transitProviderKey;
        event.origin = tripData.origin;
        event.destination = tripData.destination;
        event.fare = tripData.fare;
        emit(event);
    }
}

/**
 * End vPassenger Transaction
 * @param {org.urbanstack.ConfirmTripLeg} tripData
 * @transaction
 * Input:
 * DateTime start_time
 * TripLeg[] tentativeTripLegs
 * String passengerKey
 */
async function EndTrip(tripData) {
    var factory = getFactory();
    var NS = 'org.urbanstack';

    var tripLeg = tripData.vPassenger.currentTripLeg;
    var transitProvider = tripData.transitProvider;
    if (!tripLeg) {
        // Successful update
        var event = factory.newEvent(NS, 'CreateNewTripLeg');
        event.vPassengerId = tripData.vPassengerId;
        event.tripLegId = tripLegId;
        emit(event);
    } else {

        var fare = tripLeg.fare;

        tripLeg.deviceIds.push(tripData.MiD);
        tripLeg.END_time = tripData.timestamp;
        tripLeg.transitProviderKey = transitProvider.transitProviderKey;
        tripData.tripLeg.TripLegStatus = "END";
        //save the TripLeg
        const TripLeg = await getAssetRegistry('org.urbanstack.TripLeg');
        await TripLeg.update(tripData.tripLeg);

        var passenger = tripData.vPassenger.passenger;
        passenger.balance -= fare;
        //save the Passenger
        const Passenger = await getParticiapantRegistry('org.urbanstack.Passenger');
        await Passenger.update(passenger);


        transitProvider.balance += fare;
        //save Transit Provider
        const TransitProvider = await getParticipantRegistry('org.urbanstack.TransitProvider');
        await TransitProvider.update(tripData.transitProvider);

        // Successful scan
        var event = factory.newEvent(NS, 'TripEnded');
        event.MiD = tripData.MiD;
        event.currentLocation = tripData.currentLocation;
        event.fare = tripData.fare;
        emit(event);
    }
}