'use strict';


class IoTSystem {
  constructor(latestFota, macAddress, deviceType) {
      this.macAddress = macAddress;
      this.latestFota = latestFota;
      this.deviceType = deviceType;
      this.type = 'system';
      return this;
  }
}
module.exports = IoTSystem;