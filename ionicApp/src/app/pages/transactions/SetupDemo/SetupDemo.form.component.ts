import { Component } from '@angular/core';
import { ViewController, LoadingController, NavParams } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { SetupDemoService } from '../../../services/transactions/SetupDemo/SetupDemo.service';

@Component({
	selector: 'form-SetupDemo',
	templateUrl: 'SetupDemo.form.component.html'
})

export class SetupDemoForm {

	transactionType: string;
	properties: any[];
	formType: string;
	error: string;
	form: FormGroup;

	constructor(
		public serviceSetupDemo: SetupDemoService,
		public viewCtrl: ViewController,
		public navParams: NavParams,
		private formBuilder: FormBuilder,
		public loadingCtrl: LoadingController
	){
		this.transactionType = navParams.get('transactionType');
		this.properties = navParams.get('properties');

		this.formType = navParams.get('formType');
		this.form = this.formBuilder.group({
				timestamp:[{disabled: false}, Validators.required]
		});
	}

	addTransaction(){
		let loading = this.loadingCtrl.create({
			content: 'Adding SetupDemo...'
		});
		loading.present();

		this.serviceSetupDemo.add(this.form.value).then((response) =>{

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
