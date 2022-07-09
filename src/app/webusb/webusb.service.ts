import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebusbService {

  public isConnected= true;
  public device:any ; 
  public readTag = ""; 
  private readCallbacks: string[]=[];
  private interfaceNumber = 2;  // original interface number of WebUSB Arduino demo
  private endpointIn = 5;       // original in endpoint ID of WebUSB Arduino demo
  private endpointOut = 4;      // original out endpoint ID of WebUSB Arduino demo
  private bufferSize = 128;     //default 64

  private filters = [
    { 'vendorId': 0x2341, 'productId': 0x8036 }, // Arduino Leonardo
    { 'vendorId': 0x2341, 'productId': 0x8037 }, // Arduino Micro
    { 'vendorId': 0x2341, 'productId': 0x804d }, // Arduino/Genuino Zero
    { 'vendorId': 0x2341, 'productId': 0x804e }, // Arduino/Genuino MKR1000
    { 'vendorId': 0x2341, 'productId': 0x804f }, // Arduino MKRZERO
    { 'vendorId': 0x2341, 'productId': 0x8050 }, // Arduino MKR FOX 1200
    { 'vendorId': 0x2341, 'productId': 0x8052 }, // Arduino MKR GSM 1400
    { 'vendorId': 0x2341, 'productId': 0x8053 }, // Arduino MKR WAN 1300
    { 'vendorId': 0x2341, 'productId': 0x8054 }, // Arduino MKR WiFi 1010
    { 'vendorId': 0x2341, 'productId': 0x8055 }, // Arduino MKR NB 1500
    { 'vendorId': 0x2341, 'productId': 0x8056 }, // Arduino MKR Vidor 4000
    { 'vendorId': 0x2341, 'productId': 0x8057 }, // Arduino NANO 33 IoT
    { 'vendorId': 0x239A }, // Adafruit Boards!
  ];

  constructor() {
    navigator.usb.addEventListener('connect',(event:any)=>{
      this.connectToPairedDevice(); 
    }); 
    navigator.usb.addEventListener('disconnect',(event:any) => {
      this.isConnected= false;}); 
    }
    public connectToPairedDevice(){
      let connectedDevice=this.getPairedDevice(); 
      console.log("Connected to paired device");
      this.postConnectAction(connectedDevice);    
    }

    public connectToNewDevice (){
      let connectedDevice = this.getDeviceSelector();
      console.log("Connected to New  device");
      this.postConnectAction(connectedDevice);
    }

  private getPairedDevice (){
    return navigator.usb.getDevices()
    .then((devices:any)=>{
      if(devices.length){
        this.device = devices[0];
        return this.device.open();
      }else {
        return false; 
      }

    })
  }


  private getDeviceSelector (){
    return navigator.usb.requestDevice({filters:this.filters})
    .then((selestedDevice:any)=>{
      this.device=selestedDevice; 
      return this.device.open();
    })
  }

  private postConnectAction(connectedDevice:any){
    console.log("Running Post connection actions");
    connectedDevice
    .then(()=>this.device.selectConfiguration(1))
    .then(()=>{
      let configurationInterfaces = this.device.configuration.interfaces;
      configurationInterfaces.forEach((element:any)=>{
        element.alternates.forEach((elementalt:any) =>{
          if (elementalt.interfaceClass==0xff){
            this.interfaceNumber = element.interfaceNumber;
            elementalt.endpoints.forEach((elementendpoint:any)=>{
              if (elementendpoint.direction == "out") {
                this.endpointOut = elementendpoint.endpointNumber;
              }
              if (elementendpoint.direction=="in") {
                this.endpointIn =elementendpoint.endpointNumber;
              }
            })
          }
        })
      })
    })
    .then(() => this.device.claimInterface(this.interfaceNumber))
    .then(()=> this.device.selectAlternateInterface(this.interfaceNumber, 0))
    .then(()=>this.device.controlTransferOut({
      requestType:'class',
      recipient: 'interface',
      request:0x22,
      value: 0x01,
      index:this.interfaceNumber
    }))
    .then(()=>{
      //reaad loop
      this.readLoop();
    })
    .then(()=>{
      this.isConnected=true;
      console.log("Connected to:",this.device.productName);
      //this.bufferSize = this.device.configuration.interfaces[2].alternate.endpoints[1].packetSize; 
      console.log("Buffer size:",this.bufferSize);
    })
    .catch((error:any)=>{
      console.error(error)
    })

  }
  private async readLoop(){
    //console.log("readingloop start");
    try{
      if(this.device.open){
        let payLoad= await this.device.transferIn(this.endpointIn,this.bufferSize); 
        let decoder = new TextDecoder(); 
        let decodedPayload = decoder.decode(payLoad.data).split(/\r?\n/).forEach(element=>{
          if(element){
            this.readCallbacks.push(element); 
            //console.log(element);
          } 
          //
          
        });
        if(this.readCallbacks[1]){
          console.log(this.readCallbacks[1]);
          //console.log(payLoad.data);
          this.readCallbacks = [];
        }

        this.readLoop();
      }
    } catch(e:any){
      console.error("Error while reading from the NFC Reader:",e.toString());
    }

  }

  public getDeviceName(){
    if(this.device){
      return this.device.productName; 
    }
  }

  public disconnect(){
    console.log("Closing", this.device.productName)
    this.device.close(); 
    this.isConnected=false; 
  }

  public getIsConnected(){
    return this.isConnected;
  }

  public registerReadCallback (callback:any){
    this.readCallbacks.push(callback);
  } 

  public async sendSymbol (symbol: number){
    let dataToSend = new Uint8Array(1);
    dataToSend.fill(symbol);
    this.sendDataToDevice(dataToSend);
  }

  private async sendDataToDevice (data:Uint8Array){
    this.device.transferOut(this.endpointOut, data);

  }

}
