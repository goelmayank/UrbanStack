import { TestBed, fakeAsync, tick, inject } from '@angular/core/testing';

import { TransitProviderService } from './TransitProvider.service';
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

describe('TransitProviderService', () => {

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				TransitProviderService,
				{ provide: DataService, useClass:DataServiceMock }
			]
		});
	});

	it('should set namespace',fakeAsync(inject([TransitProviderService], (service: TransitProviderService) => {
		expect(service.namespace).toContain('TransitProvider');
	})));

	it('should get all TransitProvider participants',fakeAsync(inject([TransitProviderService], (service: TransitProviderService) => {
		let spy = spyOn(DataServiceMock.prototype,'getAll');

		service.getAll();
		tick();
		expect(spy.calls.argsFor(0)).toContain('TransitProvider');
	})));

	it('should delete TransitProvider participant',fakeAsync(inject([TransitProviderService], (service: TransitProviderService) => {
			let identifier = "TransitProvider123";
			let spy = spyOn(DataServiceMock.prototype,'delete');

			service.delete(identifier);
			tick();
			expect(spy.calls.argsFor(0)).toContain('TransitProvider');
			expect(spy.calls.argsFor(0)).toContain(identifier);
	})));

	it('should get TransitProvider participant',fakeAsync(inject([TransitProviderService], (service: TransitProviderService) => {
		let identifier = "TransitProvider123";
		let spy = spyOn(DataServiceMock.prototype,'get');

		service.get(identifier);
		tick();
		expect(spy.calls.argsFor(0)).toContain('TransitProvider');
		expect(spy.calls.argsFor(0)).toContain(identifier);
	})));

	it('should add TransitProvider participant',fakeAsync(inject([TransitProviderService], (service: TransitProviderService) => {
		let spy = spyOn(DataServiceMock.prototype,'add');

		service.add({'id':'idval'});
		tick();
		expect(spy.calls.argsFor(0)).toContain('TransitProvider');
		expect(spy.calls.argsFor(0)).toContain({'id':'idval'});
	})));

	it('should update TransitProvider participant',fakeAsync(inject([TransitProviderService], (service: TransitProviderService) => {
		let identifier = "TransitProvider123";

		let spy = spyOn(DataServiceMock.prototype,'update');

		service.update(identifier,{'id':'idval'});
		tick();
		expect(spy.calls.argsFor(0)).toContain('TransitProvider');
		expect(spy.calls.argsFor(0)).toContain(identifier);
		expect(spy.calls.argsFor(0)).toContain({'id':'idval'});

	})));

});
