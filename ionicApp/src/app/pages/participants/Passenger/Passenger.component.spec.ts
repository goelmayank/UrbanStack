import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AlertController, LoadingController, NavParams, ModalController, IonicModule } from 'ionic-angular';
import { By } from '@angular/platform-browser';
import { PassengerPage} from './Passenger.component';
import { PassengerForm } from './Passenger.form.component';
import { PassengerService } from '../../../services/participants/Passenger/Passenger.service';
import { Passenger} from '../../../org.urbanstack';
import { ParticipantViewPage } from '../../participant-view/participant-view.component';


let PassengerOne = new Passenger();
PassengerOne.email = "Passenger1"
let PassengerTwo = new Passenger();
PassengerTwo.email = "Passenger2"
let PassengerThree = new Passenger();
PassengerThree.email = "Passenger3"

class servicePassengerPageMock{
	getAll(){
		return new Promise((resolve,reject)=>{
			resolve([PassengerOne,PassengerTwo,PassengerThree]);
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

describe('PassengerPage', () => {
	let fixture;
	let component;
	let loadingMock = new LoadingMock();
	let alertMock = new AlertMock();
	let modalMock = new ModalMock();

  	beforeEach(async(() => {

    	TestBed.configureTestingModule({
			declarations: [
				PassengerPage
			],
			imports: [
				IonicModule.forRoot(PassengerPage)
			],
			providers: [
				{ provide: NavParams },
				{ provide: AlertController, useClass: AlertControllerMock },
				{ provide: LoadingController, useClass: LoadingControllerMock },
				{ provide: ModalController, useClass: ModalControllerMock },
				{ provide: PassengerService, useClass:servicePassengerPageMock }
			]
    	})
  	}));

  	beforeEach(() => {
		spyOn(servicePassengerPageMock.prototype,'getAll').and.callThrough();
    	fixture = TestBed.createComponent(PassengerPage);
    	component = fixture.componentInstance;
  	});

  	it('should create PassengerPage component', () => {
		expect(component instanceof PassengerPage).toBe(true);
	});

	it('should have correct title',() => {
		let title = fixture.debugElement.query(By.css('ion-title'));
		fixture.detectChanges();
		expect(title.nativeElement.textContent).toContain('Passenger');
	});

	it('should return Passenger participants', fakeAsync(() => {
		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');

		component.ionViewWillEnter();
		tick();

		expect(component.currentItems.length).toEqual(3);
		expect(component.items.length).toEqual(3);
	}));

	it('Passenger participants should be a Passenger type', fakeAsync(() => {
		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');

		component.ionViewWillEnter();
		tick();

		expect(component.currentItems[0] instanceof Passenger).toBe(true);
		expect(component.currentItems[1] instanceof Passenger).toBe(true);
		expect(component.currentItems[2] instanceof Passenger).toBe(true);
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

		expect(component.currentItems).toEqual([PassengerOne,PassengerTwo,PassengerThree]);

	}));

	it('should get some items when there is partially matching search text', fakeAsync(() => {
		let ev = {target:{value:"3"}};
		component.getItems(ev);
		tick();

		expect(component.items).toEqual([PassengerThree]);

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

		expect(component.currentItems).toEqual([PassengerOne,PassengerTwo,PassengerThree]);
		expect(component.items).toEqual([PassengerOne,PassengerTwo,PassengerThree]);
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
				participantId: participantIdentifier, participantType: 'Passenger'
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
			PassengerForm, {
				participantId: 'email',
				participantType: 'Passenger',
				properties: [{"name":"qrpasses","type":"QRPass","optional":false,"primitive":false,"array":true,"enum":false,"enumValues":[]},{"name":"email","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"name","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"phoneNo","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]}],
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
			PassengerForm, {
				participantId: participantIdentifier,
				participantType: 'Passenger',
				properties: [{"name":"qrpasses","type":"QRPass","optional":false,"primitive":false,"array":true,"enum":false,"enumValues":[]},{"name":"email","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"name","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"phoneNo","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]}],
				formType: 'Update'
			}
		)
		expect(ModalMock.prototype.present).toHaveBeenCalled();
		expect(ModalMock.prototype.onDidDismiss).toHaveBeenCalled();

	}));

	it('should get all Passenger participants after an add Passenger form is completed', fakeAsync(() => {
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
		expect(servicePassengerPageMock.prototype.getAll).toHaveBeenCalled();
		expect(component.currentItems).toEqual([PassengerOne,PassengerTwo,PassengerThree]);
		expect(component.items).toEqual([PassengerOne,PassengerTwo,PassengerThree]);
		expect(LoadingMock.prototype.dismiss).toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).toHaveBeenCalledWith({
			title: 'Added Passenger',
			subTitle: 'participantIdAdded has been added',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).toHaveBeenCalled();

	}));

	it('should handle add Passenger form dismissal', fakeAsync(() => {
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
		expect(component.currentItems).not.toEqual([PassengerOne,PassengerTwo,PassengerThree]);
		expect(component.items).not.toEqual([PassengerOne,PassengerTwo,PassengerThree]);
		expect(LoadingMock.prototype.dismiss).not.toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).not.toHaveBeenCalledWith({
			title: 'Added Passenger',
			subTitle: 'participantIdAdded has been added',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).not.toHaveBeenCalled();

	}));



	it('should get all Passenger participants after an update Passenger form is completed', fakeAsync(() => {
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
		expect(servicePassengerPageMock.prototype.getAll).toHaveBeenCalled();
		expect(component.currentItems).toEqual([PassengerOne,PassengerTwo,PassengerThree]);
		expect(component.items).toEqual([PassengerOne,PassengerTwo,PassengerThree]);
		expect(LoadingMock.prototype.dismiss).toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).toHaveBeenCalledWith({
			title: 'Updated Passenger',
			subTitle: 'participantIdAdded has been updated',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).toHaveBeenCalled();

	}));

	it('should handle update Passenger form dismissal', fakeAsync(() => {
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
		expect(component.currentItems).not.toEqual([PassengerOne,PassengerTwo,PassengerThree]);
		expect(component.items).not.toEqual([PassengerOne,PassengerTwo,PassengerThree]);
		expect(LoadingMock.prototype.dismiss).not.toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).not.toHaveBeenCalledWith({
			title: 'Updated Passenger',
			subTitle: 'participantIdAdded has been updated',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).not.toHaveBeenCalled();

	}));

});
