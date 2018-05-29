import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AlertController, LoadingController, NavParams, ModalController, IonicModule } from 'ionic-angular';
import { By } from '@angular/platform-browser';
import { TransitProviderPage} from './TransitProvider.component';
import { TransitProviderForm } from './TransitProvider.form.component';
import { TransitProviderService } from '../../../services/participants/TransitProvider/TransitProvider.service';
import { TransitProvider} from '../../../org.urbanstack';
import { ParticipantViewPage } from '../../participant-view/participant-view.component';


let TransitProviderOne = new TransitProvider();
TransitProviderOne.email = "TransitProvider1"
let TransitProviderTwo = new TransitProvider();
TransitProviderTwo.email = "TransitProvider2"
let TransitProviderThree = new TransitProvider();
TransitProviderThree.email = "TransitProvider3"

class serviceTransitProviderPageMock{
	getAll(){
		return new Promise((resolve,reject)=>{
			resolve([TransitProviderOne,TransitProviderTwo,TransitProviderThree]);
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

describe('TransitProviderPage', () => {
	let fixture;
	let component;
	let loadingMock = new LoadingMock();
	let alertMock = new AlertMock();
	let modalMock = new ModalMock();

  	beforeEach(async(() => {

    	TestBed.configureTestingModule({
			declarations: [
				TransitProviderPage
			],
			imports: [
				IonicModule.forRoot(TransitProviderPage)
			],
			providers: [
				{ provide: NavParams },
				{ provide: AlertController, useClass: AlertControllerMock },
				{ provide: LoadingController, useClass: LoadingControllerMock },
				{ provide: ModalController, useClass: ModalControllerMock },
				{ provide: TransitProviderService, useClass:serviceTransitProviderPageMock }
			]
    	})
  	}));

  	beforeEach(() => {
		spyOn(serviceTransitProviderPageMock.prototype,'getAll').and.callThrough();
    	fixture = TestBed.createComponent(TransitProviderPage);
    	component = fixture.componentInstance;
  	});

  	it('should create TransitProviderPage component', () => {
		expect(component instanceof TransitProviderPage).toBe(true);
	});

	it('should have correct title',() => {
		let title = fixture.debugElement.query(By.css('ion-title'));
		fixture.detectChanges();
		expect(title.nativeElement.textContent).toContain('TransitProvider');
	});

	it('should return TransitProvider participants', fakeAsync(() => {
		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');

		component.ionViewWillEnter();
		tick();

		expect(component.currentItems.length).toEqual(3);
		expect(component.items.length).toEqual(3);
	}));

	it('TransitProvider participants should be a TransitProvider type', fakeAsync(() => {
		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');

		component.ionViewWillEnter();
		tick();

		expect(component.currentItems[0] instanceof TransitProvider).toBe(true);
		expect(component.currentItems[1] instanceof TransitProvider).toBe(true);
		expect(component.currentItems[2] instanceof TransitProvider).toBe(true);
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

		expect(component.currentItems).toEqual([TransitProviderOne,TransitProviderTwo,TransitProviderThree]);

	}));

	it('should get some items when there is partially matching search text', fakeAsync(() => {
		let ev = {target:{value:"3"}};
		component.getItems(ev);
		tick();

		expect(component.items).toEqual([TransitProviderThree]);

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

		expect(component.currentItems).toEqual([TransitProviderOne,TransitProviderTwo,TransitProviderThree]);
		expect(component.items).toEqual([TransitProviderOne,TransitProviderTwo,TransitProviderThree]);
		expect(refresher.complete).toHaveBeenCalled();

	}));

	it('should open model to view participant', fakeAsync(() => {
		spyOn(ModalControllerMock.prototype,'create').and.returnValue(modalMock);
		spyOn(ModalMock.prototype,'present');
		let participantIdentifier = 'participantIdentifier';
		component.viewParticipant(participantIdentifier);
		tick();
		expect(ModalControllerMock.prototype.create).toHaveBeenCalledWith(
			ParticipantViewPage, {
				participantId: participantIdentifier, participantType: 'TransitProvider'
			}
		)
		expect(ModalMock.prototype.present).toHaveBeenCalled();
	}));

	it('should show delete participant alert', fakeAsync(() => {
		spyOn(AlertControllerMock.prototype,'create').and.returnValue(alertMock);
		spyOn(AlertMock.prototype,'present');
		let participantIdentifier = 'participantIdentifier'
		component.deleteParticipant(participantIdentifier);
		tick();
		expect(AlertMock.prototype.present).toHaveBeenCalled();
	}));

	it('should open model to add participant', fakeAsync(() => {
		spyOn(ModalControllerMock.prototype,'create').and.returnValue(modalMock);
		spyOn(ModalMock.prototype,'present');
		spyOn(ModalMock.prototype,'onDidDismiss');

		component.addParticipant();

		tick();

		expect(ModalControllerMock.prototype.create).toHaveBeenCalledWith(
			TransitProviderForm, {
				participantId: 'email',
				participantType: 'TransitProvider',
				properties: [{"name":"qrpasses","type":"QRPass","optional":false,"primitive":false,"array":true,"enum":false,"enumValues":[]},{"name":"locations","type":"Location","optional":true,"primitive":false,"array":true,"enum":false,"enumValues":[]},{"name":"mobilityassets","type":"MobilityAsset","optional":true,"primitive":false,"array":true,"enum":false,"enumValues":[]},{"name":"email","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"name","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"phoneNo","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]}],
				formType: 'Add'
			}
		)
		expect(ModalMock.prototype.present).toHaveBeenCalled();
		expect(ModalMock.prototype.onDidDismiss).toHaveBeenCalled();

	}));

	it('should open model to update participant', fakeAsync(() => {
		spyOn(ModalControllerMock.prototype,'create').and.returnValue(modalMock);
		spyOn(ModalMock.prototype,'present');
		spyOn(ModalMock.prototype,'onDidDismiss');
		let participantIdentifier = 'participantIdentifier';

		component.updateParticipant(participantIdentifier);

		tick();

		expect(ModalControllerMock.prototype.create).toHaveBeenCalledWith(
			TransitProviderForm, {
				participantId: participantIdentifier,
				participantType: 'TransitProvider',
				properties: [{"name":"qrpasses","type":"QRPass","optional":false,"primitive":false,"array":true,"enum":false,"enumValues":[]},{"name":"locations","type":"Location","optional":true,"primitive":false,"array":true,"enum":false,"enumValues":[]},{"name":"mobilityassets","type":"MobilityAsset","optional":true,"primitive":false,"array":true,"enum":false,"enumValues":[]},{"name":"email","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"name","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"phoneNo","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]}],
				formType: 'Update'
			}
		)
		expect(ModalMock.prototype.present).toHaveBeenCalled();
		expect(ModalMock.prototype.onDidDismiss).toHaveBeenCalled();

	}));

	it('should get all TransitProvider participants after an add TransitProvider form is completed', fakeAsync(() => {
		const modalCtrl = fixture.debugElement.injector.get(ModalController);
		const modal = (<ModalControllerMock>(<any>modalCtrl)).presentableRef;

		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(AlertControllerMock.prototype,'create').and.returnValue(alertMock);
		spyOn(AlertMock.prototype,'present');
		spyOn(modalCtrl, 'create').and.callThrough();
		spyOn(modal, 'present').and.callThrough();

		component.addParticipant();
		tick();

		modal.dismiss({ loading: new LoadingMock(), participantId: 'participantIdAdded' });
		tick();

		expect(modal.present).toHaveBeenCalled();
		expect(serviceTransitProviderPageMock.prototype.getAll).toHaveBeenCalled();
		expect(component.currentItems).toEqual([TransitProviderOne,TransitProviderTwo,TransitProviderThree]);
		expect(component.items).toEqual([TransitProviderOne,TransitProviderTwo,TransitProviderThree]);
		expect(LoadingMock.prototype.dismiss).toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).toHaveBeenCalledWith({
			title: 'Added TransitProvider',
			subTitle: 'participantIdAdded has been added',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).toHaveBeenCalled();

	}));

	it('should handle add TransitProvider form dismissal', fakeAsync(() => {
		const modalCtrl = fixture.debugElement.injector.get(ModalController);
		const modal = (<ModalControllerMock>(<any>modalCtrl)).presentableRef;

		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(AlertControllerMock.prototype,'create').and.returnValue(alertMock);
		spyOn(AlertMock.prototype,'present');
		spyOn(modalCtrl, 'create').and.callThrough();
		spyOn(modal, 'present').and.callThrough();

		component.addParticipant();
		tick();

		modal.dismiss({});
		tick();

		expect(modal.present).toHaveBeenCalled();
		expect(component.currentItems).not.toEqual([TransitProviderOne,TransitProviderTwo,TransitProviderThree]);
		expect(component.items).not.toEqual([TransitProviderOne,TransitProviderTwo,TransitProviderThree]);
		expect(LoadingMock.prototype.dismiss).not.toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).not.toHaveBeenCalledWith({
			title: 'Added TransitProvider',
			subTitle: 'participantIdAdded has been added',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).not.toHaveBeenCalled();

	}));



	it('should get all TransitProvider participants after an update TransitProvider form is completed', fakeAsync(() => {
		const modalCtrl = fixture.debugElement.injector.get(ModalController);
		const modal = (<ModalControllerMock>(<any>modalCtrl)).presentableRef;

		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(AlertControllerMock.prototype,'create').and.returnValue(alertMock);
		spyOn(AlertMock.prototype,'present');
		spyOn(modalCtrl, 'create').and.callThrough();
		spyOn(modal, 'present').and.callThrough();

		component.updateParticipant('value');
		tick();

		modal.dismiss({ loading: new LoadingMock(), participantId: 'participantIdAdded' });
		tick();

		expect(modal.present).toHaveBeenCalled();
		expect(serviceTransitProviderPageMock.prototype.getAll).toHaveBeenCalled();
		expect(component.currentItems).toEqual([TransitProviderOne,TransitProviderTwo,TransitProviderThree]);
		expect(component.items).toEqual([TransitProviderOne,TransitProviderTwo,TransitProviderThree]);
		expect(LoadingMock.prototype.dismiss).toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).toHaveBeenCalledWith({
			title: 'Updated TransitProvider',
			subTitle: 'participantIdAdded has been updated',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).toHaveBeenCalled();

	}));

	it('should handle update TransitProvider form dismissal', fakeAsync(() => {
		const modalCtrl = fixture.debugElement.injector.get(ModalController);
		const modal = (<ModalControllerMock>(<any>modalCtrl)).presentableRef;

		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(AlertControllerMock.prototype,'create').and.returnValue(alertMock);
		spyOn(AlertMock.prototype,'present');
		spyOn(modalCtrl, 'create').and.callThrough();
		spyOn(modal, 'present').and.callThrough();

		component.updateParticipant('value');
		tick();

		modal.dismiss({});
		tick();

		expect(modal.present).toHaveBeenCalled();
		expect(component.currentItems).not.toEqual([TransitProviderOne,TransitProviderTwo,TransitProviderThree]);
		expect(component.items).not.toEqual([TransitProviderOne,TransitProviderTwo,TransitProviderThree]);
		expect(LoadingMock.prototype.dismiss).not.toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).not.toHaveBeenCalledWith({
			title: 'Updated TransitProvider',
			subTitle: 'participantIdAdded has been updated',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).not.toHaveBeenCalled();

	}));

});
