import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AlertController, LoadingController, NavParams, ModalController, IonicModule } from 'ionic-angular';
import { By } from '@angular/platform-browser';
import { OperatorPage} from './Operator.component';
import { OperatorForm } from './Operator.form.component';
import { OperatorService } from '../../../services/participants/Operator/Operator.service';
import { Operator} from '../../../org.urbanstack';
import { ParticipantViewPage } from '../../participant-view/participant-view.component';


let OperatorOne = new Operator();
OperatorOne.email = "Operator1"
let OperatorTwo = new Operator();
OperatorTwo.email = "Operator2"
let OperatorThree = new Operator();
OperatorThree.email = "Operator3"

class serviceOperatorPageMock{
	getAll(){
		return new Promise((resolve,reject)=>{
			resolve([OperatorOne,OperatorTwo,OperatorThree]);
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

describe('OperatorPage', () => {
	let fixture;
	let component;
	let loadingMock = new LoadingMock();
	let alertMock = new AlertMock();
	let modalMock = new ModalMock();

  	beforeEach(async(() => {

    	TestBed.configureTestingModule({
			declarations: [
				OperatorPage
			],
			imports: [
				IonicModule.forRoot(OperatorPage)
			],
			providers: [
				{ provide: NavParams },
				{ provide: AlertController, useClass: AlertControllerMock },
				{ provide: LoadingController, useClass: LoadingControllerMock },
				{ provide: ModalController, useClass: ModalControllerMock },
				{ provide: OperatorService, useClass:serviceOperatorPageMock }
			]
    	})
  	}));

  	beforeEach(() => {
		spyOn(serviceOperatorPageMock.prototype,'getAll').and.callThrough();
    	fixture = TestBed.createComponent(OperatorPage);
    	component = fixture.componentInstance;
  	});

  	it('should create OperatorPage component', () => {
		expect(component instanceof OperatorPage).toBe(true);
	});

	it('should have correct title',() => {
		let title = fixture.debugElement.query(By.css('ion-title'));
		fixture.detectChanges();
		expect(title.nativeElement.textContent).toContain('Operator');
	});

	it('should return Operator participants', fakeAsync(() => {
		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');

		component.ionViewWillEnter();
		tick();

		expect(component.currentItems.length).toEqual(3);
		expect(component.items.length).toEqual(3);
	}));

	it('Operator participants should be a Operator type', fakeAsync(() => {
		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');

		component.ionViewWillEnter();
		tick();

		expect(component.currentItems[0] instanceof Operator).toBe(true);
		expect(component.currentItems[1] instanceof Operator).toBe(true);
		expect(component.currentItems[2] instanceof Operator).toBe(true);
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

		expect(component.currentItems).toEqual([OperatorOne,OperatorTwo,OperatorThree]);

	}));

	it('should get some items when there is partially matching search text', fakeAsync(() => {
		let ev = {target:{value:"3"}};
		component.getItems(ev);
		tick();

		expect(component.items).toEqual([OperatorThree]);

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

		expect(component.currentItems).toEqual([OperatorOne,OperatorTwo,OperatorThree]);
		expect(component.items).toEqual([OperatorOne,OperatorTwo,OperatorThree]);
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
				participantId: participantIdentifier, participantType: 'Operator'
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
			OperatorForm, {
				participantId: 'email',
				participantType: 'Operator',
				properties: [{"name":"email","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"name","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"phoneNo","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]}],
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
			OperatorForm, {
				participantId: participantIdentifier,
				participantType: 'Operator',
				properties: [{"name":"email","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"name","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"phoneNo","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]}],
				formType: 'Update'
			}
		)
		expect(ModalMock.prototype.present).toHaveBeenCalled();
		expect(ModalMock.prototype.onDidDismiss).toHaveBeenCalled();

	}));

	it('should get all Operator participants after an add Operator form is completed', fakeAsync(() => {
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
		expect(serviceOperatorPageMock.prototype.getAll).toHaveBeenCalled();
		expect(component.currentItems).toEqual([OperatorOne,OperatorTwo,OperatorThree]);
		expect(component.items).toEqual([OperatorOne,OperatorTwo,OperatorThree]);
		expect(LoadingMock.prototype.dismiss).toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).toHaveBeenCalledWith({
			title: 'Added Operator',
			subTitle: 'participantIdAdded has been added',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).toHaveBeenCalled();

	}));

	it('should handle add Operator form dismissal', fakeAsync(() => {
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
		expect(component.currentItems).not.toEqual([OperatorOne,OperatorTwo,OperatorThree]);
		expect(component.items).not.toEqual([OperatorOne,OperatorTwo,OperatorThree]);
		expect(LoadingMock.prototype.dismiss).not.toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).not.toHaveBeenCalledWith({
			title: 'Added Operator',
			subTitle: 'participantIdAdded has been added',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).not.toHaveBeenCalled();

	}));



	it('should get all Operator participants after an update Operator form is completed', fakeAsync(() => {
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
		expect(serviceOperatorPageMock.prototype.getAll).toHaveBeenCalled();
		expect(component.currentItems).toEqual([OperatorOne,OperatorTwo,OperatorThree]);
		expect(component.items).toEqual([OperatorOne,OperatorTwo,OperatorThree]);
		expect(LoadingMock.prototype.dismiss).toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).toHaveBeenCalledWith({
			title: 'Updated Operator',
			subTitle: 'participantIdAdded has been updated',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).toHaveBeenCalled();

	}));

	it('should handle update Operator form dismissal', fakeAsync(() => {
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
		expect(component.currentItems).not.toEqual([OperatorOne,OperatorTwo,OperatorThree]);
		expect(component.items).not.toEqual([OperatorOne,OperatorTwo,OperatorThree]);
		expect(LoadingMock.prototype.dismiss).not.toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).not.toHaveBeenCalledWith({
			title: 'Updated Operator',
			subTitle: 'participantIdAdded has been updated',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).not.toHaveBeenCalled();

	}));

});
