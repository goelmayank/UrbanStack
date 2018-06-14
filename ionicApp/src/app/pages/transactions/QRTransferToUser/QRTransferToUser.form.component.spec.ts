import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ViewController, LoadingController, NavParams, IonicModule } from 'ionic-angular';
import { FormBuilder } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { QRTransferToUserForm } from './QRTransferToUser.form.component'
import { QRTransferToUserService } from '../../../services/transactions/QRTransferToUser/QRTransferToUser.service';
import { QRTransferToUser} from '../../../org.urbanstack';
import { mockView } from "ionic-angular/util/mock-providers";


let QRTransferToUserOne = new QRTransferToUser();
QRTransferToUserOne.transactionId = "QRTransferToUser1";


class serviceQRTransferToUser{
	get(transactionId){
		return new Promise((resolve,reject)=>{
			resolve(QRTransferToUserOne);
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
		this.value = {transactionId:'test'}
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

let transactionId;
let transactionType;
let properties = [];
let formType;

class NavParamsMock{
	get(value){
		if(value == 'transactionId'){
			return transactionId;
		}
		else if(value == 'properties'){
			return properties;
		}
		else if(value == 'formType'){
			return formType;
		}
		else{
			return transactionType;
		}
	}
}

describe('QRTransferToUserForm', () => {
	let fixture;
	let component;

	let loadingMock = new LoadingMock();
	let ViewControllerMock = mockView();

  	beforeEach(async(() => {

    	TestBed.configureTestingModule({
			declarations: [
				QRTransferToUserForm
			],
			imports: [
				IonicModule.forRoot(QRTransferToUserForm)
			],
			providers: [
				{ provide: NavParams, useClass: NavParamsMock },
				{ provide: FormBuilder, useClass: FormBuilderMock },
				{ provide: LoadingController, useClass: LoadingControllerMock },
				{ provide: ViewController, useValue: ViewControllerMock },
				{ provide: QRTransferToUserService, useClass:serviceQRTransferToUser }
			]
    	})
  	}));

  	beforeEach(() => {
		transactionType = 'QRTransferToUser';
    	fixture = TestBed.createComponent(QRTransferToUserForm);
    	component = fixture.componentInstance;
  	});

  	it('should create QRTransferToUserForm component', () => {
		expect(component instanceof QRTransferToUserForm).toBe(true);
	});

	it('should have correct title for QRTransferToUserForm',() => {
		component.formType = 'Add';
		let expectedTitle = 'Add QRTransferToUser';
		let title = fixture.debugElement.query(By.css('ion-title'));
		fixture.detectChanges();
		expect(title.nativeElement.textContent).toContain(expectedTitle);
	});


	it('should submit a QRTransferToUser transaction', fakeAsync(() => {
		component.formType = 'Add';
		fixture.detectChanges();

		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');
		spyOn(serviceQRTransferToUser.prototype,'add').and.returnValue(new Promise((resolve,reject)=>{resolve()}));
		spyOn(ViewControllerMock,'dismiss');
		component.addTransaction();
		tick();

		expect(LoadingControllerMock.prototype.create).toHaveBeenCalledWith({
			content: 'Adding QRTransferToUser...'
		});

		expect(LoadingMock.prototype.present).toHaveBeenCalled();
		expect(serviceQRTransferToUser.prototype.add).toHaveBeenCalled();
		expect(ViewControllerMock.dismiss).toHaveBeenCalled();
	}));


	it('should throw an error for an invalid QRTransferToUser transaction', fakeAsync(() => {
		component.formType = 'Add';
		fixture.detectChanges();

		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');
		let json = JSON.stringify({error:{message:'Some error'}});
		spyOn(serviceQRTransferToUser.prototype,'add').and.returnValue(new Promise((resolve,reject) => {
			reject({_body:json})
		}));
		spyOn(ViewControllerMock,'dismiss');
		component.addTransaction();
		tick();

		expect(LoadingControllerMock.prototype.create).toHaveBeenCalledWith({
			content: 'Adding QRTransferToUser...'
		});

		expect(LoadingMock.prototype.present).toHaveBeenCalled();
		expect(serviceQRTransferToUser.prototype.add).toHaveBeenCalled();
		expect(LoadingMock.prototype.dismiss).toHaveBeenCalled();
		expect(component.error).toEqual('Some error');
	}));

	it('should be able to dismiss QRTransferToUserForm component', fakeAsync(() => {
		spyOn(ViewControllerMock,'dismiss');
		component.dismiss();
		tick();
		expect(ViewControllerMock.dismiss).toHaveBeenCalled();
	}));

});
