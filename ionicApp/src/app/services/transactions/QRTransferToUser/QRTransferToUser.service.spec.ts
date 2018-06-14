import { TestBed, fakeAsync, tick, inject } from '@angular/core/testing';

import { QRTransferToUserService } from './QRTransferToUser.service';
import { DataService } from '../../../services/data.service';

class DataServiceMock{
	getAll(){
		return;
	}

	get(id){
		return;
	}
	add(transaction){
		return;
	}
}

describe('QRTransferToUserService', () => {

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				QRTransferToUserService,
				{ provide: DataService, useClass:DataServiceMock }
			]
		});
	});

	it('should set namespace',fakeAsync(inject([QRTransferToUserService], (service: QRTransferToUserService) => {
		expect(service.namespace).toContain('QRTransferToUser');
	})));

	it('should get all QRTransferToUser transactions',fakeAsync(inject([QRTransferToUserService], (service: QRTransferToUserService) => {
		let spy = spyOn(DataServiceMock.prototype,'getAll');

		service.getAll();
		tick();
		expect(spy.calls.argsFor(0)).toContain('QRTransferToUser');
	})));

	it('should get QRTransferToUser transaction',fakeAsync(inject([QRTransferToUserService], (service: QRTransferToUserService) => {
		let identifier = "QRTransferToUser123";
		let spy = spyOn(DataServiceMock.prototype,'get');

		service.get(identifier);
		tick();
		expect(spy.calls.argsFor(0)).toContain('QRTransferToUser');
		expect(spy.calls.argsFor(0)).toContain(identifier);
	})));

	it('should add QRTransferToUser transaction',fakeAsync(inject([QRTransferToUserService], (service: QRTransferToUserService) => {
		let spy = spyOn(DataServiceMock.prototype,'add');

		service.add({'id':'idval'});
		tick();
		expect(spy.calls.argsFor(0)).toContain('QRTransferToUser');
		expect(spy.calls.argsFor(0)).toContain({'id':'idval'});
	})));
});
