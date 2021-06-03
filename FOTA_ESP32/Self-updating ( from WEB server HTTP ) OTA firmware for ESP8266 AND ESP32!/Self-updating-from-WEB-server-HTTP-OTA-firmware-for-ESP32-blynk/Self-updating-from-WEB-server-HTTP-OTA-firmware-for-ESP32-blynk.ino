const char* fwUrlBase = "http://yourserver.com/.fota/"; /// put your server URL where the *.bin & *.version files are saved in your http ( Apache? ) server
const int FW_VERSION = 2019041802 ; /// year_month_day_counternumber 2019 is the year, 04 is the month, 17 is the day 01 is the in day release

#define Version "0.5"  /// sketch version ///

/// Blynk related setup ///
/*
 * V1 virtual switch for activate or deactivate RUNning LED controlling (boolean) ledBlink
 *
 * V14 WidgetTerminal terminal V14 
 *
 * V20 virtual switch in push button mode, for on demand OTA
 * 
 * V21 RUNning virtual LED
 *
 * V26 virtual switch in push button mode, to activate HTTP file OTA on demand via boolean HTTP_OTA variable that activate in the loop V26
 * 
 */

const char* ssid = "mywifiap"; /// put your AP SSID here
const char* password = "12345678"; /// put your AP PASSWORD oy KEY here


#define HARDWARE_LED 5 /// GPIO05 /// sparkfun ESP32 thing LED

/// ESP32 HTTP OTA dependencies ///
#include <Arduino.h> /// FOR ESP32 HTTP FOTA UPDATE ///
#include <WiFi.h> /// FOR ESP32 
#include <HTTPClient.h> /// FOR ESP32 HTTP FOTA UPDATE ///
#include <HTTPUpdate.h> /// FOR ESP32 HTTP FOTA UPDATE ///
#include <WiFiClient.h> /// FOR ESP32 HTTP FOTA UPDATE ///
WiFiClient client;  /// FOR ESP32 HTTP FOTA UPDATE ///

/// blynk dependencies ///
#define BLYNK_PRINT Serial    // Comment this out to disable prints and save space
#include <BlynkSimpleEsp32.h> /// FOR ESP32

// You should get Auth Token in the Blynk App.
// Go to the Project Settings (nut icon).
char auth[] = "puthereyourBlynkAUTHnumber";

// Attach virtual serial terminal to Virtual Pin V14
WidgetTerminal terminal(V14);

WidgetLED led0(V21);

/// SimpleTimer timer;
BlynkTimer timer;

/// switch value to control if the WeMos internal led will be blinking if HIGH or not if LOW ///
boolean ledBlink = true;

/// timestamp variable to keep track of millis() unsigned long ticks = millis() / 1000;  That is for debugging printings ///
unsigned long timestamp;

/// for HTTP based file OTA update ///
bool HTTP_OTA = false; /// we control this boolean variable through V26 switch that is in push button mode 

/// START routine for manual (on demand) requesting HTTP file OTA. Virtual Button SW V26 is used ///
  BLYNK_WRITE(V26)
  {
    if (param.asInt()) {
    HTTP_OTA = true;
    } 
    else {
    HTTP_OTA = false;
    }
  }
/// END routine for manual (on demend) requesting HTTP file OTA. Virtual Button SW V15 is used ///

/// START of SimpleTimer timer activating function blinkLedWidget ///
void blinkLedWidget()
{
  if (led0.getValue()) {
    led0.off();
    ///BLYNK_LOG("LED0: off");
  } else {
    led0.on();
    ///BLYNK_LOG("LED0: on");
  }
/// END of SimpleTimer timer activating function blinkLedWidget ///

/// put the routine here to blink WeMos LED (D4) each ? second(s), using the "control software switch" ledBlink ///
  if (ledBlink) 
  {int test = digitalRead(HARDWARE_LED); /// Could also be : pinMode(BUILTIN_LED, OUTPUT); OR digitalRead(BUILTIN_LED);  /// onboard LED as output
  digitalWrite(HARDWARE_LED, !test); 
  }
}

