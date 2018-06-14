import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AlertController, LoadingController, NavParams, ModalController, IonicModule } from 'ionic-angular';
import { By } from '@angular/platform-browser';
import { MobilityAssetPage} from './MobilityAsset.component';
import { MobilityAssetForm } from './MobilityAsset.form.component'
import { MobilityAssetService } from '../../../services/assets/MobilityAsset/MobilityAsset.service';
import { MobilityAsset} from '../../../org.urbanstack';
import { AssetViewPage } from '../../asset-view/asset-view.component';


let MobilityAssetOne = new MobilityAsset();
MobilityAssetOne.MiD = "MobilityAsset1"
let MobilityAssetTwo = new MobilityAsset();
MobilityAssetTwo.MiD = "MobilityAsset2"
let MobilityAssetThree = new MobilityAsset();
MobilityAssetThree.MiD = "MobilityAsset3"

class serviceMobilityAssetPageMock{
	getAll(){
		return new Promise((resolve,reject)=>{
			resolve([MobilityAssetOne,MobilityAssetTwo,MobilityAssetThree]);
		});
	}
}

class LoadingControllerMock{
	create(value){
		return new LoadingMock();
	}
}

class LoadingMock{
	present(){
		return;
	}
	dismiss(){
		return;
	}
}

class AlertControllerMock{
	create(value){
		return new AlertMock();
	}
}

class AlertMock{
	present(){
		return;
	}
	dismiss(){
		return;
	}
}

// class ModalControllerMock{
// 	create(value){
// 		return new ModalMock();
// 	}
// }

class ModalMock{
	present(){
		return;
	}
	dismiss(){
		return;
	}
	onDidDismiss(){
		return;
	}
}

class ModalControllerMock {
	public presentableRef = {
	  present: () => Promise.resolve(),
	  dismiss: (data?: any) => {
		if (this.dismissCallbackFn) {
		  this.dismissCallbackFn(data);
		}
		return Promise.resolve({});
	  },
	  onDidDismiss: (fn) => {
		this.dismissCallbackFn = fn;
	  }
	};

	public dismissCallbackFn = null;

	public create(options?) {
	  return Object.assign(this.presentableRef, options);
	}
  }



