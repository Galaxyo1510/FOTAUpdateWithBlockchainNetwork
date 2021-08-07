
'use strict';

const path = require("path");
const registerMiddleware = require("../middleware/registerMiddleware");

let getHome = (req, res) => {
    return res.sendFile(path.join(`${__dirname}/../views/login.html`));
  };

let login = async (req, res) => {
    console.log(`managerId: ${req.body.managerId}`);
    console.log(`password: ${req.body.pwd}`);
    const verify = await registerMiddleware.authenticateManager(req.body.managerId, req.body.pwd);
    console.log(`verify: ${verify}`);

    if (verify) {
        return res.sendFile(path.join(`${__dirname}/../views/master.html`));
    } else {
        let err = `An identity for the manager "${req.body.managerId}" does not exist in the wallet`;
        return res.send(err);
    }
};

let signinHome = (req, res) => {
    return res.sendFile(path.join(`${__dirname}/../views/signin.html`));
};

let getUploadHome = (req, res) => {
    return res.sendFile(path.join(`${__dirname}/../views/master.html`));
};

let signin = async (req, res) => {
    await registerMiddleware.registerManager(req.body.managerId, req.body.pwd, req.body.firstName, req.body.lastName);
    return res.sendFile(path.join(`${__dirname}/../views/login.html`));
};

module.exports = {
    getUploadHome:  getUploadHome,
    getHome:        getHome,
    login:          login,
    signinHome:     signinHome,
    signin:         signin
};
