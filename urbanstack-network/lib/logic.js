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
    
    var vPassengerId = parseInt(Math.random() * 100000000).toString();
    var vPassenger = factory.newResource(NS, 'vPassenger', vPassengerId);
    var tripLegs = [];
    var transitProviders = [];
  
    tripData.tentativeTripLegs.forEach(tentativeTripLeg => {
		var tripLegId = parseInt(Math.random() * 100000000).toString();
        var tripLeg = factory.newResource(NS, 'TripLeg', tripLegId);
        var transitProvider = tentativeTripLeg.transitProvider;
        try{
            tripLeg.route = tentativeTripLeg.route;
        }catch(e){
            console.log(tentativeTripLeg.route.isConcept( ))
            console.log(tentativeTripLeg.route.getType());
        }
        tripLeg.transitMode = tentativeTripLeg.transitMode;
        tripLeg.transitProvider = transitProvider;
        
        if (transitProvider.tentativeTripLegs) {
            transitProvider.tentativeTripLegs.push(tripLeg);
        } else {
            transitProvider.tentativeTripLegs = [tripLeg];
        }

        if (vPassenger.tentativeTripLegs) {
            vPassenger.tentativeTripLegs.push(tripLeg);
        } else {
            vPassenger.tentativeTripLegs = [tripLeg];
        }

        tripLegs.push(tripLeg);
        transitProviders.push(transitProvider);
    });

    //add all the TripLegs
    const TripLegRegistry = await getAssetRegistry(NS +'.TripLeg');
    await TripLegRegistry.addAll(tripLegs);

    vPassenger.route = tripData.overallRoute;

    //add the vPassenger
    const vPassengerRegistry = await getAssetRegistry(NS +'.vPassenger');
    await vPassengerRegistry.add(tripData.vPassenger);

    //save Transit Provider
    const TransitProviderRegistry = await getParticipantRegistry(NS +'.TransitProvider');
    await TransitProviderRegistry.updateAll(transitProviders);

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
    var vPassenger = tripData.vPassenger;
    var transitProvider = tripLeg.transitProvider;

    var timeNow = new Date().getTime();
    var schedTime = new Date(tripData.start_time).getTime();
    if (schedTime < timeNow) {
        throw new Error("start_timed time cannot be in the past!!!");
    }

    //save the TripLeg
    tripLeg.TripLegStatus = "COFIRMED";
    const TripLegRegistry = await getAssetRegistry(NS +'.TripLeg');
    await TripLegRegistry.update(tripLeg);

    transitProvider.tentativeTripLegs.splice(transitProvider.confirmedTripLegs.indexOf(tripLeg), 1);
    transitProvider.confirmedTripLegs.push(tripLeg);
    //save Transit Provider
    const TransitProviderRegistry = await getParticipantRegistry(NS +'.TransitProvider');
    await TransitProviderRegistry.update(transitProvider);

    vPassenger.currentTripLeg = tripLeg;
    vPassenger.confirmedTripLegs.splice(vPassenger.confirmedTripLegs.indexOf(tripLeg), 1);
    vPassenger.completedTripLegs.push(tripLeg);
    //save the vPassenger
    const vPassengerRegistry = await getAssetRegistry(NS +'.vPassenger');
    await vPassengerRegistry.update(vPassenger);

    // Successfully confirmed
    var event = factory.newEvent(NS, 'TripLegConfirmed');
    event.tripLeg = tripLeg.tripLegId;
    event.passengerKey = tripData.passenger.passengerKey;
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
    var vPassenger = tripData.vPassenger;
    var tripLeg = vPassenger.currentTripLeg;
    if (!tripLeg) {
        // no tripLeg found
        var event = factory.newEvent(NS, 'CreateNewTripLeg');
        event.vPassengerId = vPassenger.vPassengerId;
        event.tripLegId = tripLeg.tripLegId;
        emit(event);
    } else {
        var transitProvider = tripData.transitProvider;
        if (transitProvider.paymentPreference == "START") {
            var passenger = vPassenger.passenger;
            var fare = tripLeg.fare;

            passenger.balance -= fare;
            //save the Passenger
            const PassengerRegistry = await getParticiapantRegistry(NS +'.Passenger');
            await PassengerRegistry.update(passenger);

            transitProvider.balance += fare;
        }

        tripLeg.MIds.push(tripData.MiD);
        tripLeg.start_time = tripData.timestamp;

        tripLeg.TripLegStatus = "BOARDEDBUS";
        //save the TripLeg
        const TripLegRegistry = await getAssetRegistry(NS +'.TripLeg');
        await TripLegRegistry.update(tripLeg);

        transitProvider.confirmedTripLegs.splice(transitProvider.confirmedTripLegs.indexOf(tripLeg), 1);
        transitProvider.completedTripLegs.push(tripLeg);
        //save Transit Provider
        const TransitProviderRegistry = await getParticipantRegistry(NS +'.TransitProvider');
        await TransitProviderRegistry.update(tripData.transitProvider);

        vPassenger.confirmedTripLegs.splice(vPassenger.confirmedTripLegs.indexOf(tripLeg), 1);
        vPassenger.completedTripLegs.push(tripLeg);
        //save vPassenger
        const vPassengerRegistry = await getParticipantRegistry(NS +'.vPassenger');
        await vPassengerRegistry.update(tripData.vPassenger);

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
    var vPassenger = tripData.vPassenger;
    var tripLeg = vPassenger.currentTripLeg;
    if (!tripLeg) {
        // no tripLeg found
        var event = factory.newEvent(NS, 'CreateNewTripLeg');
        event.vPassengerId = vPassenger.vPassengerId;
        event.tripLegId = tripLegId;
        emit(event);
    } else {
        var transitProvider = tripData.transitProvider;
        if (transitProvider.paymentPreference == "START") {
            var passenger = vPassenger.passenger;
            var fare = tripLeg.fare;

            passenger.balance -= fare;
            //save the Passenger
            const PassengerRegistry = await getParticiapantRegistry(NS +'.Passenger');
            await PassengerRegistry.update(passenger);

            transitProvider.balance += fare;
            //save Transit Provider
            const TransitProviderRegistry = await getParticipantRegistry(NS +'.TransitProvider');
            await TransitProviderRegistry.update(tripData.transitProvider);
        }

        tripLeg.MIds.push(tripData.MiD);
        tripLeg.start_time = tripData.timestamp;

        tripLeg.TripLegStatus = "STARTED";
        //save the TripLeg
        const TripLegRegistry = await getAssetRegistry(NS +'.TripLeg');
        await TripLegRegistry.update(tripData.tripLeg);

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
    var vPassenger = tripData.vPassenger;
    var tripLeg = vPassenger.currentTripLeg;
    if (!tripLeg) {
        // no tripLeg found
        var event = factory.newEvent(NS, 'CreateNewTripLeg');
        event.vPassengerId = vPassenger.vPassengerId;
        event.tripLegId = tripLegId;
        emit(event);
    } else {
        var transitProvider = tripData.transitProvider;
        if (transitProvider.paymentPreference == "END") {
            var passenger = vPassenger.passenger;
            var fare = tripLeg.fare;

            passenger.balance -= fare;
            //save the Passenger
            const PassengerRegistry = await getParticiapantRegistry(NS +'.Passenger');
            await PassengerRegistry.update(passenger);

            transitProvider.balance += fare;
        }
        var MiD = tripData.MiD;
        tripLeg.MIds.push(MiD);
        tripLeg.END_time = tripData.timestamp;

        tripLeg.TripLegStatus = "ENDED";
        //save the TripLeg
        const TripLegRegistry = await getAssetRegistry(NS +'.TripLeg');
        await TripLegRegistry.update(tripLeg);

        transitProvider.confirmedTripLegs.splice(transitProvider.confirmedTripLegs.indexOf(tripLeg), 1);
        transitProvider.completedTripLegs.push(tripLeg);
        

        vPassenger.confirmedTripLegs.splice(vPassenger.confirmedTripLegs.indexOf(tripLeg), 1);
        vPassenger.completedTripLegs.push(tripLeg);
        //save Transit Provider
        const vPassengerRegistry = await getParticipantRegistry(NS +'.vPassenger');
        await vPassengerRegistry.update(vPassenger);

        // Successful transaction
        var event = factory.newEvent(NS, 'TripEnded');
        event.MiD = MiD;
        event.currentLocation = tripData.currentLocation;
        event.fare = tripData.fare;
        emit(event);
    }
}