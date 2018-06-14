import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AlertController, LoadingController, NavParams, ModalController, IonicModule } from 'ionic-angular';
import { By } from '@angular/platform-browser';
import { QRTransferToUserPage} from './QRTransferToUser.component';
import { QRTransferToUserForm } from './QRTransferToUser.form.component';
import { QRTransferToUserService } from '../../../services/transactions/QRTransferToUser/QRTransferToUser.service';
import { QRTransferToUser} from '../../../org.urbanstack';
import { TransactionViewPage } from '../../transaction-view/transaction-view.component';


let QRTransferToUserOne = new QRTransferToUser();
QRTransferToUserOne.transactionId = "QRTransferToUser1"
let QRTransferToUserTwo = new QRTransferToUser();
QRTransferToUserTwo.transactionId = "QRTransferToUser2"
let QRTransferToUserThree = new QRTransferToUser();
QRTransferToUserThree.transactionId = "QRTransferToUser3"

class serviceQRTransferToUserPageMock{
	getAll(){
		return new Promise((resolve,reject)=>{
			resolve([QRTransferToUserOne,QRTransferToUserTwo,QRTransferToUserThree]);
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

describe('QRTransferToUserPage', () => {
	let fixture;
	let component;
	let loadingMock = new LoadingMock();
	let alertMock = new AlertMock();
	let modalMock = new ModalMock();

  	beforeEach(async(() => {

    	TestBed.configureTestingModule({
			declarations: [
				QRTransferToUserPage
			],
			imports: [
				IonicModule.forRoot(QRTransferToUserPage)
			],
			providers: [
				{ provide: NavParams },
				{ provide: AlertController, useClass: AlertControllerMock },
				{ provide: LoadingController, useClass: LoadingControllerMock },
				{ provide: ModalController, useClass: ModalControllerMock },
				{ provide: QRTransferToUserService, useClass:serviceQRTransferToUserPageMock }
			]
    	})
  	}));

  	beforeEach(() => {
		spyOn(serviceQRTransferToUserPageMock.prototype,'getAll').and.callThrough();
    	fixture = TestBed.createComponent(QRTransferToUserPage);
    	component = fixture.componentInstance;
  	});

  	it('should create QRTransferToUserPage component', () => {
		expect(component instanceof QRTransferToUserPage).toBe(true);
	});

	it('should have correct title',() => {
		let title = fixture.debugElement.query(By.css('ion-title'));
		fixture.detectChanges();
		expect(title.nativeElement.textContent).toContain('QRTransferToUser');
	});

	it('should return QRTransferToUser transactions', fakeAsync(() => {
		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');

		component.ionViewWillEnter();
		tick();

		expect(component.currentTransactions.length).toEqual(3);
		expect(component.transactions.length).toEqual(3);
	}));

	it('QRTransferToUser transactions should be a QRTransferToUser type', fakeAsync(() => {
		spyOn(LoadingControllerMock.prototype,'create').and.returnValue(loadingMock);
		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(LoadingMock.prototype,'present');

		component.ionViewWillEnter();
		tick();

		expect(component.currentTransactions[0] instanceof QRTransferToUser).toBe(true);
		expect(component.currentTransactions[1] instanceof QRTransferToUser).toBe(true);
		expect(component.currentTransactions[2] instanceof QRTransferToUser).toBe(true);
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
		expect(component.transactionsLoaded).toEqual(true);
	}));

	it('should get same items when no search text', fakeAsync(() => {
		let ev = {target:{value:""}};
		component.getTransactions(ev);
		tick();

		expect(component.currentTransactions).toEqual([QRTransferToUserOne,QRTransferToUserTwo,QRTransferToUserThree]);

	}));

	it('should get some items when there is partially matching search text', fakeAsync(() => {
		let ev = {target:{value:"3"}};
		component.getTransactions(ev);
		tick();

		expect(component.transactions).toEqual([QRTransferToUserThree]);

	}));

	it('should get no transactions when there is no matching search text', fakeAsync(() => {
		let ev = {target:{value:"randomstring"}};
		component.getTransactions(ev);
		tick();

		expect(component.transactions).toEqual([]);

	}));

	it('should refresh and fetch latest items', fakeAsync(() => {
		let refresher = {complete:function(){return;}};

		spyOn(refresher,'complete');
		component.refreshTransactions(refresher);
		tick();

		expect(component.currentTransactions).toEqual([QRTransferToUserOne,QRTransferToUserTwo,QRTransferToUserThree]);
		expect(component.transactions).toEqual([QRTransferToUserOne,QRTransferToUserTwo,QRTransferToUserThree]);
		expect(refresher.complete).toHaveBeenCalled();

	}));

	it('should open model to view transaction', fakeAsync(() => {
		spyOn(ModalControllerMock.prototype,'create').and.returnValue(modalMock);
		spyOn(ModalMock.prototype,'present');
		let transactionIdentifier = 'transactionIdentifier';
		component.viewTransaction(transactionIdentifier);
		tick();
		expect(ModalControllerMock.prototype.create).toHaveBeenCalledWith(
			TransactionViewPage, {
				transactionId: transactionIdentifier, transactionType: 'QRTransferToUser'
			}
		)
		expect(ModalMock.prototype.present).toHaveBeenCalled();
	}));

	it('should open model to add QRTransferToUser transaction', fakeAsync(() => {
		spyOn(ModalControllerMock.prototype,'create').and.returnValue(modalMock);
		spyOn(ModalMock.prototype,'present');
		spyOn(ModalMock.prototype,'onDidDismiss');

		component.addTransaction();

		tick();

		expect(ModalControllerMock.prototype.create).toHaveBeenCalledWith(
			QRTransferToUserForm, {
				transactionType: 'QRTransferToUser',
				properties: [{"name":"logs","type":"String","optional":true,"primitive":true,"default":null,"validator":null,"array":true,"enum":false,"enumValues":[]},{"name":"qrpass","type":"QRPass","optional":false,"primitive":false,"array":false,"enum":false,"enumValues":[]},{"name":"mobilityAsset","type":"MobilityAsset","optional":false,"primitive":false,"array":false,"enum":false,"enumValues":[]},{"name":"transactionId","type":"String","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]},{"name":"timestamp","type":"DateTime","optional":false,"primitive":true,"default":null,"validator":null,"array":false,"enum":false,"enumValues":[]}],
				formType: 'Add'
			}
		)
		expect(ModalMock.prototype.present).toHaveBeenCalled();
		expect(ModalMock.prototype.onDidDismiss).toHaveBeenCalled();

	}));


	it('should get all QRTransferToUser transactions after an add QRTransferToUser form is completed', fakeAsync(() => {
		const modalCtrl = fixture.debugElement.injector.get(ModalController);
		const modal = (<ModalControllerMock>(<any>modalCtrl)).presentableRef;

		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(AlertControllerMock.prototype,'create').and.returnValue(alertMock);
		spyOn(AlertMock.prototype,'present');
		spyOn(modalCtrl, 'create').and.callThrough();
		spyOn(modal, 'present').and.callThrough();

		component.addTransaction();
		tick();

		modal.dismiss({ loading: new LoadingMock(), response: {transactionId:'transactionIdAdded'} });
		tick();

		expect(modal.present).toHaveBeenCalled();
		expect(serviceQRTransferToUserPageMock.prototype.getAll).toHaveBeenCalled();
		expect(component.currentTransactions).toEqual([QRTransferToUserOne,QRTransferToUserTwo,QRTransferToUserThree]);
		expect(component.transactions).toEqual([QRTransferToUserOne,QRTransferToUserTwo,QRTransferToUserThree]);
		expect(LoadingMock.prototype.dismiss).toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).toHaveBeenCalledWith({
			title: 'Added QRTransferToUser',
			subTitle: 'The QRTransferToUser transaction has been submitted with the ID: transactionIdAdded',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).toHaveBeenCalled();

	}));

	it('should handle add QRTransferToUser form dismissal', fakeAsync(() => {
		const modalCtrl = fixture.debugElement.injector.get(ModalController);
		const modal = (<ModalControllerMock>(<any>modalCtrl)).presentableRef;

		spyOn(LoadingMock.prototype,'dismiss');
		spyOn(AlertControllerMock.prototype,'create').and.returnValue(alertMock);
		spyOn(AlertMock.prototype,'present');
		spyOn(modalCtrl, 'create').and.callThrough();
		spyOn(modal, 'present').and.callThrough();

		component.addTransaction();
		tick();

		modal.dismiss({});
		tick();

		expect(modal.present).toHaveBeenCalled();
		expect(component.currentTransactions).not.toEqual([QRTransferToUserOne,QRTransferToUserTwo,QRTransferToUserThree]);
		expect(component.transactions).not.toEqual([QRTransferToUserOne,QRTransferToUserTwo,QRTransferToUserThree]);
		expect(LoadingMock.prototype.dismiss).not.toHaveBeenCalled();
		expect(AlertControllerMock.prototype.create).not.toHaveBeenCalledWith({
			title: 'Added QRTransferToUser',
			subTitle: 'transactionIdAdded has been added',
			buttons: ['OK']
		});
		expect(AlertMock.prototype.present).not.toHaveBeenCalled();

	}));


});
