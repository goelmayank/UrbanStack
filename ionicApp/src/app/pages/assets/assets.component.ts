import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

  import { MobilityAssetPage } from '../assets/MobilityAsset/MobilityAsset.component';
  import { QRPassPage } from '../assets/QRPass/QRPass.component';
  import { LocationPage } from '../assets/Location/Location.component';
@Component({
  selector: 'page-assets',
  templateUrl: 'assets.component.html'
})
export class AssetsPage {
  assetList: any[] = [{'name':'MobilityAsset','component':MobilityAssetPage},{'name':'QRPass','component':QRPassPage},{'name':'Location','component':LocationPage}];
  constructor(public navCtrl: NavController){

  }

  assetTapped(event, asset) {
    this.navCtrl.push(asset.component);
  }
}
