import { BrowserModule } from '@angular/platform-browser';
import { IonicStorageModule } from '@ionic/storage';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { HttpModule } from '@angular/http';
import { MyApp } from './app.component';
import { HomePage } from './pages/home/home.component';
import { AssetsPage } from './pages/assets/assets.component';
import { AssetViewPage } from './pages/asset-view/asset-view.component';
import { ParticipantsPage } from './pages/participants/participants.component';
import { ParticipantViewPage } from './pages/participant-view/participant-view.component';
import { TransactionsPage } from './pages/transactions/transactions.component';
import { TransactionViewPage } from './pages/transaction-view/transaction-view.component';
import { PopoverPage } from './pages/popover/popover.component';
import { SettingsPage } from './pages/settings/settings.component';
import { DataService } from './services/data.service';
import { PlatformService } from './services/platform.service';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Network } from '@ionic-native/network';
import { Toast } from '@ionic-native/toast';

// Import types generated from model

import * as ORG_HYPERLEDGER_COMPOSER_SYSTEM from './org.hyperledger.composer.system';
import * as ORG_URBANSTACK from './org.urbanstack';

// Import asset components generated from model

import { MobilityAssetPage } from './pages/assets/MobilityAsset/MobilityAsset.component';
import { MobilityAssetForm } from './pages/assets/MobilityAsset/MobilityAsset.form.component';

import { QRPassPage } from './pages/assets/QRPass/QRPass.component';
import { QRPassForm } from './pages/assets/QRPass/QRPass.form.component';

import { LocationPage } from './pages/assets/Location/Location.component';
import { LocationForm } from './pages/assets/Location/Location.form.component';


// Import participant components generated from model

import { PassengerPage } from './pages/participants/Passenger/Passenger.component';
import { PassengerForm } from './pages/participants/Passenger/Passenger.form.component';

import { TransitProviderPage } from './pages/participants/TransitProvider/TransitProvider.component';
import { TransitProviderForm } from './pages/participants/TransitProvider/TransitProvider.form.component';

import { OperatorPage } from './pages/participants/Operator/Operator.component';
import { OperatorForm } from './pages/participants/Operator/Operator.form.component';

import { CityPlannerPage } from './pages/participants/CityPlanner/CityPlanner.component';
import { CityPlannerForm } from './pages/participants/CityPlanner/CityPlanner.form.component';


// Import transaction components generated from model

import { QRTransferToTransitPage } from './pages/transactions/QRTransferToTransit/QRTransferToTransit.component';
import { QRTransferToTransitForm } from './pages/transactions/QRTransferToTransit/QRTransferToTransit.form.component';

import { QRTransferToUserPage } from './pages/transactions/QRTransferToUser/QRTransferToUser.component';
import { QRTransferToUserForm } from './pages/transactions/QRTransferToUser/QRTransferToUser.form.component';

import { SetupDemoPage } from './pages/transactions/SetupDemo/SetupDemo.component';
import { SetupDemoForm } from './pages/transactions/SetupDemo/SetupDemo.form.component';


// Import asset services generated from model

import { MobilityAssetService } from './services/assets/MobilityAsset/MobilityAsset.service';
import { QRPassService } from './services/assets/QRPass/QRPass.service';
import { LocationService } from './services/assets/Location/Location.service';

// Import participant services generated from model

import { PassengerService } from './services/participants/Passenger/Passenger.service';
import { TransitProviderService } from './services/participants/TransitProvider/TransitProvider.service';
import { OperatorService } from './services/participants/Operator/Operator.service';
import { CityPlannerService } from './services/participants/CityPlanner/CityPlanner.service';

// Import transaction services generated from model

import { QRTransferToTransitService } from './services/transactions/QRTransferToTransit/QRTransferToTransit.service';
import { QRTransferToUserService } from './services/transactions/QRTransferToUser/QRTransferToUser.service';
import { SetupDemoService } from './services/transactions/SetupDemo/SetupDemo.service';

@NgModule({
	declarations: [
		MyApp,
		SettingsPage,
		HomePage,
		AssetsPage,
		AssetViewPage,
		ParticipantsPage,
		ParticipantViewPage,
		TransactionsPage,
		TransactionViewPage,
		PopoverPage,
		
			MobilityAssetPage,
		
			QRPassPage,
		
			LocationPage,
		
		
			MobilityAssetForm,
		
			QRPassForm,
		
			LocationForm,
		
		
			PassengerPage,
		
			TransitProviderPage,
		
			OperatorPage,
		
			CityPlannerPage,
		
		
			PassengerForm,
		
			TransitProviderForm,
		
			OperatorForm,
		
			CityPlannerForm,
		
		
			QRTransferToTransitPage,
		
			QRTransferToUserPage,
		
			SetupDemoPage,
		
    	QRTransferToTransitForm,
		QRTransferToUserForm,
		
			SetupDemoForm
		
  	],
  	imports: [
    	HttpModule,
    	BrowserModule,
		IonicModule.forRoot(MyApp),
		IonicStorageModule.forRoot()
  	],
  	bootstrap: [IonicApp],
  	entryComponents: [
		MyApp,
		SettingsPage,
    	HomePage,
		AssetsPage,
		AssetViewPage,
		ParticipantsPage,
		ParticipantViewPage,
		TransactionsPage,
		TransactionViewPage,
		PopoverPage,
    	
			MobilityAssetPage,
		
			QRPassPage,
		
			LocationPage,
		
		
			MobilityAssetForm,
		
			QRPassForm,
		
			LocationForm,
		
		
			PassengerPage,
		
			TransitProviderPage,
		
			OperatorPage,
		
			CityPlannerPage,
		
		
			PassengerForm,
		
			TransitProviderForm,
		
			OperatorForm,
		
			CityPlannerForm,
		
		
			QRTransferToTransitPage,
		
			QRTransferToUserPage,
		
			SetupDemoPage,
		
    	QRTransferToTransitForm,
		QRTransferToUserForm,
		
			SetupDemoForm
		
  	],
  	providers: [
		Geolocation,
    	StatusBar,
		SplashScreen,
		Network,
		Toast,
		DataService,
		PlatformService,
		{provide: ErrorHandler, useClass: IonicErrorHandler},
		
			MobilityAssetService,
		
			QRPassService,
		
			LocationService,
		
		
			PassengerService,
		
			TransitProviderService,
		
			OperatorService,
		
			CityPlannerService,
		
		QRTransferToTransitService,
		QRTransferToUserService,
		
		SetupDemoService
		
  	]
})
export class AppModule {}
