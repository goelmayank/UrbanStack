import { TestBed, fakeAsync, tick, inject } from '@angular/core/testing';

import { LocationService } from './Location.service';
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

describe('LocationService', () => {

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				LocationService,
				{ provide: DataService, useClass:DataServiceMock }
			]
		});
	});

	it('should set namespace',fakeAsync(inject([LocationService], (service: LocationService) => {
		expect(service.namespace).toContain('Location');
	})));

	it('should get all Location assets',fakeAsync(inject([LocationService], (service: LocationService) => {
		let spy = spyOn(DataServiceMock.prototype,'getAll');

		service.getAll();
		tick();
		expect(spy.calls.argsFor(0)).toContain('Location');
	})));

	it('should delete Location asset',fakeAsync(inject([LocationService], (service: LocationService) => {
			let identifier = "Location123";
			let spy = spyOn(DataServiceMock.prototype,'delete');

			service.delete(identifier);
			tick();
			expect(spy.calls.argsFor(0)).toContain('Location');
			expect(spy.calls.argsFor(0)).toContain(identifier);
	})));

	it('should get Location asset',fakeAsync(inject([LocationService], (service: LocationService) => {
		let identifier = "Location123";
		let spy = spyOn(DataServiceMock.prototype,'get');

		service.get(identifier);
		tick();
		expect(spy.calls.argsFor(0)).toContain('Location');
		expect(spy.calls.argsFor(0)).toContain(identifier);
	})));

	it('should add Location asset',fakeAsync(inject([LocationService], (service: LocationService) => {
		let spy = spyOn(DataServiceMock.prototype,'add');

		service.add({'id':'idval'});
		tick();
		expect(spy.calls.argsFor(0)).toContain('Location');
		expect(spy.calls.argsFor(0)).toContain({'id':'idval'});
	})));

	it('should update Location asset',fakeAsync(inject([LocationService], (service: LocationService) => {
		let identifier = "Location123";

		let spy = spyOn(DataServiceMock.prototype,'update');

		service.update(identifier,{'id':'idval'});
		tick();
		expect(spy.calls.argsFor(0)).toContain('Location');
		expect(spy.calls.argsFor(0)).toContain(identifier);
		expect(spy.calls.argsFor(0)).toContain({'id':'idval'});

	})));

});
