import { TestBed, fakeAsync, tick, inject } from '@angular/core/testing';

import { SetupDemoService } from './SetupDemo.service';
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

describe('SetupDemoService', () => {

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				SetupDemoService,
				{ provide: DataService, useClass:DataServiceMock }
			]
		});
	});

	it('should set namespace',fakeAsync(inject([SetupDemoService], (service: SetupDemoService) => {
		expect(service.namespace).toContain('SetupDemo');
	})));

	it('should get all SetupDemo transactions',fakeAsync(inject([SetupDemoService], (service: SetupDemoService) => {
		let spy = spyOn(DataServiceMock.prototype,'getAll');

		service.getAll();
		tick();
		expect(spy.calls.argsFor(0)).toContain('SetupDemo');
	})));

	it('should get SetupDemo transaction',fakeAsync(inject([SetupDemoService], (service: SetupDemoService) => {
		let identifier = "SetupDemo123";
		let spy = spyOn(DataServiceMock.prototype,'get');

		service.get(identifier);
		tick();
		expect(spy.calls.argsFor(0)).toContain('SetupDemo');
		expect(spy.calls.argsFor(0)).toContain(identifier);
	})));

	it('should add SetupDemo transaction',fakeAsync(inject([SetupDemoService], (service: SetupDemoService) => {
		let spy = spyOn(DataServiceMock.prototype,'add');

		service.add({'id':'idval'});
		tick();
		expect(spy.calls.argsFor(0)).toContain('SetupDemo');
		expect(spy.calls.argsFor(0)).toContain({'id':'idval'});
	})));
});
