import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ViewController, LoadingController, NavParams, IonicModule } from 'ionic-angular';
import { FormBuilder } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { PassengerForm } from './Passenger.form.component'
import { PassengerService } from '../../../services/participants/Passenger/Passenger.service';
import { Passenger} from '../../../org.urbanstack';
import { mockView } from "ionic-angular/util/mock-providers";


let PassengerOne = new Passenger();
PassengerOne.email = "Passenger1";


class servicePassenger{
	get(participantId){
		return new Promise((resolve,reject)=>{
			resolve(PassengerOne);
		});
	}
	add(form){
		return new Promise((resolve,reject) => {
			resolve();
		})
	}

	update(identifierValue, form){
		return;
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

class FormBuilderMock{
	group(obj){
		return new FormMock();
	}
}

class FormMock{
	value;

	constructor(){
		this.value = {email:'test'}
	}
	get(key){
		return new FormObjectMock();
	}
	setValue(value){
		return;
	}
	_updateTreeValidity(){
		return;
	}
	_registerOnCollectionChange(){
		return;
	}
}

class FormObjectMock{
	enable(){
		return;
	}
	disable(){
		return;
	}
}

let participantId;
let participantType;
let properties;
let formType;

class NavParamsMock{
	get(value){
		if(value == 'participantId'){
			return participantId;
		}
		else if(value == 'properties'){
			return properties;
		}
		else if(value == 'formType'){
			return formType;
		}
		else{
			return participantType;
		}
	}
}

describe('PassengerForm', () => {
	let fixture;
	let component;

	let loadingMock = new LoadingMock();
	let formMock = new FormMock();
	let formObjectMock = new FormObjectMock();
	let ViewControllerMock = mockView();

  	beforeEach(async(() => {

    	TestBed.configureTestingModule({
			declarations: [
				PassengerForm
			],
			imports: [
				IonicModule.forRoot(PassengerForm)
			],
			providers: [
				{ provide: NavParams, useClass: NavParamsMock },
				{ provide: FormBuilder, useClass: FormBuilderMock },
				{ provide: LoadingController, useClass: LoadingControllerMock },
				{ provide: ViewController, useValue: ViewControllerMock },
				{ provide: PassengerService, useClass:servicePassenger }
			]
    	})
  	}));

  	beforeEach(() => {
		participantType = 'Passenger';
		spyOn(servicePassenger.prototype,'get').and.callThrough();
    	fixture = TestBed.createComponent(PassengerForm);
    	component = fixture.componentInstance;
  	});

  	it('should create PassengerForm component', () => {
		expect(component instanceof PassengerForm).toBe(true);
	});

	it('should have correct participant identifier property', () => {
		expect(component.participantIdentifierProperty).toEqual('email');
	})

	it('should have correct title',() => {
		component.formType = 'Add';
		let expectedTitle = 'Add Passenger';
		let title = fixture.debugElement.query(By.css('ion-title'));
		fixture.detectChanges();
		expect(title.nativeElement.textContent).toContain(expectedTitle);
	});

	it('should detect if update form is opened', fakeAsync(() => {
		component.formType = 'Update';
		component.participantId = 'Passenger001'
		fixture.detectChanges();

		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');

		spyOn(FormBuilderMock.prototype,'group').and.returnValue(formMock);
		spyOn(FormMock.prototype,'setValue');
		spyOn(FormMock.prototype,'get').and.returnValue(formObjectMock);
		spyOn(FormObjectMock.prototype,'disable');

		component.ionViewWillEnter();
		tick();

		expect(LoadingControllerMock.prototype.create).toHaveBeenCalledWith({
			content: 'Fetching Passenger001'
		});

		expect(LoadingMock.prototype.present).toHaveBeenCalled();

		expect(FormMock.prototype.get).toHaveBeenCalledWith('email');
		expect(FormObjectMock.prototype.disable).toHaveBeenCalled();
		expect(LoadingMock.prototype.dismiss).toHaveBeenCalled();
	}));

	it('should detect if add form is opened', fakeAsync(() => {
		component.formType = 'Add';
		fixture.detectChanges();


		spyOn(FormBuilderMock.prototype,'group').and.returnValue(formMock);
		spyOn(FormMock.prototype,'setValue');

		spyOn(FormMock.prototype,'get').and.returnValue(formObjectMock);
		spyOn(FormObjectMock.prototype,'enable');
		component.ionViewWillEnter();
		tick();


		expect(FormMock.prototype.get).toHaveBeenCalledWith('email');

		expect(FormObjectMock.prototype.enable).toHaveBeenCalled();
	}));


	it('should submit an add form', fakeAsync(() => {
		component.formType = 'Add';
		fixture.detectChanges();

		spyOn(component,'addParticipant');

		component.submit();
		tick();

		expect(component.addParticipant).toHaveBeenCalled();

	}));

	it('should submit an update form', fakeAsync(() => {
		component.formType = 'Update';
		fixture.detectChanges();

		spyOn(component,'updateParticipant');

		component.submit();
		tick();

		expect(component.updateParticipant).toHaveBeenCalled();

	}));

	it('should add an participant', fakeAsync(() => {
		component.formType = 'Add';
		fixture.detectChanges();

		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');
		spyOn(servicePassenger.prototype,'add').and.returnValue(new Promise((resolve,reject)=>{resolve()}));
		spyOn(ViewControllerMock,'dismiss');
		component.addParticipant();
		tick();

		expect(LoadingControllerMock.prototype.create).toHaveBeenCalledWith({
			content: 'Adding Passenger...'
		});

		expect(LoadingMock.prototype.present).toHaveBeenCalled();
		expect(servicePassenger.prototype.add).toHaveBeenCalled();
		expect(ViewControllerMock.dismiss).toHaveBeenCalled();
	}));


	it('should throw an error for invalid add participant', fakeAsync(() => {
		component.formType = 'Add';
		fixture.detectChanges();

		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');
		let json = JSON.stringify({error:{message:'Some error'}});
		spyOn(servicePassenger.prototype,'add').and.returnValue(new Promise((resolve,reject) => {
			reject({_body:json})
		}));
		spyOn(ViewControllerMock,'dismiss');
		component.addParticipant();
		tick();

		expect(LoadingControllerMock.prototype.create).toHaveBeenCalledWith({
			content: 'Adding Passenger...'
		});

		expect(LoadingMock.prototype.present).toHaveBeenCalled();
		expect(servicePassenger.prototype.add).toHaveBeenCalled();
		expect(LoadingMock.prototype.dismiss).toHaveBeenCalled();
		expect(component.error).toEqual('Some error');
	}));



	it('should update an participant', fakeAsync(() => {
		component.formType = 'Update';
		fixture.detectChanges();

		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');
		spyOn(servicePassenger.prototype,'update').and.returnValue(new Promise((resolve,reject)=>{resolve()}));
		spyOn(ViewControllerMock,'dismiss');
		spyOn(FormMock.prototype,'get').and.returnValue(formObjectMock);
		spyOn(FormObjectMock.prototype,'enable');
		component.updateParticipant();
		tick();

		expect(LoadingControllerMock.prototype.create).toHaveBeenCalledWith({
			content: 'Updating Passenger...'
		});

		expect(LoadingMock.prototype.present).toHaveBeenCalled();
		expect(servicePassenger.prototype.update).toHaveBeenCalled();
		expect(ViewControllerMock.dismiss).toHaveBeenCalled();
	}));


	it('should throw an error for invalid update participant', fakeAsync(() => {
		component.formType = 'Update';
		fixture.detectChanges();

		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');
		let json = JSON.stringify({error:{message:'Some error'}});
		spyOn(servicePassenger.prototype,'update').and.returnValue(new Promise((resolve,reject) => {
			reject({_body:json})
		}));
		spyOn(ViewControllerMock,'dismiss');
		component.updateParticipant();
		tick();

		expect(LoadingControllerMock.prototype.create).toHaveBeenCalledWith({
			content: 'Updating Passenger...'
		});

		expect(LoadingMock.prototype.present).toHaveBeenCalled();
		expect(servicePassenger.prototype.update).toHaveBeenCalled();
		expect(LoadingMock.prototype.dismiss).toHaveBeenCalled();
		expect(component.error).toEqual('Some error');
	}));

	it('should be able to dismiss form', fakeAsync(() => {
		spyOn(ViewControllerMock,'dismiss');
		component.dismiss();
		tick();
		expect(ViewControllerMock.dismiss).toHaveBeenCalled();
	}));

});
