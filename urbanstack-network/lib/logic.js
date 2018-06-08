/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/* global getAssetRegistry getqrpassRegistry getFactory */

/**
 *
 * @param {org.urbanstack.StartTrip} tt - model instance
 * @transaction
 */

async function StartTrip(tt) {
    console.log('StartTrip');

    //update the carrier of the Trip to Transit Provider
    if (!tt.qrpass.carrier) {
        tt.qrpass.carrier = tt.mobilityAsset.owner;
    } else {
        throw new Error('Trip is already being carried by a Transit Provider');
    }

    //save the Trip
    const qr = await getAssetRegistry('org.urbanstack.Trip');
    await qr.update(tt.qrpass);

    //add the Trip to Trasit Provider QRPasses[]
    if (tt.mobilityAsset.owner.qrpasses) {
        tt.mobilityAsset.owner.qrpasses.push(tt.qrpass);
    } else {
        tt.mobilityAsset.owner.qrpasses = [tt.qrpass];
    }

    //save Trasit Provider
    const tp = await getParticipantRegistry('org.urbanstack.TransitProvider');
    await tp.update(tt.mobilityAsset.owner);
}

/**
 *
 * @param {org.urbanstack.EndTrip} tt - model instance
 * @transaction
 */
async function EndTrip(tt) {
    console.log('EndTrip');

    //update the carrier of the Trip to null
    if (tt.qrpass.carrier) {
        tt.qrpass.carrier = null;
    } else {
        throw new Error('Trip is not being carried by any Transit Provider');
    }

    //save the Trip
    const qr = await getAssetRegistry('org.urbanstack.Trip');
    await qr.update(tt.qrpass);

    //remove the Trip from Transit Provider QRPasses[]
    tt.mobilityAsset.owner.qrpasses = tt.mobilityAsset.owner.qrpasses
        .filter(function(qrpass) {
            return qrpass.qrpassId !== tt.qrpass.qrpassId;
        });

    //save Transit Provider
    const user = await getParticipantRegistry('org.urbanstack.TransitProvider');
    await user.update(tt.mobilityAsset.owner);

    // Emit the event TripCreated
    var event = factory.newEvent(NS, 'TripCreated');
    event.tripId = tripId;
    emit(event);
}

/**
 * Book Trip Transaction
 * @param {org.urbanstack.CreateTrip} tripData
 * @transaction
 *
 * Check for the validity of the schedule - throw error
 * Create the Trip asset
 *    Set the tripId, tripNumber
 *    Create an instance of the 'route' Concept
 *    Set the data on 'route' Concept
 *    Set the trip asset route = 'route' concept
 * Emit TripCreated Event
 * Add the trip asset to the registry
 */
function createTrip(tripData) {

    /**
     * 1. Validate the schedule data
     * If the date is a past date then throw an error
     */
    var timeNow = new Date().getTime();
    var schedTime = new Date(tripData.schedule).getTime();
    if (schedTime < timeNow) {
        throw new Error("Scheduled time cannot be in the past!!!");
    }

    // Get the Asset Registry

    return getAssetRegistry('org.urbanstack.Trip')

    .then(function(tripRegistry) {
        // Now add the Trip - global function getFactory() called
        var factory = getFactory();

        var NS = 'org.urbanstack';

        // generate the trip ID
        // Set the tripNumber, tripId ...
        var tripId = generateTripId(tripData.tripNumber, tripData.schedule);
        var trip = factory.newResource(NS, 'Trip', tripId);

        tripData.tentativeTripLegs.forEach(tripleg => {
            trip.tentativeTripLegs.push(tripleg);
        });

        trip.passengerKey = tripData.passengerKey;

        // Emit the event TripCreated
        var event = factory.newEvent(NS, 'TripCreated');
        event.tripId = tripId;
        emit(event);

        // Add to registry
        return tripRegistry.add(trip);
    });
}

function generateTripId(tripNum, schedule) {
    var dt = new Date(schedule)

    // Date & Month needs to be in the format 01 02
    // so add a '0' if they are single digits
    var month = dt.getMonth() + 1;
    if ((month + '').length == 1) month = '0' + month;
    var dayNum = dt.getDate();
    if ((dayNum + '').length == 1) dayNum = '0' + dayNum;

    // console.log(dayNum,month,dt.getFullYear())

    return tripNum + '-' + month + '-' + dayNum + '-' + (dt.getFullYear() + '').substring(2, 4);
}

/**
 * Create Trip Transaction
 * @param {org.urbanstack.BusScan} tripData
 * @transaction
 * 
 * **/
function BusScan(tripData) {
    var transitProviderRegistry = {}
    return getParticipantRegistry('org.urbanstack.cto.TransitProvider').then(function(registry) {
        transitProviderRegistry = registry
        return transitProviderRegistry.get(tripData.transitProviderKey);
    }).then(function(transitProvider) {
        if (!transitProvider) throw new Error("Transit Provider with: " + tripData.transitProviderKey, " Not Found!!!");
        var passengerKey;
        var tripLegId;
        var fare;
        transitProvider.tentativeTripLegs.forEach(keyValue => {
            if (keyValue.tripId == tripData.tripId) {
                keyValue.tripLeg.start_time = tripData.timestamp;
                keyValue.tripLeg.MiD = tripData.MiD;
                keyValue.tripLeg.TripLegStatus = "STARTED";
                keyValue.tripLeg.transitProviderKey = tripData.transitProviderKey;
                passengerKey = keyValue.tripLeg.passengerKey;
                tripLegId = keyValue.tripLeg.tripLegId;
                fare = keyValue.tripLeg.fare;
            }
        });

        var passengerRegistry = {}
        return getParticipantRegistry('org.urbanstack.cto.Passenger').then(function(registry) {
            passengerRegistry = registry
            return passengerRegistry.get(passengerKey);
        }).then(function(passenger) {
            if (!passenger) throw new Error("Passenger with: " + tripData.participantKey, " Not Found!!!");


            //update balance
            passenger.balance -= fare;
            transitProvider.balance += fare;
            return passengerRegistry.update(passenger);

            if (!tripLegId) {
                // Successful update
                var event = factory.newEvent('org.urbanstack.cto', 'CreateNewTripLeg');
                event.tripId = tripData.tripId;
                event.tripLegId = tripLegId;

                emit(event);
            } else trip.completedTripLegs.push(tripLegId);

            var tripRegistry = {}
            return getAssetRegistry('org.urbanstack.cto.Trip').then(function(registry) {
                tripRegistry = registry
                return tripRegistry.get(tripData.tripId);
            }).then(function(trip) {
                if (!trip) throw new Error("Trip with: " + tripData.tripId, " Not Found!!!");

                trip.completedTripLegs.push(tripLegId);
                return tripRegistry.update(trip);

                // Successful update
                var event = factory.newEvent('org.urbanstack.cto', 'QRScannedOnBus');
                event.MiD = tripData.transitProviderKey;
                event.origin = tripData.origin;
                event.destination = tripData.destination;
                event.fare = tripData.fare;
                emit(event);
            }).catch(function(error) {
                throw new Error(error);
            });
        }).catch(function(error) {
            throw new Error(error);
        });
        return transitProviderRegistry.update(transitProvider);
    }).catch(function(error) {
        throw new Error(error);
    });

}