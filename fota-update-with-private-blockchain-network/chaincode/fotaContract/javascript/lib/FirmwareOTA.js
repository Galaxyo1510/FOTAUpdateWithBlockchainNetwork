'use strict';
class FirmwareOTA {
  constructor(firmwareVersion, firmwareHash, url, deviceType, timestamp, managerId) {
      this.firmwareVersion = firmwareVersion;
      this.managerId = managerId;
      this.firmwareHash = firmwareHash;
      this.url = url;
      this.deviceType = deviceType;
      this.timestamp = timestamp;
      this.type = 'fota';
      return this;
  }
}
module.exports = FirmwareOTA;