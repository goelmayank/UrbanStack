import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AlertController, LoadingController, NavParams, ModalController, IonicModule } from 'ionic-angular';
import { By } from '@angular/platform-browser';
import { QRPassPage} from './QRPass.component';
import { QRPassForm } from './QRPass.form.component'
import { QRPassService } from '../../../services/assets/QRPass/QRPass.service';
import { QRPass} from '../../../org.urbanstack';
import { AssetViewPage } from '../../asset-view/asset-view.component';


let QRPassOne = new QRPass();
QRPassOne.QRPassId = "QRPass1"
let QRPassTwo = new QRPass();
QRPassTwo.QRPassId = "QRPass2"
let QRPassThree = new QRPass();
QRPassThree.QRPassId = "QRPass3"

class serviceQRPassPageMock{
	getAll(){
		return new Promise((resolve,reject)=>{
			resolve([QRPassOne,QRPassTwo,QRPassThree]);
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



describe('QRPassPage', () => {
	let fixture;
	let component;
	let loadingMock = new LoadingMock();
	let alertMock = new AlertMock();
	let modalMock = new ModalMock();

  	beforeEach(async(() => {

    	TestBed.configureTestingModule({
			declarations: [
				QRPassPage
			],
			imports: [
				IonicModule.forRoot(QRPassPage)
			],
			providers: [
				{ provide: NavParams },
				{ provide: AlertController, useClass: AlertControllerMock },
				{ provide: LoadingController, useClass: LoadingControllerMock },
				{ provide: ModalController, useClass: ModalControllerMock },
				{ provide: QRPassService, useClass:serviceQRPassPageMock }
			]
    	})
  	}));

  	beforeEach(() => {
		spyOn(serviceQRPassPageMock.prototype,'getAll').and.callThrough();
    	fixture = TestBed.createComponent(QRPassPage);
    	component = fixture.componentInstance;
  	});

  	it('should create QRPassPage component', () => {
		expect(component instanceof QRPassPage).toBe(true);
	});

	it('should have correct title',() => {
		let title = fixture.debugElement.query(By.css('ion-title'));
		fixture.detectChanges();
		expect(title.nativeElement.textContent).toContain('QRPass');
	});

	it('should return QRPass assets', fakeAsync(() => {
		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');

		component.ionViewWillEnter();
		tick();

		expect(component.currentItems.length).toEqual(3);
		expect(component.items.length).toEqual(3);
	}));

	it('QRPass assets should be a QRPass type', fakeAsync(() => {
		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');

		component.ionViewWillEnter();
		tick();

		expect(component.currentItems[0] instanceof QRPass).toBe(true);
		expect(component.currentItems[1] instanceof QRPass).toBe(true);
		expect(component.currentItems[2] instanceof QRPass).toBe(true);
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

		expect(component.currentItems).toEqual([QRPassOne,QRPassTwo,QRPassThree]);

	}));

	it('should get some items when there is partially matching search text', fakeAsync(() => {
		let ev = {target:{value:"3"}};
		component.getItems(ev);
		tick();

		expect(component.items).toEqual([QRPassThree]);

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

		expect(component.currentItems).toEqual([QRPassOne,QRPassTwo,QRPassThree]);
		expect(component.items).toEqual([QRPassOne,QRPassTwo,QRPassThree]);
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
				assetId: assetIdentifier, assetType: 'QRPass'
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
			QRPassForm, {
				assetType: 'QRPass',
				properties: [{"name":"QRPassId","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"creator","type":"Passenger","optional":false,"primitive":false,"array":false,"enum":false,"enumValues":[]},{"name":"carrier","type":"TransitProvider","optional":true,"primitive":false,"array":false,"enum":false,"enumValues":[]},{"name":"origin","type":"Location","optional":true,"primitive":false,"array":false,"enum":false,"enumValues":[]},{"name":"destination","type":"Location","optional":true,"primitive":false,"array":false,"enum":false,"enumValues":[]}],
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
			QRPassForm, {
				assetId: assetIdentifier,
				assetType: 'QRPass',
				properties: [{"name":"QRPassId","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"creator","type":"Passenger","optional":false,"primitive":false,"array":false,"enum":false,"enumValues":[]},{"name":"carrier","type":"TransitProvider","optional":true,"primitive":false,"array":false,"enum":false,"enumValues":[]},{"name":"origin","type":"Location","optional":true,"primitive":false,"array":false,"enum":false,"enumValues":[]},{"name":"destination","type":"Location","optional":true,"primitive":false,"array":false,"enum":false,"enumValues":[]}],
				formType: 'Update'
			}
		)
		expect(ModalMock.prototype.present).toHaveBeenCalled();
		expect(ModalMock.prototype.onDidDismiss).toHaveBeenCalled();

	}));


	it('should get all QRPass assets after an add QRPass form is completed', fakeAsync(() => {
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
		expect(serviceQRPassPageMock.prototype.getAll).toHaveBeenCalled();
		expect(component.currentItems).toEqual([QRPassOne,QRPassTwo,QRPassThree]);
		expect(component.items).toEqual([QRPassOne,QRPassTwo,QRPassThree]);
		expect(LoadingMock.prototype.dismiss).toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).toHaveBeenCalledWith({
			title: 'Added QRPass',
			subTitle: 'assetIdAdded has been added',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).toHaveBeenCalled();

	}));

	it('should handle add QRPass form dismissal', fakeAsync(() => {
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
		expect(component.currentItems).not.toEqual([QRPassOne,QRPassTwo,QRPassThree]);
		expect(component.items).not.toEqual([QRPassOne,QRPassTwo,QRPassThree]);
		expect(LoadingMock.prototype.dismiss).not.toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).not.toHaveBeenCalledWith({
			title: 'Added QRPass',
			subTitle: 'assetIdAdded has been added',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).not.toHaveBeenCalled();

	}));



	it('should get all QRPass assets after an update QRPass form is completed', fakeAsync(() => {
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
		expect(serviceQRPassPageMock.prototype.getAll).toHaveBeenCalled();
		expect(component.currentItems).toEqual([QRPassOne,QRPassTwo,QRPassThree]);
		expect(component.items).toEqual([QRPassOne,QRPassTwo,QRPassThree]);
		expect(LoadingMock.prototype.dismiss).toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).toHaveBeenCalledWith({
			title: 'Updated QRPass',
			subTitle: 'assetIdAdded has been updated',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).toHaveBeenCalled();

	}));

	it('should handle update QRPass form dismissal', fakeAsync(() => {
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
		expect(component.currentItems).not.toEqual([QRPassOne,QRPassTwo,QRPassThree]);
		expect(component.items).not.toEqual([QRPassOne,QRPassTwo,QRPassThree]);
		expect(LoadingMock.prototype.dismiss).not.toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).not.toHaveBeenCalledWith({
			title: 'Updated QRPass',
			subTitle: 'assetIdAdded has been updated',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).not.toHaveBeenCalled();

	}));


});
