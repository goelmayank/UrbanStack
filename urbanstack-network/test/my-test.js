/**
 * Part of a course on Hyperledger Fabric: 
 * http://ACloudFan.com
 * 
 * This is the sample test case used in the lecture
 * "Unit Testing of Network Apps"
 */
var assert = require('chai').assert;

// You need to change this to your specific directory
const utHarness = require('../../UrbanStack-FabricAPI/ut-harness.js');

// This points to the model project folder
var modelFolder = __dirname + '/..';

var adminConnection = {}
var businessNetworkConnection = {}
var bnDefinition = {}



// Synchronous call so that connections can be established
before((done) => {
    utHarness.debug = false;
    utHarness.initialize(modelFolder, (adminCon, bnCon, definition) => {
        adminConnection = adminCon;
        businessNetworkConnection = bnCon;
        bnDefinition = definition;
        done();
    });
})

const nameSpace = 'org.urbanstack';
const resourceName = 'tripLeg';

// Test Suite # 1
describe('Sample Asset # Add & Check', () => {

    // Test Case # 1
    // 1. Add an Asset 
    /*
    {
        "$class": "org.urbanstack.TripLeg",
        "tripLegId": "6845",
        "route": {
            "$class": "org.urbanstack.Route",
            "origin": {
                "$class": "org.urbanstack.Place",
                "address": "Anim officia."
            },
            "destination": {
                "$class": "org.urbanstack.Place",
                "address": "Incididunt anim aute culpa non."
            },
            "duration": 149.431,
            "distance": 129.554,
            "status": "CREATED",
            "fare": 145.44
        },
        "transitMode": "Bus",
        "transitProvider": "resource:org.urbanstack.TransitProvider#DTC"
    }
    */
    // 2. Get the asset instance that was added
    // 3. Assert Equal >> Value in received asset should be "10"
    it('should have 1 asset instance with value=10', () => {
        let registry = {}
            // Add the asset
            // Get the asset registry using the BN Connection
        return businessNetworkConnection.getAssetRegistry(nameSpace + '.' + resourceName).then((reg) => {
            registry = reg;
            // Get the factory using the BN Definition
            const factory = bnDefinition.getFactory();
            // Create the instance
            let tripLeg = factory.newResource(nameSpace, resourceName, '6845');

            var leg_route = factory.newConcept(NS, "Route");
            var leg_origin = factory.newConcept(NS, "Place");
            leg_origin.address = "IIT Delhi";
            var leg_destination = factory.newConcept(NS, "Place");
            leg_destination.address = "Munreka";
            leg_route.origin = leg_origin;
            leg_route.destination = leg_destination;
            leg_route.duration = 149.431;
            leg_route.distance = 129.554;
            leg_route.status = "CREATED";
            leg_route.fare = 145.44;

            tripLeg.route = leg_route;
            tripLeg.transitMode = "Bus";
            tripLeg.transitProvider = "resource:org.urbanstack.TransitProvider#DTC";
            // Add to registry
            return registry.add(tripLeg);
        }).then((asset) => {

            // Get the asset now
            return registry.get('6845');
        }).then((asset) => {

            // Assert
            assert.equal(asset.fare, 145.44, "Value not equal or undefined");
        }).catch((error) => {
            console.log(error);
        });
    });


});