import { Component } from '@angular/core';
import { ViewController, LoadingController, NavParams } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { QRTransferToUserService } from '../../../services/transactions/QRTransferToUser/QRTransferToUser.service';

@Component({
	selector: 'form-QRTransferToUser',
	templateUrl: 'QRTransferToUser.form.component.html'
})

export class QRTransferToUserForm {

	transactionType: string;
	properties: any[];
	formType: string;
	error: string;
	form: FormGroup;

	constructor(
		public serviceQRTransferToUser: QRTransferToUserService,
		public viewCtrl: ViewController,
		public navParams: NavParams,
		private formBuilder: FormBuilder,
		public loadingCtrl: LoadingController
	){
		this.transactionType = navParams.get('transactionType');
		this.properties = navParams.get('properties');

		this.formType = navParams.get('formType');
		this.form = this.formBuilder.group({
				logs:[{disabled: false}],
				qrpass:[{disabled: false}, Validators.required],
				mobilityAsset:[{disabled: false}, Validators.required],
				timestamp:[{disabled: false}, Validators.required]
		});
	}

	addTransaction(){
		let loading = this.loadingCtrl.create({
			content: 'Adding QRTransferToUser...'
		});
		loading.present();

		this.serviceQRTransferToUser.add(this.form.value).then((response) =>{

			this.viewCtrl.dismiss({'response':response,'loading':loading});
		}).catch((error) => {

			loading.dismiss();
			let parsedError = JSON.parse(error._body);
			this.error = parsedError.error.message;
		});
	}

	getProperties(){
		return this.properties.filter((property) => {
			return property.name != 'transactionId'
		});
	}

	dismiss(){
		this.viewCtrl.dismiss();
	}

}
