import { Component, ChangeDetectorRef } from '@angular/core';
import { Events, ViewController, LoadingController, NavParams } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { QRPassService } from '../../../services/assets/QRPass/QRPass.service';
import { PlatformService } from '../../../services/platform.service';

@Component({
	selector: 'form-QRPass',
	templateUrl: 'QRPass.form.component.html'
})

export class QRPassForm {
	assetId: string;
	assetType: string;
	properties: any[];
	formType: string;
	error: string;
	assetIdentifierProperty: string = "QRPassId"
	form: FormGroup;
	connected: boolean;

	constructor(
		public events: Events,
		public serviceQRPass: QRPassService,
		public platformService: PlatformService,
		public viewCtrl: ViewController,
		public navParams: NavParams,
		private formBuilder: FormBuilder,
		public loadingCtrl: LoadingController,
		private changeDetector: ChangeDetectorRef
	){
		this.assetId = navParams.get('assetId');
		this.assetType = navParams.get('assetType');
		this.properties = navParams.get('properties');
		this.formType = navParams.get('formType');

		this.form = this.formBuilder.group({
			QRPassId:[{disabled: false}, Validators.required],
			creator:[{disabled: false}, Validators.required],
			carrier:[{disabled: false}],
			origin:[{disabled: false}],
			destination:[{disabled: false}]
		});
		this.connected = this.platformService.isConnected();

		this.events.subscribe('connection', (connected) => {
			this.connected = connected;
			this.changeDetector.detectChanges();
		});
	}

	ionViewWillEnter(){
		if(this.formType == 'Update'){
			let loading = this.loadingCtrl.create({
				content: 'Fetching '.concat(this.assetId)
			});
			loading.present();
			return this.serviceQRPass.get(this.assetId).then((asset) => {
				let retrievedAsset = asset;

				delete retrievedAsset['$class'];
				this.form.setValue(asset);
				// We need to disable the identifier field. We should not be able to update an assets identifier.
				let disabledIdentifier = this.form.get(this.assetIdentifierProperty);
				disabledIdentifier.disable();

				loading.dismiss();
			});
		}
		else{
			let enabledIdentifier = this.form.get(this.assetIdentifierProperty);
			enabledIdentifier.enable();
		}
	}

	submit(){
		if(this.formType == 'Add'){
			this.addAsset();
		}
		if(this.formType == 'Update'){
			this.updateAsset()
		}
	}

	addAsset(){
		let loading = this.loadingCtrl.create({
			content: 'Adding QRPass...'
		});
		loading.present();
		let assetIdValue = this.form.value[this.assetIdentifierProperty];

		this.serviceQRPass.add(this.form.value).then(() =>{

			this.viewCtrl.dismiss({'assetId':assetIdValue,'loading':loading});
		}).catch((error) => {
			loading.dismiss();
			let parsedError = JSON.parse(error._body);
			this.error = parsedError.error.message;
		});
	}

	updateAsset(){
		let loading = this.loadingCtrl.create({
			content: 'Updating QRPass...'
		});
		loading.present();

		// We need to enable the identifier field in order to access the value.
		let disabledIdentifier = this.form.get(this.assetIdentifierProperty);
		disabledIdentifier.enable();

		this.serviceQRPass.update(disabledIdentifier.value, this.form.value).then(() =>{
			this.viewCtrl.dismiss({'assetId':disabledIdentifier.value,'loading':loading});
		}).catch((error) => {
			loading.dismiss();
			let parsedError = JSON.parse(error._body);
			this.error = parsedError.error.message;
		})

	}

	dismiss(){
		this.viewCtrl.dismiss();
	}

}
