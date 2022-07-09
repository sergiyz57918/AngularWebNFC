#include <Wire.h>
#include <PN532_I2C.h>
#include <PN532.h>
#include <NfcAdapter.h>
// Third-party WebUSB Arduino library
#include "Adafruit_TinyUSB.h"

// USB WebUSB object
Adafruit_USBD_WebUSB usb_web;

// Landing Page: scheme (0: http, 1: https), url
// Page source can be found at https://github.com/hathach/tinyusb-webusb-page/tree/main/webusb-serial
WEBUSB_URL_DEF(landingPage, 1 /*http*/, "webusb.github.io/arduino/demos/console/");


#define BAUD_RATE 115200
uint16_t incomingByte = 0;   // for incoming serial data
String incomingString ="";
int incomingLenght = 0;
// #define Serial WebUSBSerial

PN532_I2C pn532_i2c(Wire);
NfcAdapter nfc = NfcAdapter(pn532_i2c);

void setup() {
  #if defined(ARDUINO_ARCH_MBED) && defined(ARDUINO_ARCH_RP2040)
  // Manual begin() is required on core without built-in support for TinyUSB such as mbed rp2040
  TinyUSB_Device_Init(0);
  #endif
 
  usb_web.setLandingPage(&landingPage);
  usb_web.setLineStateCallback(line_state_callback);
  usb_web.setStringDescriptor("TinyUSB WebUSB");
  usb_web.begin();
  
  Serial.begin(BAUD_RATE);
  
  while (!TinyUSBDevice.mounted()) delay(1);
  
  Serial.println("NDEF READER TinyUSB WebUSB Serial example");
  nfc.begin();
}

void loop() {

  Serial.println("\nScan your NFC tag on the NFC Shield\n");
  
  if (nfc.tagPresent())
  {
    NfcTag tag = nfc.read();
    if (tag.hasNdefMessage()) // If your tag has a message
    {

      NdefMessage message = tag.getNdefMessage();

      // If you have more than 1 Message then it will cycle through them
      int recordCount = message.getRecordCount();
      for (int i = 0; i < recordCount; i++)
      {
        NdefRecord record = message.getRecord(i);

        int payloadLength = record.getPayloadLength();
        byte payload[payloadLength];
        record.getPayload(payload);

        String payloadAsString = ""; // Processes the message as a string vs as a HEX value
        for (int c = 0; c < payloadLength; c++) {
          payloadAsString += (char)payload[c];
        }
          // From Serial to both Serial & webUSB
          if (Serial.available())
          {
            echo_all(payload, payloadLength);
            
          }
          Serial.println(payloadAsString.c_str());
          usb_web.println(payloadAsString.c_str());
          // from WebUSB to both Serial & webUSB
          if (usb_web.available())
          {
            Serial.println("WebUSB avaliable");
            echo_all(payload, payloadLength);
          }
        
      }
    }
  };
  delay(250);
  Serial.println("\nPlace an NFC Tag that you want to Record these Messages on!");
  delay(250);
  incomingByte = usb_web.read(); 
  if (nfc.tagPresent()&& usb_web.available()>0){
    if(incomingByte > 0 && incomingByte < 127){
      incomingString+=(char*)&incomingByte;
      incomingLenght = incomingString.length(); 
    }else if (incomingByte == 127||incomingLenght>100){ //Char 127 end transmission and write tag 
      if(incomingString){
        write_nfc_tag(incomingString); 
        incomingString="";
        incomingLenght=0;
        }
      }
    }
  delay(250);
}

// function to echo to both Serial and WebUSB
void echo_all(byte buf[], int count)
{
  if (usb_web.connected())
  {
    usb_web.write(buf, count);
    usb_web.flush();
  }

  if ( Serial )
  {
    for(int i=0; i<count; i++)
    {
      Serial.write(buf[i]);
      if ( buf[i] == '\r' ) Serial.write('\n');
    }
    Serial.flush();
  }
}

void write_nfc_tag (String payloadAsString){

  //Create NFC message to write
  NdefMessage message = NdefMessage();
  
  message.addTextRecord(payloadAsString); // Text Message you want to Record
  message.addMimeMediaRecord("text/plain","98b8ef0d-0891-424b-88c9-cd05b1bc3c05");  // Ednding Message for you to Record
  message.addUriRecord("codeninjas.com/ca-valencia"); // Website you want to Record
  message.addTelRecord("16614302633"); // Website you want to Record

  
  boolean success = nfc.write(message);
  if (success) {
            Serial.println("Good Job, now read it with your phone!");
            usb_web.println("Good Job, now read it with your phone!");// if it works you will see this message 
  } else {
            Serial.println("Write failed"); // If the the rewrite failed you will see this message
            usb_web.println("Write failed");
  }
        usb_web.flush();
  }

void line_state_callback(bool connected)
{

  if ( connected )
  {
    //usb_web.println("WebUSB NFC connected !!");
    Serial.println("WebUSB NFC connected !!");
    //usb_web.flush();
    Serial.flush();
  }
}
