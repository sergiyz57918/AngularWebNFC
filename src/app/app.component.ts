import { Component,OnInit } from '@angular/core';
import { WebusbService } from './webusb/webusb.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'AngularWebNFC';
  public tag: string = "";

  ngOnInit() { }

  constructor(public  webusbSerivce: WebusbService) {
    this.webusbSerivce.connectToPairedDevice();
    this.webusbSerivce.registerReadCallback(this.showResult);
  }
 

  public connect() {
    this.webusbSerivce.connectToNewDevice();
  }

  public disconnect() {
    console.log("Trying to close connection App");
    this.webusbSerivce.disconnect();
  }

  private showResult (data:any){
    if(data){
      this.tag =data;
    }
     
  }
public readTag(){
  this.webusbSerivce.sendSymbol(128);
}




}
