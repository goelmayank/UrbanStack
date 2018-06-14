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
        var passenger = tripData.passenger;
    
        tripLeg.route = tentativeTripLeg.route;
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

        if (passenger.vPassengers) {
            passenger.vPassengers.push(vPassenger);
        } else {
            passenger.vPassenger = [tripLeg];
        }

        tripLegs.push(tripLeg);
        transitProviders.push(transitProvider);
    });

    // Emit the event TripCreated
    var event = factory.newEvent(NS, 'TripCreated');
    event.vPassengerId = vPassengerId;
    emit(event);

    //add all the TripLegs
    const TripLegRegistry = await getAssetRegistry(NS +'.TripLeg');
    await TripLegRegistry.addAll(tripLegs);

    vPassenger.route = tripData.overallRoute;
    vPassenger.passenger = tripData.passenger;
    //add the vPassenger
    const vPassengerRegistry = await getAssetRegistry(NS +'.vPassenger');
    await vPassengerRegistry.add(vPassenger);

    //update Transit Provider
    const TransitProviderRegistry = await getParticipantRegistry(NS +'.TransitProvider');
    await TransitProviderRegistry.updateAll(transitProviders);

    //update Passenger
    const PassengerRegistry = await getParticipantRegistry(NS +'.Passenger');
    await PassengerRegistry.update(passenger);
}

