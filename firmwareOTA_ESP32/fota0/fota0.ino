
#include <Arduino.h>

#include <WiFi.h>
#include <WiFiMulti.h>
#include <ArduinoJson.h>
 
#include <HTTPClient.h>
#include <WiFiClient.h>
#include <Seeed_mbedtls.h>

#include <HTTPUpdate.h>
#include <StreamString.h>

#define USE_SERIAL Serial

WiFiMulti wifiMulti;
const char* SSID = "Con Cho";
const char* PASS = "em0biet123";

const String hostServer = "http://192.168.1.98:5000";

String txid = "";
String firmwareVersion = "";
String statusDevice = "";

void setup() {
    USE_SERIAL.begin(115200);
    USE_SERIAL.println("firmware version: blockchain-fota0.bin");
    USE_SERIAL.println("****************************************************************");
    USE_SERIAL.println("*                           SET UP                             *");
    USE_SERIAL.println("****************************************************************");

    for(uint8_t t = 4; t > 0; t--) {
        USE_SERIAL.printf("[SETUP] WAIT %d...\n", t);
        USE_SERIAL.flush();
        delay(1000);
    }

    wifiMulti.addAP(SSID, PASS);
    USE_SERIAL.print("ESP Board MAC Address:  ");
    USE_SERIAL.println(WiFi.macAddress());
}


bool runUpdate(Stream& in, uint32_t size, int command)
{
    StreamString error;
    if(!Update.begin(size, command, -1, HIGH)) {
        Update.printError(error);
        error.trim(); // remove line ending
        log_e("Update.begin failed! (%s)\n", error.c_str());
        return false;
    }
    if(Update.writeStream(in) != size) {
        Update.printError(error);
        error.trim(); // remove line ending
        log_e("Update.writeStream failed! (%s)\n", error.c_str());
        return false;
    }
    if(!Update.end()) {
        Update.printError(error);
        error.trim(); // remove line ending
        log_e("Update.end failed! (%s)\n", error.c_str());
        return false;
    }
    return true;
}


String getAPI (String url) {
  String resp = "null";
  if((wifiMulti.run() == WL_CONNECTED)) {
        HTTPClient http;
        USE_SERIAL.print("[HTTP] begin...\n");
        USE_SERIAL.print(url);
        http.begin(url); 

        USE_SERIAL.print("[HTTP] GET...\n");
        // start connection and send HTTP header
        int httpCode = http.GET();

        // httpCode will be negative on error
        if(httpCode > 0) {
            // HTTP header has been send and Server response header has been handled
            USE_SERIAL.printf("[HTTP] GET... code: %d\n", httpCode);

            // file found at server
            if(httpCode == HTTP_CODE_OK) {
                String payload = http.getString();
                USE_SERIAL.println(payload);
                USE_SERIAL.print("size: ");
                USE_SERIAL.println(payload.length());
                resp = payload;
            }
        } else {
            USE_SERIAL.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
        }
        http.end();
    } else {
      delay(1000);
      return resp;
    }
}

String getHashSHA256(const char* payload){
  USE_SERIAL.println("****************************************************************");
  USE_SERIAL.println("*                       HASH BIN FILE                          *");
  USE_SERIAL.println("****************************************************************");
  mbedtls_sha256_context ctx;
  mbedtls_sha256_init(&ctx);
  mbedtls_sha256_starts_ret(&ctx, /*is224=*/0);
   
  const size_t payloadLength = strlen(payload);
  mbedtls_sha256_update_ret(&ctx,(const unsigned char *) payload, payloadLength);

  uint8_t hash[32];
  mbedtls_sha256_finish_ret(&ctx, hash);
  Serial.println("Hash: ");
  for (size_t i = 0; i < 32; i++) {
    printf("%02x", hash[i]);
  }
  printf("\n");
  mbedtls_sha256_free(&ctx);
  Serial.println("Done ");

  const size_t HASH_LEN = 32;
  char buffer[2 * HASH_LEN + 1];
  for(size_t index = 0; index < HASH_LEN; index++) {
    uint8_t nibble = (hash[index] & 0xf0) >> 4;
    buffer[2 * index] = nibble < 10 ? char(nibble + '0') : char(nibble - 10 + 'a');
    nibble = hash[index] & 0x0f;
    buffer[2 * index + 1] = nibble < 10 ? char(nibble + '0') : char(nibble - 10 + 'a');
    }
    buffer[2 * HASH_LEN] = '\0';
    return String(buffer);
}


