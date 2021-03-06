import { TestBed, fakeAsync, tick, inject } from '@angular/core/testing';

import { CityPlannerService } from './CityPlanner.service';
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

describe('CityPlannerService', () => {

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				CityPlannerService,
				{ provide: DataService, useClass:DataServiceMock }
			]
		});
	});

	it('should set namespace',fakeAsync(inject([CityPlannerService], (service: CityPlannerService) => {
		expect(service.namespace).toContain('CityPlanner');
	})));

	it('should get all CityPlanner participants',fakeAsync(inject([CityPlannerService], (service: CityPlannerService) => {
		let spy = spyOn(DataServiceMock.prototype,'getAll');

		service.getAll();
		tick();
		expect(spy.calls.argsFor(0)).toContain('CityPlanner');
	})));

	it('should delete CityPlanner participant',fakeAsync(inject([CityPlannerService], (service: CityPlannerService) => {
			let identifier = "CityPlanner123";
			let spy = spyOn(DataServiceMock.prototype,'delete');

			service.delete(identifier);
			tick();
			expect(spy.calls.argsFor(0)).toContain('CityPlanner');
			expect(spy.calls.argsFor(0)).toContain(identifier);
	})));

	it('should get CityPlanner participant',fakeAsync(inject([CityPlannerService], (service: CityPlannerService) => {
		let identifier = "CityPlanner123";
		let spy = spyOn(DataServiceMock.prototype,'get');

		service.get(identifier);
		tick();
		expect(spy.calls.argsFor(0)).toContain('CityPlanner');
		expect(spy.calls.argsFor(0)).toContain(identifier);
	})));

	it('should add CityPlanner participant',fakeAsync(inject([CityPlannerService], (service: CityPlannerService) => {
		let spy = spyOn(DataServiceMock.prototype,'add');

		service.add({'id':'idval'});
		tick();
		expect(spy.calls.argsFor(0)).toContain('CityPlanner');
		expect(spy.calls.argsFor(0)).toContain({'id':'idval'});
	})));

	it('should update CityPlanner participant',fakeAsync(inject([CityPlannerService], (service: CityPlannerService) => {
		let identifier = "CityPlanner123";

		let spy = spyOn(DataServiceMock.prototype,'update');

		service.update(identifier,{'id':'idval'});
		tick();
		expect(spy.calls.argsFor(0)).toContain('CityPlanner');
		expect(spy.calls.argsFor(0)).toContain(identifier);
		expect(spy.calls.argsFor(0)).toContain({'id':'idval'});

	})));

});
