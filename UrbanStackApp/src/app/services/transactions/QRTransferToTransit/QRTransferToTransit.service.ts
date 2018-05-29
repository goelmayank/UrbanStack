import { Injectable } from '@angular/core';
import { DataService } from '../../data.service';

import 'rxjs/add/operator/map';

@Injectable()
export class QRTransferToTransitService {

	
		namespace: string = 'QRTransferToTransit';
	

	constructor(private dataService: DataService){}



	getAll(): any{
		return this.dataService.getAll(this.namespace);
	}

	get(transactionIdentifier): any{
		return this.dataService.get(this.namespace, transactionIdentifier);
	}

	add(transaction): any{
		return this.dataService.add(this.namespace, transaction);
	}

}
