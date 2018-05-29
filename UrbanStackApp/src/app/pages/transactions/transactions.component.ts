import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { QRTransferToTransitPage } from '../transactions/QRTransferToTransit/QRTransferToTransit.component';
import { QRTransferToUserPage } from '../transactions/QRTransferToUser/QRTransferToUser.component';
import { SetupDemoPage } from '../transactions/SetupDemo/SetupDemo.component';
@Component({
	selector: 'page-transactions',
	templateUrl: 'transactions.component.html'
})
export class TransactionsPage {
	transactionList: any[] = [{'name':'QRTransferToTransit','component':QRTransferToTransitPage},{'name':'QRTransferToUser','component':QRTransferToUserPage},{'name':'SetupDemo','component':SetupDemoPage}];
	constructor(public navCtrl: NavController){

  }

  transactionTapped(event, transaction) {
    this.navCtrl.push(transaction.component);
  }
}