/// Start of main function that performs HTTP OTA /// 
void checkForUpdates() {
  uint8_t mac[6];
  char macAddr[14];
  WiFi.macAddress( mac );
  ///sprintf(macAddr,"%02x%02x%02x%02x%02x%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]); /// small letters at MAC address
  sprintf(macAddr, "%02X%02X%02X%02X%02X%02X", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]); /// capital letters at MAC address
  ///terminal.println(macAddr);
  Blynk.virtualWrite(V14, macAddr);
  String fwURL = String( fwUrlBase );
  fwURL.concat( macAddr );
  String fwVersionURL = fwURL;
  fwVersionURL.concat( ".version" );
  Serial.println( "Checking for firmware updates." );
  Serial.print( "MAC address: " );
  Serial.println( macAddr );
  Blynk.virtualWrite(V14, "\nChecking for firmware updates.\nMAC address: ");
  Blynk.virtualWrite(V14, macAddr);
  Serial.print( "Firmware version URL: " );
  Serial.println( fwVersionURL );
  Blynk.virtualWrite(V14, "\nFirmware version URL: ");
  Blynk.virtualWrite(V14, fwVersionURL);
  HTTPClient httpClient;
  httpClient.begin( client, fwVersionURL );
  int httpCode = httpClient.GET();
  if( httpCode == 200 ) {
    String newFWVersion = httpClient.getString();
    Serial.print( "Current firmware version: " );
    Serial.println( FW_VERSION );
    Serial.print( "Available firmware version: " );
    Serial.println( newFWVersion );
    Blynk.virtualWrite(V14, "\nCurrent firmware version: ");
    Blynk.virtualWrite(V14, FW_VERSION);  
    Blynk.virtualWrite(V14, "\nAvailable firmware version: ");
    Blynk.virtualWrite(V14, newFWVersion);
    int newVersion = newFWVersion.toInt();
    if( newVersion > FW_VERSION ) {
      Serial.println( "Preparing to update" );
    Blynk.virtualWrite(V14, "\nPreparing to update"); 
      String fwImageURL = fwURL;
      fwImageURL.concat( ".bin" );
      t_httpUpdate_return ret = httpUpdate.update( client, fwImageURL ); /// FOR ESP32 HTTP FOTA
      switch(ret) {
        case HTTP_UPDATE_FAILED:
          Serial.printf("HTTP_UPDATE_FAILD Error (%d): %s", httpUpdate.getLastError(), httpUpdate.getLastErrorString().c_str()); /// FOR ESP32
          char currentString[64];
          sprintf(currentString, "\nHTTP_UPDATE_FAILD Error (%d): %s\n", httpUpdate.getLastError(), httpUpdate.getLastErrorString().c_str()); /// FOR ESP32
          Blynk.virtualWrite(V14, currentString);
          break;

        case HTTP_UPDATE_NO_UPDATES:
          Serial.println("HTTP_UPDATE_NO_UPDATES");
          Blynk.virtualWrite(V14, "\nHTTP_UPDATE_NO_UPDATES\n");
          break;
      }
    }
    else {
      Serial.println( "Already on latest version" );
      Blynk.virtualWrite(V14, "\nAlready on latest version\n");
    }
  }
  else {
    Serial.print( "Firmware version check failed, got HTTP response code " );
    Serial.println( httpCode );
    char currentString[64];
    sprintf(currentString, "\nFirmware version check failed, got HTTP response code : %d\n",httpCode);
    Blynk.virtualWrite(V14, currentString);
  }
  httpClient.end();
}
/// End of main function that performs HTTP OTA /// 


