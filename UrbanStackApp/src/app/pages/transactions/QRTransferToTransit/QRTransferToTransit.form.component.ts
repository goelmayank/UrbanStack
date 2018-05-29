import { Component } from '@angular/core';
import { ViewController, LoadingController, NavParams } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { QRTransferToTransitService } from '../../../services/transactions/QRTransferToTransit/QRTransferToTransit.service';

@Component({
	selector: 'form-QRTransferToTransit',
	templateUrl: 'QRTransferToTransit.form.component.html'
})

export class QRTransferToTransitForm {

	transactionType: string;
	properties: any[];
	formType: string;
	error: string;
	form: FormGroup;

	constructor(
		public serviceQRTransferToTransit: QRTransferToTransitService,
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
			content: 'Adding QRTransferToTransit...'
		});
		loading.present();

		this.serviceQRTransferToTransit.add(this.form.value).then((response) =>{

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