bool checkRequire () {
  USE_SERIAL.println("****************************************************************");
  USE_SERIAL.println("*                     CHECK REQUIRE                            *");
  USE_SERIAL.println("****************************************************************");
  String url = hostServer + "/" + "checkRequire/" + WiFi.macAddress();
  bool respCheck = false;
  String payload = getAPI(url);
  if (payload != "null") {
    const size_t capacity = payload.length() + 250;
    DynamicJsonDocument doc(capacity);
    DeserializationError err = deserializeJson(doc, payload);
    if (err) {
      Serial.print(F("deserializeJson() failed with code "));
      Serial.println(err.c_str());
    } else {
      auto _response = doc["response"].as<char*>();
      String response = (String)_response;
      USE_SERIAL.print("response: ");
      Serial.println(response);
      if (response == "TRUE") {
        auto _txid = doc["require"]["txid"].as<char*>();
        USE_SERIAL.print("txid: ");
        Serial.println(_txid);
        txid = _txid;
        
        auto _firmwareVersion = doc["require"]["firmwareVersion"].as<char*>();
        USE_SERIAL.print("firmwareVersion: ");
        Serial.println(_firmwareVersion);
        firmwareVersion = _firmwareVersion;

        respCheck = true;
      }
    }
  } 
  delay(1000);
  return respCheck;
 }
 
 String getFirmware(String firmwareVersion) {
  USE_SERIAL.println("****************************************************************");
  USE_SERIAL.println("*                      GET FIRMWARE                            *");
  USE_SERIAL.println("****************************************************************");
  String resp = "NO_EXIST";
  // wait for WiFi connection
  if((wifiMulti.run() == WL_CONNECTED)) {

      HTTPClient http;

      USE_SERIAL.print("[HTTP] begin...\n");
      // configure traged server and url
      String urlForFirmware = hostServer + "/files/" + firmwareVersion;
      USE_SERIAL.print(urlForFirmware);
      http.begin(urlForFirmware); 

      USE_SERIAL.print("[HTTP] GET...\n");
      // start connection and send HTTP header
      int httpCode = http.GET();

      // httpCode will be negative on error
      if(httpCode > 0) {
          // HTTP header has been send and Server response header has been handled
          USE_SERIAL.printf("[HTTP] GET... code: %d\n", httpCode);

          // file found at server
          if(httpCode == HTTP_CODE_OK) {
              const char* payload = http.getString().c_str();
              USE_SERIAL.print("size: ");
              USE_SERIAL.println(http.getSize());
              String hash = getHashSHA256(payload);
              USE_SERIAL.print("hash: ");
              USE_SERIAL.println(hash);
              resp = hash;
          }
      } else {
          USE_SERIAL.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
      } http.end();
  } 
  delay(1000);
  return resp;
}


bool verifyRequire(String dataVerify) {
  USE_SERIAL.println("****************************************************************");
  USE_SERIAL.println("*                     VERIFY REQUIRE                           *");
  USE_SERIAL.println("****************************************************************");
  bool resp = false;
  String url = hostServer + "/verifyRequire/" + dataVerify;
  String respVerify = getAPI(url);
  if (respVerify != "null") {
    const size_t capacity = respVerify.length() + 250;
    DynamicJsonDocument doc(capacity);
    DeserializationError err = deserializeJson(doc, respVerify);
    if (err) {
      Serial.print(F("deserializeJson() failed with code "));
      Serial.println(err.c_str());
    } else {
      auto _response = doc["response"].as<char*>();
      USE_SERIAL.print("response: ");
      USE_SERIAL.println(_response);
      String response = (String)_response;
      if (response == "VERIFIED") resp = true;
    }
  }
  delay(1000);
  return resp;
 }

