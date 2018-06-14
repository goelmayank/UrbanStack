import { Component } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavParams, PopoverController } from 'ionic-angular';
import { QRPassService } from '../../../services/assets/QRPass/QRPass.service';
import { QRPass} from '../../../org.urbanstack';
import { QRPassForm } from './QRPass.form.component';
import { AssetViewPage } from '../../asset-view/asset-view.component';
import { PopoverPage } from '../../popover/popover.component';
@Component({
	selector: 'page-QRPass',
	templateUrl: 'QRPass.component.html'
})

export class QRPassPage {
	searchQuery: string = '';
	items: QRPass[] = [];
	itemsLoaded: boolean = false; //This is to ensure that 'no assets' message doesn't appear when data is being retrieved
	currentItems: QRPass[] = [];
	properties: any[] = [{"name":"QRPassId","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"creator","type":"Passenger","optional":false,"primitive":false,"array":false,"enum":false,"enumValues":[]},{"name":"carrier","type":"TransitProvider","optional":true,"primitive":false,"array":false,"enum":false,"enumValues":[]},{"name":"origin","type":"Location","optional":true,"primitive":false,"array":false,"enum":false,"enumValues":[]},{"name":"destination","type":"Location","optional":true,"primitive":false,"array":false,"enum":false,"enumValues":[]}];

	constructor(
		public navParams: NavParams,
		public alertCtrl: AlertController,
		public loadingCtrl: LoadingController,
		public modalCtrl: ModalController,
		public popoverCtrl: PopoverController,
		public serviceQRPass:QRPassService
	){
		this.serviceQRPass.getAll().then((assets) => {
			this.currentItems = assets;
			this.items = assets;
			this.itemsLoaded = true;
		});
	}

	ionViewWillEnter(): any {

		let loading = this.loadingCtrl.create({
			content: 'Fetching all QRPass assets'
		});
		loading.present();
		return this.serviceQRPass.getAll().then((assets) => {
			this.currentItems = assets;
			this.items = assets;
			this.itemsLoaded = true;
			loading.dismiss();
		});

	}

	getItems(ev: any): void {
		this.serviceQRPass.getAll().then((assets) => {
			this.currentItems = assets;
			this.items = assets;
			// set val to the value of the searchbar
			let val = ev.target.value;

			// if the value is an empty string don't filter the items
			if (val && val.trim() != '') {
				this.items = this.items.filter((item) => {
					return (item['QRPassId'].toLowerCase().indexOf(val.toLowerCase()) > -1);
				});
			}
		});
	}

	refreshItems(refresher): Promise<void>{
		return this.serviceQRPass.getAll().then((assets) => {
			this.currentItems = assets;
			this.items = assets;
			refresher.complete();
		});
	}

	viewAsset(assetId){
		let modal = this.modalCtrl.create(AssetViewPage, {
			assetId: assetId, assetType: 'QRPass'
		});
		modal.present();
	}

	addAsset(){
		let modal = this.modalCtrl.create(QRPassForm, {
			assetType: 'QRPass', properties: this.properties, formType: 'Add'
		});
		modal.present();

		modal.onDidDismiss(data => {
			if(data !== undefined && data.assetId && data.loading){

				let assetIdValue = data.assetId;
				let loading = data.loading;


				this.serviceQRPass.getAll().then((assets) => {
					this.currentItems = assets;
					this.items = assets;

					loading.dismiss(); // Dismiss loading animation

					let alert = this.alertCtrl.create({
						title: 'Added QRPass',
						subTitle: assetIdValue.concat(' has been added'),
						buttons: ['OK']
					});

					alert.present(); // Present successful asset deletion message
				});
			}
		})
	}

	updateAsset(assetId){
		let modal = this.modalCtrl.create(QRPassForm, {
			assetId: assetId, assetType: 'QRPass', properties: this.properties, formType: 'Update'
		});
		modal.present();

		modal.onDidDismiss(data => {
			if(data !== undefined && data.assetId && data.loading){
				let assetIdValue = data.assetId;
				let loading = data.loading;


				this.serviceQRPass.getAll().then((assets) => {
					this.currentItems = assets;
					this.items = assets;

					loading.dismiss(); // Dismiss loading animation

					let alert = this.alertCtrl.create({
						title: 'Updated QRPass',
						subTitle: assetIdValue.concat(' has been updated'),
						buttons: ['OK']
					});

					alert.present(); // Present successful asset deletion message
				});
			}
		})

	}

	deleteAsset(assetId) {
		let message = "Are you sure you want to delete ".concat(assetId).concat('?');
		let confirm = this.alertCtrl.create({
			title: 'Delete QRPass?',
			message: message,
			buttons: [{
				text: 'Yes',
				handler: () => {

					let loading = this.loadingCtrl.create({
						content: 'Deleting QRPass...'
					});

					loading.present(); // Show loading animation

					this.serviceQRPass.delete(assetId).then(() => {

						// We have deleted the asset, now we need to get all of the assets and update the view
						this.serviceQRPass.getAll().then((assets) => {
							this.currentItems = assets;
							this.items = assets;

							loading.dismiss(); // Dismiss loading animation

							let alert = this.alertCtrl.create({
								title: 'Deleted QRPass',
								subTitle: assetId.concat(' has been deleted'),
								buttons: ['OK']
							});

							alert.present(); // Present successful asset deletion message
						});
					})
				}
			},
			{
				text: 'No',
				handler: () => {}
			}]
		});

		confirm.present();
	}

	sortAssets(){
		let tempCurrentItems = [];
		let tempItems = [];
		console.log('pre reverse',this.currentItems,this.items);
		for(let x=this.currentItems.length-1;x>=0;x--){
			tempCurrentItems.push(this.currentItems[x]);
		}
		for(let x=this.items.length-1;x>=0;x--){
			tempItems.push(this.items[x]);
		}
		this.currentItems = tempCurrentItems;
		this.items = tempItems;
		console.log('post reverse',this.currentItems,this.items);
	}

	presentPopover(event) {
		let popover = this.popoverCtrl.create(PopoverPage,);
		popover.present({
			ev: event
		});
		popover.onDidDismiss(data => {
			if(data == 'sort'){
				this.sortAssets();
			}
		})
	}


}
