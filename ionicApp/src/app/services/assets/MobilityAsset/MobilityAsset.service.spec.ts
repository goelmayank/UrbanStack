import { TestBed, fakeAsync, tick, inject } from '@angular/core/testing';

import { MobilityAssetService } from './MobilityAsset.service';
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

describe('MobilityAssetService', () => {

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				MobilityAssetService,
				{ provide: DataService, useClass:DataServiceMock }
			]
		});
	});

	it('should set namespace',fakeAsync(inject([MobilityAssetService], (service: MobilityAssetService) => {
		expect(service.namespace).toContain('MobilityAsset');
	})));

	it('should get all MobilityAsset assets',fakeAsync(inject([MobilityAssetService], (service: MobilityAssetService) => {
		let spy = spyOn(DataServiceMock.prototype,'getAll');

		service.getAll();
		tick();
		expect(spy.calls.argsFor(0)).toContain('MobilityAsset');
	})));

	it('should delete MobilityAsset asset',fakeAsync(inject([MobilityAssetService], (service: MobilityAssetService) => {
			let identifier = "MobilityAsset123";
			let spy = spyOn(DataServiceMock.prototype,'delete');

			service.delete(identifier);
			tick();
			expect(spy.calls.argsFor(0)).toContain('MobilityAsset');
			expect(spy.calls.argsFor(0)).toContain(identifier);
	})));

	it('should get MobilityAsset asset',fakeAsync(inject([MobilityAssetService], (service: MobilityAssetService) => {
		let identifier = "MobilityAsset123";
		let spy = spyOn(DataServiceMock.prototype,'get');

		service.get(identifier);
		tick();
		expect(spy.calls.argsFor(0)).toContain('MobilityAsset');
		expect(spy.calls.argsFor(0)).toContain(identifier);
	})));

	it('should add MobilityAsset asset',fakeAsync(inject([MobilityAssetService], (service: MobilityAssetService) => {
		let spy = spyOn(DataServiceMock.prototype,'add');

		service.add({'id':'idval'});
		tick();
		expect(spy.calls.argsFor(0)).toContain('MobilityAsset');
		expect(spy.calls.argsFor(0)).toContain({'id':'idval'});
	})));

	it('should update MobilityAsset asset',fakeAsync(inject([MobilityAssetService], (service: MobilityAssetService) => {
		let identifier = "MobilityAsset123";

		let spy = spyOn(DataServiceMock.prototype,'update');

		service.update(identifier,{'id':'idval'});
		tick();
		expect(spy.calls.argsFor(0)).toContain('MobilityAsset');
		expect(spy.calls.argsFor(0)).toContain(identifier);
		expect(spy.calls.argsFor(0)).toContain({'id':'idval'});

	})));

});
