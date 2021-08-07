'use strict';
const sha256 = require('js-sha256');

class Manager {
  constructor(managerId, password, firstName, lastName) {
      this.managerId = managerId;
      this.password = sha256(password);
      this.firstName = firstName;
      this.lastName = lastName;
      this.type = 'manager';
      return this;
  }
}
module.exports = Manager;