/// START OF SETUP ///
void setup() {
  Serial.begin(115200);
  Serial.println("Booting...");
  
  /// on board LED ///
  pinMode(HARDWARE_LED, OUTPUT);
  
  WiFi.mode(WIFI_STA);
  Serial.println(WiFi.macAddress()); /// PRINT MAC ADDRESS TO SERIAL ... use this in order to see the MAC Address that is used for the http FOTA update 

  WiFi.begin(ssid, password);
  if (WiFi.status() != WL_CONNECTED) {
  Serial.println("Connecting to Wifi AP...");
  for ( int i = 0; i < 300; i++) {                  ///       try to connect to WiFi for max 30s
      if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("it is connected after %d seconds",(i/10));
        break; }
      yield();
      delay(100);
    }
  }
  if(WiFi.status() == WL_CONNECTED) { 
    //if you get here you have connected to the WiFi
    Serial.println("\nconnected...yesss! :)");
  } else {
    Serial.println("TimeOut! Not Connected even after 10 Seconds trying...\n *** Something wrong happened. It did not connected... *** ");
  }  

/// Blynk.begin(auth, ssid, password);
  //if you get here you have connected to the WiFi
  Serial.println("connected...yesss! :)");
  Serial.println("Ready");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  unsigned long maxMillis=millis() + 50000;
  Blynk.config(auth);
    Serial.println(" Trying to connected to Blynk... ");
    Serial.printf(" Enter millis is: %d\n",millis());
    do {
        // Wait until connected or 10 seconds passed without connection ( maxMillis )
      if(Blynk.connect() == true) {
        Serial.println(" Blynk is connected !!! ... ");
        Serial.printf(" Break millis is: %d\n",millis());
        break;
        }
    yield();
    delay(200);
    } while ((Blynk.connect() == false) && ( millis() < maxMillis));
    Serial.printf(" Exit millis is: %d\n",millis());
    if(Blynk.connect() == false) Serial.println(" Not Connected to Blynk. Something wrong happens... ");
    if(Blynk.connect() == true) Serial.println(" Blynk is connected!!! ... ");
  
  pinMode(HARDWARE_LED, OUTPUT);  // initialize onboard LED as output  
  digitalWrite(HARDWARE_LED, HIGH); // dim the LED 
  Serial.println(FW_VERSION);
  Blynk.virtualWrite(V14, FW_VERSION);
 
/// start of SimpleTimer timer Functions 
  /// This blink LED function be called every 2 seconds
  timer.setInterval(2000L, blinkLedWidget);
  /// end of SimpleTimer timer Functions 
}
/// END OF SETUP ///

/// start routine for V1 controlling ledBlink boolean global variable ///
  BLYNK_WRITE(V1)
  { char currentMillis[64];
    if (param.asInt()) {
      sprintf(currentMillis, "\n\n Enter millis()= %d",millis());
      Blynk.virtualWrite(V14, currentMillis);
      ledBlink = true;
      digitalWrite(HARDWARE_LED, HIGH); /// switch off the internal LED
    } 
    else {
      sprintf(currentMillis, "\n\n Exit  millis()= %d",millis());
      Blynk.virtualWrite(V14, currentMillis);
      ledBlink = false;
      digitalWrite(HARDWARE_LED, HIGH); /// switch on the internal LED
      }
  }
/// end of routine for V1 controlling ledBlink boolean global variable ///

/// start routine for manual (on demand) requesting OTA The Virtual Button SW V20 is used ///
  BLYNK_WRITE(V20)
  {
    if (param.asInt()) {
    //// ArduinoOTA.handle(); /// ESP8266 OTA
    }
  }
/// end of routine for manual (on demand) requesting OTA The Virtual Button SW V20 is used ///

// This function will run every time Blynk connection is established
BLYNK_CONNECTED() {
  ///   if (isFirstConnect) {
    //     Request Blynk server to re-send latest values for all pins
    /// }
    Blynk.syncAll();
}

/// START OF LOOP ///

void loop() {
  if(HTTP_OTA) {
    /// shall I stop timers and Blynk related in order to ensure succesful WEB OTA ??? ///
    checkForUpdates();
    } /// We need this in order to do WEB file OTA update ///
	
  Blynk.run();
  timer.run();
}
/// END OF LOOP ///