import { TestBed, fakeAsync, tick, inject } from '@angular/core/testing';

import { QRTransferToTransitService } from './QRTransferToTransit.service';
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

describe('QRTransferToTransitService', () => {

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				QRTransferToTransitService,
				{ provide: DataService, useClass:DataServiceMock }
			]
		});
	});

	it('should set namespace',fakeAsync(inject([QRTransferToTransitService], (service: QRTransferToTransitService) => {
		expect(service.namespace).toContain('QRTransferToTransit');
	})));

	it('should get all QRTransferToTransit transactions',fakeAsync(inject([QRTransferToTransitService], (service: QRTransferToTransitService) => {
		let spy = spyOn(DataServiceMock.prototype,'getAll');

		service.getAll();
		tick();
		expect(spy.calls.argsFor(0)).toContain('QRTransferToTransit');
	})));

	it('should get QRTransferToTransit transaction',fakeAsync(inject([QRTransferToTransitService], (service: QRTransferToTransitService) => {
		let identifier = "QRTransferToTransit123";
		let spy = spyOn(DataServiceMock.prototype,'get');

		service.get(identifier);
		tick();
		expect(spy.calls.argsFor(0)).toContain('QRTransferToTransit');
		expect(spy.calls.argsFor(0)).toContain(identifier);
	})));

	it('should add QRTransferToTransit transaction',fakeAsync(inject([QRTransferToTransitService], (service: QRTransferToTransitService) => {
		let spy = spyOn(DataServiceMock.prototype,'add');

		service.add({'id':'idval'});
		tick();
		expect(spy.calls.argsFor(0)).toContain('QRTransferToTransit');
		expect(spy.calls.argsFor(0)).toContain({'id':'idval'});
	})));
});
