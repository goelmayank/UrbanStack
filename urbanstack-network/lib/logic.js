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
 * @param {org.urbanstack.QRTransferToTransit} tt - model instance
 * @transaction
 */

async function onTransferToTransit(tt) {
    console.log('onTransferToTransit');

    //update the carrier of the QRPass to Transit Provider
    if (!tt.qrpass.carrier) {
        tt.qrpass.carrier = tt.mobilityAsset.owner;
    } else {
        throw new Error('QRPass is already being carried by a Transit Provider');
    }

    //save the QRPass
    const qr = await getAssetRegistry('org.urbanstack.QRPass');
    await qr.update(tt.qrpass);

    //add the QRPass to Trasit Provider QRPasses[]
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
 * @param {org.urbanstack.QRTransferToUser} tt - model instance
 * @transaction
 */
async function QRTransferToUser(tt) {
    console.log('QRTransferToUser');

    //update the carrier of the QRPass to null
    if (tt.qrpass.carrier) {
        tt.qrpass.carrier = null;
    } else {
        throw new Error('QRPass is not being carried by any Transit Provider');
    }

    //save the QRPass
    const qr = await getAssetRegistry('org.urbanstack.QRPass');
    await qr.update(tt.qrpass);

    //remove the QRPass from Transit Provider QRPasses[]
    tt.mobilityAsset.owner.qrpasses = tt.mobilityAsset.owner.qrpasses
        .filter(function (qrpass) {
            return qrpass.qrpassId !== tt.qrpass.qrpassId;
        });

    //save Transit Provider
    const user = await getParticipantRegistry('org.urbanstack.TransitProvider');
    await user.update(tt.mobilityAsset.owner);
}

/**
 * Book Trip Transaction
 * @param {org.urbanstack.CreateTrip} tripData
 * @transaction
 *
 * 1. Check for the validity of the schedule - throw error
 * 2. Create the Trip asset
 *    2.1 Set the tripId, tripNumber
 *    2.2 Create an instance of the 'route' Concept
 *    2.3 Set the data on 'route' Concept
 *    2.4 Set the trip asset route = 'route' concept
 * 3. Emit TripCreated Event
 * 4. Add the trip asset to the registry
 */
function createTrip(tripData) {

    /**
     * 1. Validate the schedule data
     * If the date is a past date then throw an error
     */
    var timeNow = new Date().getTime();
    var schedTime = new Date(tripData.schedule).getTime();
    if(schedTime < timeNow){
        throw new Error("Scheduled time cannot be in the past!!!");
    }

    // Get the Asset Registry

    return getAssetRegistry('org.urbanstack.Trip')

        .then(function(tripRegistry){
            // Now add the Trip - global function getFactory() called
            var  factory = getFactory();

            var  NS =  'org.urbanstack';

            // Solution to exercise - Removed hardcoded value & invoked
            // generate the trip ID
            // 2.1 Set the tripNumber, tripId ...
            var  tripId = generateTripId(tripData.tripNumber,tripData.schedule);
            var  trip = factory.newResource(NS,'Trip',tripId);
            trip.tripNumber = tripData.tripNumber;
            trip.aliasTripNumber = [];

            // Trip asset has an instance of the concept
            // 2.2 Use the factory to create an instance of concept
            var route = factory.newConcept(NS,"Route");

            // 2.3 Set the data in the concept 'route'
            route.origin = tripData.origin;
            route.destination = tripData.destination;
            route.schedule = tripData.schedule;

            // 2.4 Set the route attribute on the asset
            trip.route = route;


            // 3 Emit the event TripCreated
            var event = factory.newEvent(NS, 'TripCreated');
            event.tripId = tripId;
            emit(event);

            // 4. Add to registry
            return tripRegistry.add(trip);
        });
}
