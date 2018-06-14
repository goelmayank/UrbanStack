import { TestBed, fakeAsync, tick, inject } from '@angular/core/testing';

import { PassengerService } from './Passenger.service';
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

describe('PassengerService', () => {

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				PassengerService,
				{ provide: DataService, useClass:DataServiceMock }
			]
		});
	});

	it('should set namespace',fakeAsync(inject([PassengerService], (service: PassengerService) => {
		expect(service.namespace).toContain('Passenger');
	})));

	it('should get all Passenger participants',fakeAsync(inject([PassengerService], (service: PassengerService) => {
		let spy = spyOn(DataServiceMock.prototype,'getAll');

		service.getAll();
		tick();
		expect(spy.calls.argsFor(0)).toContain('Passenger');
	})));

	it('should delete Passenger participant',fakeAsync(inject([PassengerService], (service: PassengerService) => {
			let identifier = "Passenger123";
			let spy = spyOn(DataServiceMock.prototype,'delete');

			service.delete(identifier);
			tick();
			expect(spy.calls.argsFor(0)).toContain('Passenger');
			expect(spy.calls.argsFor(0)).toContain(identifier);
	})));

	it('should get Passenger participant',fakeAsync(inject([PassengerService], (service: PassengerService) => {
		let identifier = "Passenger123";
		let spy = spyOn(DataServiceMock.prototype,'get');

		service.get(identifier);
		tick();
		expect(spy.calls.argsFor(0)).toContain('Passenger');
		expect(spy.calls.argsFor(0)).toContain(identifier);
	})));

	it('should add Passenger participant',fakeAsync(inject([PassengerService], (service: PassengerService) => {
		let spy = spyOn(DataServiceMock.prototype,'add');

		service.add({'id':'idval'});
		tick();
		expect(spy.calls.argsFor(0)).toContain('Passenger');
		expect(spy.calls.argsFor(0)).toContain({'id':'idval'});
	})));

	it('should update Passenger participant',fakeAsync(inject([PassengerService], (service: PassengerService) => {
		let identifier = "Passenger123";

		let spy = spyOn(DataServiceMock.prototype,'update');

		service.update(identifier,{'id':'idval'});
		tick();
		expect(spy.calls.argsFor(0)).toContain('Passenger');
		expect(spy.calls.argsFor(0)).toContain(identifier);
		expect(spy.calls.argsFor(0)).toContain({'id':'idval'});

	})));

});
