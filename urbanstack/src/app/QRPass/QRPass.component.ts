/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { QRPassService } from './QRPass.service';
import 'rxjs/add/operator/toPromise';
@Component({
	selector: 'app-QRPass',
	templateUrl: './QRPass.component.html',
	styleUrls: ['./QRPass.component.css'],
  providers: [QRPassService]
})
export class QRPassComponent implements OnInit {

  myForm: FormGroup;

  private allAssets;
  private asset;
  private currentId;
	private errorMessage;

  
      
          QRPassId = new FormControl("", Validators.required);
        
  
      
          creator = new FormControl("", Validators.required);
        
  
      
          carrier = new FormControl("", Validators.required);
        
  
      
          origin = new FormControl("", Validators.required);
        
  
      
          destination = new FormControl("", Validators.required);
        
  


  constructor(private serviceQRPass:QRPassService, fb: FormBuilder) {
    this.myForm = fb.group({
    
        
          QRPassId:this.QRPassId,
        
    
        
          creator:this.creator,
        
    
        
          carrier:this.carrier,
        
    
        
          origin:this.origin,
        
    
        
          destination:this.destination
        
    
    });
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): Promise<any> {
    let tempList = [];
    return this.serviceQRPass.getAll()
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      result.forEach(asset => {
        tempList.push(asset);
      });
      this.allAssets = tempList;
    })
    .catch((error) => {
        if(error == 'Server error'){
            this.errorMessage = "Could not connect to REST server. Please check your configuration details";
        }
        else if(error == '404 - Not Found'){
				this.errorMessage = "404 - Could not find API route. Please check your available APIs."
        }
        else{
            this.errorMessage = error;
        }
    });
  }

	/**
   * Event handler for changing the checked state of a checkbox (handles array enumeration values)
   * @param {String} name - the name of the asset field to update
   * @param {any} value - the enumeration value for which to toggle the checked state
   */
  changeArrayValue(name: string, value: any): void {
    const index = this[name].value.indexOf(value);
    if (index === -1) {
      this[name].value.push(value);
    } else {
      this[name].value.splice(index, 1);
    }
  }

	/**
	 * Checkbox helper, determining whether an enumeration value should be selected or not (for array enumeration values
   * only). This is used for checkboxes in the asset updateDialog.
   * @param {String} name - the name of the asset field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified asset field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  addAsset(form: any): Promise<any> {
    this.asset = {
      $class: "org.urbanstack.QRPass",
      
        
          "QRPassId":this.QRPassId.value,
        
      
        
          "creator":this.creator.value,
        
      
        
          "carrier":this.carrier.value,
        
      
        
          "origin":this.origin.value,
        
      
        
          "destination":this.destination.value
        
      
    };

    this.myForm.setValue({
      
        
          "QRPassId":null,
        
      
        
          "creator":null,
        
      
        
          "carrier":null,
        
      
        
          "origin":null,
        
      
        
          "destination":null
        
      
    });

    return this.serviceQRPass.addAsset(this.asset)
    .toPromise()
    .then(() => {
			this.errorMessage = null;
      this.myForm.setValue({
      
        
          "QRPassId":null,
        
      
        
          "creator":null,
        
      
        
          "carrier":null,
        
      
        
          "origin":null,
        
      
        
          "destination":null 
        
      
      });
    })
    .catch((error) => {
        if(error == 'Server error'){
            this.errorMessage = "Could not connect to REST server. Please check your configuration details";
        }
        else{
            this.errorMessage = error;
        }
    });
  }


   updateAsset(form: any): Promise<any> {
    this.asset = {
      $class: "org.urbanstack.QRPass",
      
        
          
        
    
        
          
            "creator":this.creator.value,
          
        
    
        
          
            "carrier":this.carrier.value,
          
        
    
        
          
            "origin":this.origin.value,
          
        
    
        
          
            "destination":this.destination.value
          
        
    
    };

    return this.serviceQRPass.updateAsset(form.get("QRPassId").value,this.asset)
		.toPromise()
		.then(() => {
			this.errorMessage = null;
		})
		.catch((error) => {
            if(error == 'Server error'){
				this.errorMessage = "Could not connect to REST server. Please check your configuration details";
			}
            else if(error == '404 - Not Found'){
				this.errorMessage = "404 - Could not find API route. Please check your available APIs."
			}
			else{
				this.errorMessage = error;
			}
    });
  }


  deleteAsset(): Promise<any> {

    return this.serviceQRPass.deleteAsset(this.currentId)
		.toPromise()
		.then(() => {
			this.errorMessage = null;
		})
		.catch((error) => {
            if(error == 'Server error'){
				this.errorMessage = "Could not connect to REST server. Please check your configuration details";
			}
			else if(error == '404 - Not Found'){
				this.errorMessage = "404 - Could not find API route. Please check your available APIs."
			}
			else{
				this.errorMessage = error;
			}
    });
  }

  setId(id: any): void{
    this.currentId = id;
  }

  getForm(id: any): Promise<any>{

    return this.serviceQRPass.getAsset(id)
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      let formObject = {
        
          
            "QRPassId":null,
          
        
          
            "creator":null,
          
        
          
            "carrier":null,
          
        
          
            "origin":null,
          
        
          
            "destination":null 
          
        
      };



      
        if(result.QRPassId){
          
            formObject.QRPassId = result.QRPassId;
          
        }else{
          formObject.QRPassId = null;
        }
      
        if(result.creator){
          
            formObject.creator = result.creator;
          
        }else{
          formObject.creator = null;
        }
      
        if(result.carrier){
          
            formObject.carrier = result.carrier;
          
        }else{
          formObject.carrier = null;
        }
      
        if(result.origin){
          
            formObject.origin = result.origin;
          
        }else{
          formObject.origin = null;
        }
      
        if(result.destination){
          
            formObject.destination = result.destination;
          
        }else{
          formObject.destination = null;
        }
      

      this.myForm.setValue(formObject);

    })
    .catch((error) => {
        if(error == 'Server error'){
            this.errorMessage = "Could not connect to REST server. Please check your configuration details";
        }
        else if(error == '404 - Not Found'){
				this.errorMessage = "404 - Could not find API route. Please check your available APIs."
        }
        else{
            this.errorMessage = error;
        }
    });

  }

  resetForm(): void{
    this.myForm.setValue({
      
        
          "QRPassId":null,
        
      
        
          "creator":null,
        
      
        
          "carrier":null,
        
      
        
          "origin":null,
        
      
        
          "destination":null 
        
      
      });
  }

}
