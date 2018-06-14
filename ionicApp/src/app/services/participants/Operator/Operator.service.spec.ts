import { TestBed, fakeAsync, tick, inject } from '@angular/core/testing';

import { OperatorService } from './Operator.service';
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
	update(id,participant){
		return;
	}
}

describe('OperatorService', () => {

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				OperatorService,
				{ provide: DataService, useClass:DataServiceMock }
			]
		});
	});

	it('should set namespace',fakeAsync(inject([OperatorService], (service: OperatorService) => {
		expect(service.namespace).toContain('Operator');
	})));

	it('should get all Operator participants',fakeAsync(inject([OperatorService], (service: OperatorService) => {
		let spy = spyOn(DataServiceMock.prototype,'getAll');

		service.getAll();
		tick();
		expect(spy.calls.argsFor(0)).toContain('Operator');
	})));

	it('should delete Operator participant',fakeAsync(inject([OperatorService], (service: OperatorService) => {
			let identifier = "Operator123";
			let spy = spyOn(DataServiceMock.prototype,'delete');

			service.delete(identifier);
			tick();
			expect(spy.calls.argsFor(0)).toContain('Operator');
			expect(spy.calls.argsFor(0)).toContain(identifier);
	})));

	it('should get Operator participant',fakeAsync(inject([OperatorService], (service: OperatorService) => {
		let identifier = "Operator123";
		let spy = spyOn(DataServiceMock.prototype,'get');

		service.get(identifier);
		tick();
		expect(spy.calls.argsFor(0)).toContain('Operator');
		expect(spy.calls.argsFor(0)).toContain(identifier);
	})));

	it('should add Operator participant',fakeAsync(inject([OperatorService], (service: OperatorService) => {
		let spy = spyOn(DataServiceMock.prototype,'add');

		service.add({'id':'idval'});
		tick();
		expect(spy.calls.argsFor(0)).toContain('Operator');
		expect(spy.calls.argsFor(0)).toContain({'id':'idval'});
	})));

	it('should update Operator participant',fakeAsync(inject([OperatorService], (service: OperatorService) => {
		let identifier = "Operator123";

		let spy = spyOn(DataServiceMock.prototype,'update');

		service.update(identifier,{'id':'idval'});
		tick();
		expect(spy.calls.argsFor(0)).toContain('Operator');
		expect(spy.calls.argsFor(0)).toContain(identifier);
		expect(spy.calls.argsFor(0)).toContain({'id':'idval'});

	})));

});