describe('MobilityAssetPage', () => {
	let fixture;
	let component;
	let loadingMock = new LoadingMock();
	let alertMock = new AlertMock();
	let modalMock = new ModalMock();

  	beforeEach(async(() => {

    	TestBed.configureTestingModule({
			declarations: [
				MobilityAssetPage
			],
			imports: [
				IonicModule.forRoot(MobilityAssetPage)
			],
			providers: [
				{ provide: NavParams },
				{ provide: AlertController, useClass: AlertControllerMock },
				{ provide: LoadingController, useClass: LoadingControllerMock },
				{ provide: ModalController, useClass: ModalControllerMock },
				{ provide: MobilityAssetService, useClass:serviceMobilityAssetPageMock }
			]
    	})
  	}));

  	beforeEach(() => {
		spyOn(serviceMobilityAssetPageMock.prototype,'getAll').and.callThrough();
    	fixture = TestBed.createComponent(MobilityAssetPage);
    	component = fixture.componentInstance;
  	});

  	it('should create MobilityAssetPage component', () => {
		expect(component instanceof MobilityAssetPage).toBe(true);
	});

	it('should have correct title',() => {
		let title = fixture.debugElement.query(By.css('ion-title'));
		fixture.detectChanges();
		expect(title.nativeElement.textContent).toContain('MobilityAsset');
	});

	it('should return MobilityAsset assets', fakeAsync(() => {
		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');

		component.ionViewWillEnter();
		tick();

		expect(component.currentItems.length).toEqual(3);
		expect(component.items.length).toEqual(3);
	}));

	it('MobilityAsset assets should be a MobilityAsset type', fakeAsync(() => {
		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');

		component.ionViewWillEnter();
		tick();

		expect(component.currentItems[0] instanceof MobilityAsset).toBe(true);
		expect(component.currentItems[1] instanceof MobilityAsset).toBe(true);
		expect(component.currentItems[2] instanceof MobilityAsset).toBe(true);
	  }));

	it('should present and dismiss loading alert', fakeAsync(() => {
		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');

		component.ionViewWillEnter();
		tick();

		expect(LoadingControllerMock.prototype.create).toHaveBeenCalled();
		expect(LoadingMock.prototype.present).toHaveBeenCalled();
		expect(LoadingMock.prototype.dismiss).toHaveBeenCalled();
		expect(component.itemsLoaded).toEqual(true);
	}));

	it('should get same items when no search text', fakeAsync(() => {
		let ev = {target:{value:""}};
		component.getItems(ev);
		tick();

		expect(component.currentItems).toEqual([MobilityAssetOne,MobilityAssetTwo,MobilityAssetThree]);

	}));

	it('should get some items when there is partially matching search text', fakeAsync(() => {
		let ev = {target:{value:"3"}};
		component.getItems(ev);
		tick();

		expect(component.items).toEqual([MobilityAssetThree]);

	}));

	it('should get no items when there is no matching search text', fakeAsync(() => {
		let ev = {target:{value:"randomstring"}};
		component.getItems(ev);
		tick();

		expect(component.items).toEqual([]);

	}));

	it('should refresh and fetch latest items', fakeAsync(() => {
		let refresher = {complete:function(){return;}};

		spyOn(refresher,'complete');
		component.refreshItems(refresher);
		tick();

		expect(component.currentItems).toEqual([MobilityAssetOne,MobilityAssetTwo,MobilityAssetThree]);
		expect(component.items).toEqual([MobilityAssetOne,MobilityAssetTwo,MobilityAssetThree]);
		expect(refresher.complete).toHaveBeenCalled();

	}));

	it('should open model to view asset', fakeAsync(() => {
		spyOn(ModalControllerMock.prototype,'create').and.returnValue(modalMock);
		spyOn(ModalMock.prototype,'present');
		let assetIdentifier = 'assetIdentifier';
		component.viewAsset(assetIdentifier);
		tick();
		expect(ModalControllerMock.prototype.create).toHaveBeenCalledWith(
			AssetViewPage, {
				assetId: assetIdentifier, assetType: 'MobilityAsset'
			}
		)
		expect(ModalMock.prototype.present).toHaveBeenCalled();
	}));

	it('should show delete asset alert', fakeAsync(() => {
		spyOn(AlertControllerMock.prototype,'create').and.returnValue(alertMock);
		spyOn(AlertMock.prototype,'present');
		let assetIdentifier = 'assetIdentifier'
		component.deleteAsset(assetIdentifier);
		tick();
		expect(AlertMock.prototype.present).toHaveBeenCalled();
	}));

	it('should open model to add asset', fakeAsync(() => {
		spyOn(ModalControllerMock.prototype,'create').and.returnValue(modalMock);
		spyOn(ModalMock.prototype,'present');
		spyOn(ModalMock.prototype,'onDidDismiss');

		component.addAsset();

		tick();

		expect(ModalControllerMock.prototype.create).toHaveBeenCalledWith(
			MobilityAssetForm, {
				assetType: 'MobilityAsset',
				properties: [{"name":"MiD","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"name","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"owner","type":"TransitProvider","optional":false,"primitive":false,"array":false,"enum":false,"enumValues":[]},{"name":"operator","type":"Operator","optional":true,"primitive":false,"array":false,"enum":false,"enumValues":[]}],
				formType: 'Add'
			}
		)
		expect(ModalMock.prototype.present).toHaveBeenCalled();
		expect(ModalMock.prototype.onDidDismiss).toHaveBeenCalled();

	}));

	it('should open model to update asset', fakeAsync(() => {
		spyOn(ModalControllerMock.prototype,'create').and.returnValue(modalMock);
		spyOn(ModalMock.prototype,'present');
		spyOn(ModalMock.prototype,'onDidDismiss');
		let assetIdentifier = 'assetIdentifier';

		component.updateAsset(assetIdentifier);

		tick();

		expect(ModalControllerMock.prototype.create).toHaveBeenCalledWith(
			MobilityAssetForm, {
				assetId: assetIdentifier,
				assetType: 'MobilityAsset',
				properties: [{"name":"MiD","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"name","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"owner","type":"TransitProvider","optional":false,"primitive":false,"array":false,"enum":false,"enumValues":[]},{"name":"operator","type":"Operator","optional":true,"primitive":false,"array":false,"enum":false,"enumValues":[]}],
				formType: 'Update'
			}
		)
		expect(ModalMock.prototype.present).toHaveBeenCalled();
		expect(ModalMock.prototype.onDidDismiss).toHaveBeenCalled();

	}));


	it('should get all MobilityAsset assets after an add MobilityAsset form is completed', fakeAsync(() => {
		const modalCtrl = fixture.debugElement.injector.get(ModalController);
		const modal = (<ModalControllerMock>(<any>modalCtrl)).presentableRef;

		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(AlertControllerMock.prototype,'create').and.returnValue(alertMock);
		spyOn(AlertMock.prototype,'present');
		spyOn(modalCtrl, 'create').and.callThrough();
		spyOn(modal, 'present').and.callThrough();

		component.addAsset();
		tick();

		modal.dismiss({ loading: new LoadingMock(), assetId: 'assetIdAdded' });
		tick();

		expect(modal.present).toHaveBeenCalled();
		expect(serviceMobilityAssetPageMock.prototype.getAll).toHaveBeenCalled();
		expect(component.currentItems).toEqual([MobilityAssetOne,MobilityAssetTwo,MobilityAssetThree]);
		expect(component.items).toEqual([MobilityAssetOne,MobilityAssetTwo,MobilityAssetThree]);
		expect(LoadingMock.prototype.dismiss).toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).toHaveBeenCalledWith({
			title: 'Added MobilityAsset',
			subTitle: 'assetIdAdded has been added',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).toHaveBeenCalled();

	}));

	it('should handle add MobilityAsset form dismissal', fakeAsync(() => {
		const modalCtrl = fixture.debugElement.injector.get(ModalController);
		const modal = (<ModalControllerMock>(<any>modalCtrl)).presentableRef;

		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(AlertControllerMock.prototype,'create').and.returnValue(alertMock);
		spyOn(AlertMock.prototype,'present');
		spyOn(modalCtrl, 'create').and.callThrough();
		spyOn(modal, 'present').and.callThrough();

		component.addAsset();
		tick();

		modal.dismiss({});
		tick();

		expect(modal.present).toHaveBeenCalled();
		expect(component.currentItems).not.toEqual([MobilityAssetOne,MobilityAssetTwo,MobilityAssetThree]);
		expect(component.items).not.toEqual([MobilityAssetOne,MobilityAssetTwo,MobilityAssetThree]);
		expect(LoadingMock.prototype.dismiss).not.toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).not.toHaveBeenCalledWith({
			title: 'Added MobilityAsset',
			subTitle: 'assetIdAdded has been added',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).not.toHaveBeenCalled();

	}));



	it('should get all MobilityAsset assets after an update MobilityAsset form is completed', fakeAsync(() => {
		const modalCtrl = fixture.debugElement.injector.get(ModalController);
		const modal = (<ModalControllerMock>(<any>modalCtrl)).presentableRef;

		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(AlertControllerMock.prototype,'create').and.returnValue(alertMock);
		spyOn(AlertMock.prototype,'present');
		spyOn(modalCtrl, 'create').and.callThrough();
		spyOn(modal, 'present').and.callThrough();

		component.updateAsset('value');
		tick();

		modal.dismiss({ loading: new LoadingMock(), assetId: 'assetIdAdded' });
		tick();

		expect(modal.present).toHaveBeenCalled();
		expect(serviceMobilityAssetPageMock.prototype.getAll).toHaveBeenCalled();
		expect(component.currentItems).toEqual([MobilityAssetOne,MobilityAssetTwo,MobilityAssetThree]);
		expect(component.items).toEqual([MobilityAssetOne,MobilityAssetTwo,MobilityAssetThree]);
		expect(LoadingMock.prototype.dismiss).toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).toHaveBeenCalledWith({
			title: 'Updated MobilityAsset',
			subTitle: 'assetIdAdded has been updated',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).toHaveBeenCalled();

	}));

	it('should handle update MobilityAsset form dismissal', fakeAsync(() => {
		const modalCtrl = fixture.debugElement.injector.get(ModalController);
		const modal = (<ModalControllerMock>(<any>modalCtrl)).presentableRef;

		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(AlertControllerMock.prototype,'create').and.returnValue(alertMock);
		spyOn(AlertMock.prototype,'present');
		spyOn(modalCtrl, 'create').and.callThrough();
		spyOn(modal, 'present').and.callThrough();

		component.updateAsset('value');
		tick();

		modal.dismiss({});
		tick();

		expect(modal.present).toHaveBeenCalled();
		expect(component.currentItems).not.toEqual([MobilityAssetOne,MobilityAssetTwo,MobilityAssetThree]);
		expect(component.items).not.toEqual([MobilityAssetOne,MobilityAssetTwo,MobilityAssetThree]);
		expect(LoadingMock.prototype.dismiss).not.toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).not.toHaveBeenCalledWith({
			title: 'Updated MobilityAsset',
			subTitle: 'assetIdAdded has been updated',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).not.toHaveBeenCalled();

	}));


});
