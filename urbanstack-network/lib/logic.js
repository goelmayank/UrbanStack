'use strict';

/**
 * Create vPassenger Transaction
 * @param {org.urbanstack.CreateTrip} tripData
 * @transaction
 * Input:
 * TripLeg[] tentativeTripLegs
 * String passengerKey
 */
function createTrip(tripData) {

    // Get the Asset Registry

    return getAssetRegistry('org.urbanstack.vPassenger')

    .then(function(vPassengerRegistry) {
        // Now add the vPassenger - global function getFactory() called
        var factory = getFactory();

        var NS = 'org.urbanstack';

        var vPassengerId = parseInt(Math.random() * 100000000);
        var vPassenger = factory.newResource(NS, 'vPassenger', vPassengerId);

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

        vPassenger.passengerKey = tripData.passengerKey;

        // Emit the event TripCreated
        var event = factory.newEvent(NS, 'TripCreated');
        event.vPassengerId = vPassengerId;
        emit(event);

        // Add to registry
        return vPassengerRegistry.add(vPassenger);
    });
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
    var timeNow = new Date().getTime();
    var schedTime = new Date(tripData.start_time).getTime();
    if (schedTime < timeNow) {
        throw new Error("start_timed time cannot be in the past!!!");
    }

    tripData.tripLeg.transitProvider.tentativeTripLegs.push(tripData.tripLeg.tripLegId);
    //save Transit Provider
    const user = await getParticipantRegistry('org.urbanstack.TransitProvider');
    await user.update(tripData.tripLeg.transitProvider);

    //save the TripLeg
    tripData.tripLeg.TripLegStatus = "COFIRMED";
    const TripLeg = await getAssetRegistry('org.urbanstack.TripLeg');
    await TripLeg.update(tripData.tripLeg);

    //save the vPassenger
    tripData.vPassenger.currentTripLegId = tripData.tripLeg.tripLegId;
    const TripLeg = await getAssetRegistry('org.urbanstack.vPassenger');
    await TripLeg.update(tripData.vPassenger);

    // Successfully confirmed
    var event = factory.newEvent('org.urbanstack.cto', 'TripLegConfirmed');
    event.tripLeg = tripData.tripLeg.tripLegId;
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
function BusScan(tripData) {
    var transitProviderRegistry = {}
    var passengerRegistry = {}
    var vPassengerRegistry = {}

    var passengerKey;
    var tripLegId;
    var fare;
    return getParticipantRegistry('org.urbanstack.cto.TransitProvider').then(function(registry) {
        transitProviderRegistry = registry
        return transitProviderRegistry.get(tripData.transitProviderKey);
    }).then(function(transitProvider) {
        if (!transitProvider) throw new Error("Transit Provider with: " + tripData.transitProviderKey, " Not Found!!!");

        transitProvider.tentativeTripLegs.forEach(keyValue => {
            if (keyValue.vPassengerId == tripData.vPassengerId) {
                keyValue.tripLeg.start_time = tripData.timestamp;
                keyValue.tripLeg.MiD = tripData.MiD;
                keyValue.tripLeg.TripLegStatus = "STARTED";
                keyValue.tripLeg.transitProviderKey = tripData.transitProviderKey;

                tripLegId = keyValue.tripLeg.tripLegId;
                fare = keyValue.tripLeg.fare;
            }
        }).catch(function(error) {
            throw new Error(error);
        });

        if (!tripLegId) {
            // Successful update
            var event = factory.newEvent('org.urbanstack.cto', 'CreateNewTripLeg');
            event.vPassengerId = tripData.vPassengerId;
            event.tripLegId = tripLegId;
            emit(event);
        } else {
            return getAssetRegistry('org.urbanstack.cto.vPassenger').then(function(registry) {
                vPassengerRegistry = registry
                return vPassengerRegistry.get(tripData.vPassengerId);
            }).then(function(vPassenger) {
                if (!vPassenger) throw new Error("vPassenger with: " + tripData.vPassengerId, " Not Found!!!");

                // Successful update
                var event = factory.newEvent('org.urbanstack.cto', 'QRScannedOnBus');
                event.MiD = tripData.transitProviderKey;
                event.origin = tripData.origin;
                event.destination = tripData.destination;
                event.fare = tripData.fare;
                emit(event);

                return getParticipantRegistry('org.urbanstack.cto.Passenger').then(function(registry) {
                    passengerRegistry = registry
                    return passengerRegistry.get(passengerKey);
                }).then(function(passenger) {
                    if (!passenger) throw new Error("Passenger with: " + tripData.participantKey, " Not Found!!!");

                    //update balance
                    passenger.balance -= fare;
                    return passengerRegistry.update(passenger);
                }).catch(function(error) {
                    throw new Error(error);
                });

                passengerKey = vPassenger.passengerKey;
                vPassenger.completedTripLegs.push(tripLegId);
                return vPassengerRegistry.update(vPassenger);
            }).catch(function(error) {
                throw new Error(error);
            });
        }

        transitProvider.balance += fare;
        return transitProviderRegistry.update(transitProvider);
    });
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
function StartTrip(tripData) {
    var transitProviderRegistry = {}
    var passengerRegistry = {}
    var vPassengerRegistry = {}

    var passengerKey;
    var tripLegId;
    var fare;
    return getParticipantRegistry('org.urbanstack.cto.TransitProvider').then(function(registry) {
        transitProviderRegistry = registry
        return transitProviderRegistry.get(tripData.transitProviderKey);
    }).then(function(transitProvider) {
        if (!transitProvider) throw new Error("Transit Provider with: " + tripData.transitProviderKey, " Not Found!!!");

        transitProvider.tentativeTripLegs.forEach(keyValue => {
            if (keyValue.vPassengerId == tripData.vPassengerId) {
                keyValue.tripLeg.start_time = tripData.timestamp;
                keyValue.tripLeg.MiD = tripData.MiD;
                keyValue.tripLeg.TripLegStatus = "STARTED";
                keyValue.tripLeg.transitProviderKey = tripData.transitProviderKey;

                tripLegId = keyValue.tripLeg.tripLegId;
                fare = keyValue.tripLeg.fare;
            }
        }).catch(function(error) {
            throw new Error(error);
        });

        if (!tripLegId) {
            // Successful update
            var event = factory.newEvent('org.urbanstack.cto', 'CreateNewTripLeg');
            event.vPassengerId = tripData.vPassengerId;
            event.tripLegId = tripLegId;
            emit(event);
        } else {
            return getAssetRegistry('org.urbanstack.cto.vPassenger').then(function(registry) {
                vPassengerRegistry = registry
                return vPassengerRegistry.get(tripData.vPassengerId);
            }).then(function(vPassenger) {
                if (!vPassenger) throw new Error("vPassenger with: " + tripData.vPassengerId, " Not Found!!!");

                // Successful update
                var event = factory.newEvent('org.urbanstack.cto', 'QRScannedOnBus');
                event.MiD = tripData.transitProviderKey;
                event.origin = tripData.origin;
                event.destination = tripData.destination;
                event.fare = tripData.fare;
                emit(event);

                return getParticipantRegistry('org.urbanstack.cto.Passenger').then(function(registry) {
                    passengerRegistry = registry
                    return passengerRegistry.get(passengerKey);
                }).then(function(passenger) {
                    if (!passenger) throw new Error("Passenger with: " + tripData.participantKey, " Not Found!!!");

                    //update balance
                    passenger.balance -= fare;
                    return passengerRegistry.update(passenger);
                }).catch(function(error) {
                    throw new Error(error);
                });

                passengerKey = vPassenger.passengerKey;
                vPassenger.completedTripLegs.push(tripLegId);
                return vPassengerRegistry.update(vPassenger);
            }).catch(function(error) {
                throw new Error(error);
            });
        }

        transitProvider.balance += fare;
        return transitProviderRegistry.update(transitProvider);
    });
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
function EndTrip(tripData) {
    var transitProviderRegistry = {}
    var passengerRegistry = {}
    var vPassengerRegistry = {}

    var passengerKey;
    var tripLegId;
    var fare;
    return getParticipantRegistry('org.urbanstack.cto.TransitProvider').then(function(registry) {
        transitProviderRegistry = registry
        return transitProviderRegistry.get(tripData.transitProviderKey);
    }).then(function(transitProvider) {
        if (!transitProvider) throw new Error("Transit Provider with: " + tripData.transitProviderKey, " Not Found!!!");

        transitProvider.tentativeTripLegs.forEach(keyValue => {
            if (keyValue.vPassengerId == tripData.vPassengerId) {
                keyValue.tripLeg.start_time = tripData.timestamp;
                keyValue.tripLeg.MiD = tripData.MiD;
                keyValue.tripLeg.TripLegStatus = "COMPLETED";
                keyValue.tripLeg.transitProviderKey = tripData.transitProviderKey;

                tripLegId = keyValue.tripLeg.tripLegId;
                fare = keyValue.tripLeg.fare;
            }
        }).catch(function(error) {
            throw new Error(error);
        });

        if (!tripLegId) {
            // Successful update
            var event = factory.newEvent('org.urbanstack.cto', 'CreateNewTripLeg');
            event.vPassengerId = tripData.vPassengerId;
            event.tripLegId = tripLegId;
            emit(event);
        } else {
            return getAssetRegistry('org.urbanstack.cto.vPassenger').then(function(registry) {
                vPassengerRegistry = registry
                return vPassengerRegistry.get(tripData.vPassengerId);
            }).then(function(vPassenger) {
                if (!vPassenger) throw new Error("vPassenger with: " + tripData.vPassengerId, " Not Found!!!");

                // Successful update
                var event = factory.newEvent('org.urbanstack.cto', 'QRScannedOnBus');
                event.MiD = tripData.transitProviderKey;
                event.origin = tripData.origin;
                event.destination = tripData.destination;
                event.fare = tripData.fare;
                emit(event);

                return getParticipantRegistry('org.urbanstack.cto.Passenger').then(function(registry) {
                    passengerRegistry = registry
                    return passengerRegistry.get(passengerKey);
                }).then(function(passenger) {
                    if (!passenger) throw new Error("Passenger with: " + tripData.participantKey, " Not Found!!!");

                    //update balance
                    passenger.balance -= fare;
                    return passengerRegistry.update(passenger);
                }).catch(function(error) {
                    throw new Error(error);
                });

                passengerKey = vPassenger.passengerKey;
                vPassenger.completedTripLegs.push(tripLegId);
                return vPassengerRegistry.update(vPassenger);
            }).catch(function(error) {
                throw new Error(error);
            });
        }

        transitProvider.balance += fare;
        return transitProviderRegistry.update(transitProvider);
    });
}