import {Asset} from './org.hyperledger.composer.system';
import {Participant} from './org.hyperledger.composer.system';
import {Transaction} from './org.hyperledger.composer.system';
import {Event} from './org.hyperledger.composer.system';
// export namespace org.urbanstack{
   export abstract class User extends Participant {
      email: string;
      name: string;
      phoneNo: string;
   }
   export class Passenger extends User {
      qrpasses: QRPass[];
   }
   export class TransitProvider extends User {
      qrpasses: QRPass[];
      locations: Location[];
      mobilityassets: MobilityAsset[];
   }
   export class Operator extends User {
   }
   export class CityPlanner extends User {
   }
   export class MobilityAsset extends Asset {
      MiD: string;
      name: string;
      owner: TransitProvider;
      operator: Operator;
   }
   export class QRPass extends Asset {
      QRPassId: string;
      creator: Passenger;
      carrier: TransitProvider;
      origin: Location;
      destination: Location;
   }
   export class Location extends Asset {
      LocationID: string;
      address: string;
      owner: TransitProvider;
      incomingPassengers: Passenger[];
   }
   export abstract class QRTransfer extends Transaction {
      logs: string[];
      qrpass: QRPass;
      mobilityAsset: MobilityAsset;
   }
   export class QRTransferToTransit extends QRTransfer {
   }
   export class QRTransferToUser extends QRTransfer {
   }
   export class SetupDemo extends Transaction {
   }
// }
