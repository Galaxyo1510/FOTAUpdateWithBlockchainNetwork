'use strict';

class UpdateFOTA {
  constructor(ctx, firmwareVersion, macAddress, timestampSend, managerId) {
      this.firmwareVersion = firmwareVersion;
      this.macAddress = macAddress;
      this.txid = ctx.stub.getTxID();
      this.managerId = managerId;
      this.timestampSend = timestampSend;
      this.timestampReceive = "";
      this.status = 'unverified';
      this.failedAttempts = 0;
      this.type = 'update';
      return this;
  }
}
module.exports = UpdateFOTA;