/**
 * Confirm Trip Transaction
 * @param {org.urbanstack.ConfirmTripLeg} tripData
 * @transaction
 * Input:
 * DateTime          start_time
 * --> Passenger       Passenger
 * --> TripLeg         tripLeg
 * --> vPassenger      vPassenger
 * --> TransitProvider transitProvider
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

    tripLeg.route.status = "CONFIRMED";
    vPassenger.currentTripLeg = tripLeg;
    vPassenger.tentativeTripLegs.splice(vPassenger.tentativeTripLegs.indexOf(tripLeg), 1);
    transitProvider.tentativeTripLegs.splice(transitProvider.tentativeTripLegs.indexOf(tripLeg), 1);

    if (transitProvider.confirmedTripLegs) {
        transitProvider.confirmedTripLegs.push(tripLeg);
    } else {
        transitProvider.confirmedTripLegs = [tripLeg];
    }

    if (vPassenger.confirmedTripLegs) {
        vPassenger.confirmedTripLegs.push(tripLeg);
    } else {
        vPassenger.confirmedTripLegs = [tripLeg];
    }

    // Successfully confirmed
    var event = factory.newEvent(NS, 'TripLegConfirmed');
    event.tripLegId = tripLeg.tripLegId;
    event.vPassengerId = vPassenger.vPassengerId;
    emit(event);

    //update the TripLeg
    const TripLegRegistry = await getAssetRegistry(NS +'.TripLeg');
    await TripLegRegistry.update(tripLeg);

    //update Transit Provider
    const TransitProviderRegistry = await getParticipantRegistry(NS +'.TransitProvider');
    await TransitProviderRegistry.update(transitProvider);

    //update the vPassenger
    const vPassengerRegistry = await getAssetRegistry(NS +'.vPassenger');
    await vPassengerRegistry.update(vPassenger);
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
        var MiD = tripData.MiD;
        var transitProvider = tripData.transitProvider;
        
        if (transitProvider.paymentPreference == "START") {
            var passenger = vPassenger.passenger;
            var fare = tripLeg.route.fare;

            passenger.balance -= fare;
            transitProvider.balance += fare;

            //update the Passenger
            const PassengerRegistry = await getParticipantRegistry(NS +'.Passenger');
            await PassengerRegistry.update(passenger);
        }

        tripLeg.route.status = "BOARDEDBUS";
        tripLeg.route.start_time = tripData.timestamp;
        vPassenger.confirmedTripLegs.splice(vPassenger.confirmedTripLegs.indexOf(tripLeg), 1);
        transitProvider.confirmedTripLegs.splice(transitProvider.confirmedTripLegs.indexOf(tripLeg), 1);
    
        if (tripLeg.MIds) {
            tripLeg.MIds.push(MiD);
        } else {
            tripLeg.MIds = [MiD];
        }

        if (transitProvider.completedTripLegs) {
            transitProvider.completedTripLegs.push(tripLeg);
        } else {
            transitProvider.completedTripLegs = [tripLeg];
        }
    
        if (vPassenger.completedTripLegs) {

            vPassenger.completedTripLegs.push(tripLeg);
        } else {
            vPassenger.completedTripLegs = [tripLeg];
        }

        // Successful transaction
        var event = factory.newEvent(NS, 'QRScannedOnBus');
        event.MiD = MiD;
        event.tripLegId = tripLeg.tripLegId;
        event.vPassengerId = vPassenger.vPassengerId;
        emit(event);

        //update the TripLeg
        const TripLegRegistry = await getAssetRegistry(NS +'.TripLeg');
        await TripLegRegistry.update(tripLeg);

        //update Transit Provider
        const TransitProviderRegistry = await getParticipantRegistry(NS +'.TransitProvider');
        await TransitProviderRegistry.update(transitProvider);

        //update vPassenger
        const vPassengerRegistry = await getAssetRegistry(NS +'.vPassenger');
        await vPassengerRegistry.update(vPassenger);
    }
}

/**
 * Start Trip Transaction
 * @param {org.urbanstack.StartTrip} tripData
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
        var MiD = tripData.MiD;
        var transitProvider = tripData.transitProvider;
        
        if (transitProvider.paymentPreference == "START") {
            var passenger = vPassenger.passenger;
            var fare = tripLeg.route.fare;

            passenger.balance -= fare;
            transitProvider.balance += fare;

            //update the Passenger
            const PassengerRegistry = await getParticipantRegistry(NS +'.Passenger');
            await PassengerRegistry.update(passenger);

            //update Transit Provider
            const TransitProviderRegistry = await getParticipantRegistry(NS +'.TransitProvider');
            await TransitProviderRegistry.update(tripData.transitProvider);
        }

        tripLeg.route.status = "STARTED";
        tripLeg.route.start_time = tripData.timestamp;
        vPassenger.confirmedTripLegs.splice(vPassenger.confirmedTripLegs.indexOf(tripLeg), 1);
        transitProvider.confirmedTripLegs.splice(transitProvider.confirmedTripLegs.indexOf(tripLeg), 1);
        
        if (tripLeg.MIds) {
            tripLeg.MIds.push(MiD);
        } else {
            tripLeg.MIds = [MiD];
        }

        // Successful transaction
        var event = factory.newEvent(NS, 'TripStarted');
        event.MiD = MiD;
        event.tripLegId = tripLeg.tripLegId;
        event.vPassengerId = vPassenger.vPassengerId;
        emit(event);

        //update the TripLeg
        const TripLegRegistry = await getAssetRegistry(NS +'.TripLeg');
        await TripLegRegistry.update(tripLeg);

        //update vPassenger
        const vPassengerRegistry = await getAssetRegistry(NS +'.vPassenger');
        await vPassengerRegistry.update(vPassenger);
    }
}

/**
 * End Trip Transaction
 * @param {org.urbanstack.EndTrip} tripData
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
        event.MiD = MiD;
        event.vPassengerId = vPassenger.vPassengerId;
        emit(event);
    } else {
        var MiD = tripData.MiD;
        var transitProvider = tripData.transitProvider;
        
        if (transitProvider.paymentPreference == "END") {
            var passenger = vPassenger.passenger;
            var fare = tripLeg.route.fare;

            passenger.balance -= fare;
            transitProvider.balance += fare;

            //update the Passenger
            const PassengerRegistry = await getParticipantRegistry(NS +'.Passenger');
            await PassengerRegistry.update(passenger);
        }

        tripLeg.route.status = "ENDED";
        tripLeg.route.end_time = tripData.timestamp;
        vPassenger.confirmedTripLegs.splice(vPassenger.confirmedTripLegs.indexOf(tripLeg), 1);
        transitProvider.confirmedTripLegs.splice(transitProvider.confirmedTripLegs.indexOf(tripLeg), 1);
    
        if (tripLeg.MIds) {
            tripLeg.MIds.push(MiD);
        } else {
            tripLeg.MIds = [MiD];
        }

        if (transitProvider.completedTripLegs) {
            transitProvider.completedTripLegs.push(tripLeg);
        } else {
            transitProvider.completedTripLegs = [tripLeg];
        }
    
        if (vPassenger.completedTripLegs) {
            vPassenger.completedTripLegs.push(tripLeg);
        } else {
            vPassenger.completedTripLegs = [tripLeg];
        }

        // Successful transaction
        var event = factory.newEvent(NS, 'TripEnded');
        event.MiD = MiD;
        event.tripLegId = tripLeg.tripLegId;
        event.vPassengerId = vPassenger.vPassengerId;
        emit(event);

        //update the TripLeg
        const TripLegRegistry = await getAssetRegistry(NS +'.TripLeg');
        await TripLegRegistry.update(tripLeg);

        //update Transit Provider
        const TransitProviderRegistry = await getParticipantRegistry(NS +'.TransitProvider');
        await TransitProviderRegistry.update(transitProvider);

        //update vPassenger
        const vPassengerRegistry = await getAssetRegistry(NS +'.vPassenger');
        await vPassengerRegistry.update(vPassenger);
    }
}