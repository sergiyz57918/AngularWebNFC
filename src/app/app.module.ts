import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReadTagComponent } from './read-tag/read-tag.component';
import { WriteTagComponent } from './write-tag/write-tag.component';

declare global {
  interface Navigator {
    usb: {
      getDevices(): any,
      requestDevice(args: Object): any,
      addEventListener(name: string, args: Object):any
    }
  }
}

@NgModule({
  declarations: [
    AppComponent,
    ReadTagComponent,
    WriteTagComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
