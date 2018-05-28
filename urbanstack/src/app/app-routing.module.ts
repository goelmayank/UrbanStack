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

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { TransactionComponent } from './Transaction/Transaction.component'
import { HomeComponent } from './home/home.component';

import { MobilityAssetComponent } from './MobilityAsset/MobilityAsset.component';
import { QRPassComponent } from './QRPass/QRPass.component';
import { LocationComponent } from './Location/Location.component';


  import { PassengerComponent } from './Passenger/Passenger.component';
  import { TransitProviderComponent } from './TransitProvider/TransitProvider.component';
  import { OperatorComponent } from './Operator/Operator.component';
  import { CityPlannerComponent } from './CityPlanner/CityPlanner.component';


  import { QRTransferToTransitComponent } from './QRTransferToTransit/QRTransferToTransit.component';
  import { QRTransferToUserComponent } from './QRTransferToUser/QRTransferToUser.component';
  import { SetupDemoComponent } from './SetupDemo/SetupDemo.component';  
const routes: Routes = [
     //{ path: 'transaction', component: TransactionComponent },
    {path: '', component: HomeComponent},
		
		{ path: 'MobilityAsset', component: MobilityAssetComponent},
    
		{ path: 'QRPass', component: QRPassComponent},
    
		{ path: 'Location', component: LocationComponent},
    
    
      { path: 'Passenger', component: PassengerComponent},
      
      { path: 'TransitProvider', component: TransitProviderComponent},
      
      { path: 'Operator', component: OperatorComponent},
      
      { path: 'CityPlanner', component: CityPlannerComponent},
      
      
        { path: 'QRTransferToTransit', component: QRTransferToTransitComponent},
        
        { path: 'QRTransferToUser', component: QRTransferToUserComponent},
        
        { path: 'SetupDemo', component: SetupDemoComponent},
        
		{path: '**', redirectTo:''}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