bool updateFirmware(String firmwareVersion, String firmwareHash) {
  USE_SERIAL.println("****************************************************************");
  USE_SERIAL.println("*                      UPDATE FIRMWARE                         *");
  USE_SERIAL.println("****************************************************************");
  bool resp = false;
    // wait for WiFi connection
    if((wifiMulti.run() == WL_CONNECTED)) {

        HTTPClient http;

        USE_SERIAL.print("[HTTP] begin...\n");
        // configure traged server and url
        String urlForFirmware = hostServer + "/files/" + firmwareVersion;
        USE_SERIAL.print(urlForFirmware);
        http.begin(urlForFirmware); 

        USE_SERIAL.print("[HTTP] GET...\n");
        // start connection and send HTTP header
        int httpCode = http.GET();

        // httpCode will be negative on error
        if(httpCode > 0) {
            // HTTP header has been send and Server response header has been handled
            USE_SERIAL.printf("[HTTP] GET... code: %d\n", httpCode);

            // file found at server
            if(httpCode == HTTP_CODE_OK) {
                const char * payload = http.getString().c_str();
                WiFiClient * tcp = http.getStreamPtr();
                USE_SERIAL.print("size: ");
                USE_SERIAL.println(http.getSize());
                String hash = getHashSHA256(payload);
                 if (hash != "NO_EXIST") {
                    if(hash == firmwareHash) {
                      uint32_t _size = http.getSize();
                        if (runUpdate(*tcp, _size, U_FLASH)) {
                          statusDevice = "DONE";
                          resp = true;
                        } else statusDevice = "FAIL";
                    }
                 }
            }
        } else {
            USE_SERIAL.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
        } http.end();
    } 
    delay(1000);
  return resp;
}

String recordRequire(String dataRecord) {
  USE_SERIAL.println("****************************************************************");
  USE_SERIAL.println("*                     RECORD REQUIRE                           *");
  USE_SERIAL.println("****************************************************************");
  String resp = "null";
  String url = hostServer + "/recordRequire/" + dataRecord;
  String respVerify = getAPI(url);
  if (respVerify != "null") {
    const size_t capacity = respVerify.length() + 250;
    DynamicJsonDocument doc(capacity);
    DeserializationError err = deserializeJson(doc, respVerify);
    if (err) {
      Serial.print(F("deserializeJson() failed with code "));
      Serial.println(err.c_str());
    } else {
      auto _response = doc["response"].as<char*>();
      USE_SERIAL.print("response: ");
      USE_SERIAL.println(_response);
      resp = (String)_response;
    }
  }
  delay(1000);
  return resp;
 }

bool updateOTA(){
  bool process = false; 
  bool check = checkRequire();
  if (check) {
    if (firmwareVersion != "null"){
      String hash = getFirmware(firmwareVersion);
      if (hash != "NO_EXIST") {
        String dataVerify = txid + "," + hash;
        bool verify = verifyRequire(dataVerify);
        if(verify) process = updateFirmware(firmwareVersion, hash);
        else statusDevice = "ABORTED";
      } else statusDevice = "NO_EXIST";
      USE_SERIAL.print("statusDevice: "); 
      USE_SERIAL.println(statusDevice);
      delay(10000);
      String dataRecord = txid + "," + statusDevice;
      String record = recordRequire(dataRecord);
      USE_SERIAL.print("record: "); 
      USE_SERIAL.println(record);
    } 
  } return process; 
}

void loop() {
  bool update = updateOTA();
  if (update) {
    Serial.println("done!!!!!!!!!!!!!!!");
    ESP.restart();
  }
  delay(10000);
}
