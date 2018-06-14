import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

  import { PassengerPage } from '../participants/Passenger/Passenger.component';
  import { TransitProviderPage } from '../participants/TransitProvider/TransitProvider.component';
  import { OperatorPage } from '../participants/Operator/Operator.component';
  import { CityPlannerPage } from '../participants/CityPlanner/CityPlanner.component';
@Component({
  selector: 'page-participants',
  templateUrl: 'participants.component.html'
})
export class ParticipantsPage {
  participantList: any[] = [{'name':'Passenger','component':PassengerPage},{'name':'TransitProvider','component':TransitProviderPage},{'name':'Operator','component':OperatorPage},{'name':'CityPlanner','component':CityPlannerPage}];
  constructor(public navCtrl: NavController){

  }

  participantTapped(event, participant) {
    this.navCtrl.push(participant.component);
  }
}
