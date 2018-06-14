'use strict';
/**
 * Part of a course on Hyperledger Fabric: 
 * http://ACloudFan.com
 * 
 * Exercise:
 * Create a new vPassenger resource instance and add it to the vPassenger Registry
 */


// Parameter is a AssetRegistry
function addvPassenger(registry) {
    const bnDef = bnUtil.connection.getBusinessNetwork();
    const factory = bnDef.getFactory();
    let vPassengerResource = factory.newResource(aircraftNamespace, aircraftType, 'AE201-05-05-2020');
    vPassengerResource.setPropertyValue('vPassengerId', '101');
    vPassengerResource.route = factory.newConcept(aircraftNamespace, 'Route');
    vPassengerResource.route.setPropertyValue('origin', 'EWR');
    vPassengerResource.route.setPropertyValue('destination', 'ATL');
    vPassengerResource.route.setPropertyValue('schedule', new Date('2018-10-15T21:44Z'));

    return registry.add(vPassengerResource).then(() => {
        console.log('Successfully created the vPassenger!!!');
        bnUtil.disconnect();
    }).catch((error) => {
        console.log(error);
        bnUtil.disconnect();
    });
}