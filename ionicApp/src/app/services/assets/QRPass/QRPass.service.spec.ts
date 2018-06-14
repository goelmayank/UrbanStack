import { TestBed, fakeAsync, tick, inject } from '@angular/core/testing';

import { QRPassService } from './QRPass.service';
import { DataService } from '../../../services/data.service';

class DataServiceMock{
	getAll(){
		return;
	}
	delete(id){
		return;
	}
	get(id){
		return;
	}
	add(){
		return;
	}
	update(id,asset){
		return;
	}
}

describe('QRPassService', () => {

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				QRPassService,
				{ provide: DataService, useClass:DataServiceMock }
			]
		});
	});

	it('should set namespace',fakeAsync(inject([QRPassService], (service: QRPassService) => {
		expect(service.namespace).toContain('QRPass');
	})));

	it('should get all QRPass assets',fakeAsync(inject([QRPassService], (service: QRPassService) => {
		let spy = spyOn(DataServiceMock.prototype,'getAll');

		service.getAll();
		tick();
		expect(spy.calls.argsFor(0)).toContain('QRPass');
	})));

	it('should delete QRPass asset',fakeAsync(inject([QRPassService], (service: QRPassService) => {
			let identifier = "QRPass123";
			let spy = spyOn(DataServiceMock.prototype,'delete');

			service.delete(identifier);
			tick();
			expect(spy.calls.argsFor(0)).toContain('QRPass');
			expect(spy.calls.argsFor(0)).toContain(identifier);
	})));

	it('should get QRPass asset',fakeAsync(inject([QRPassService], (service: QRPassService) => {
		let identifier = "QRPass123";
		let spy = spyOn(DataServiceMock.prototype,'get');

		service.get(identifier);
		tick();
		expect(spy.calls.argsFor(0)).toContain('QRPass');
		expect(spy.calls.argsFor(0)).toContain(identifier);
	})));

	it('should add QRPass asset',fakeAsync(inject([QRPassService], (service: QRPassService) => {
		let spy = spyOn(DataServiceMock.prototype,'add');

		service.add({'id':'idval'});
		tick();
		expect(spy.calls.argsFor(0)).toContain('QRPass');
		expect(spy.calls.argsFor(0)).toContain({'id':'idval'});
	})));

	it('should update QRPass asset',fakeAsync(inject([QRPassService], (service: QRPassService) => {
		let identifier = "QRPass123";

		let spy = spyOn(DataServiceMock.prototype,'update');

		service.update(identifier,{'id':'idval'});
		tick();
		expect(spy.calls.argsFor(0)).toContain('QRPass');
		expect(spy.calls.argsFor(0)).toContain(identifier);
		expect(spy.calls.argsFor(0)).toContain({'id':'idval'});

	})));

});
