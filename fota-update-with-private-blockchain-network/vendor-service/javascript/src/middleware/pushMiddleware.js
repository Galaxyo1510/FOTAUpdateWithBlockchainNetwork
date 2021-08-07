'use strict';

const path = require('path');
const fs = require('fs');

//connect to the network file
const network = require('../../network')

//connect to the config file
const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

const util = require("util");
const multer = require("multer");

let storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(`${__dirname}/../../uploadResults`));
  },
  filename: (req, file, callback) => {
    let math = ["application/octet-stream"];
    if (math.indexOf(file.mimetype) === -1) {
      let errorMess = `The file <strong>${file.originalname}</strong> is invalid. Only allowed to upload bin file.`;
      return callback(errorMess, null);
    }
    let filename = req.body.version;
    callback(null, filename);
  }
});

let uploadFile = multer({storage: storage}).array("many-files", 1);

let pushMiddleware = util.promisify(uploadFile);




let push = async function (func, args) {
    try {
        let networkObj = await network.connectToNetwork(config.managerId);
        let invokeResponse = await network.invoke(networkObj, false, func, args);
        console.log(`invokeResponse: ${invokeResponse}`);

    } catch (error) {
        console.error(`Failed to push: ${error}`);
        process.exit(1);
    }
};

let pushSystem = async function (latestFota, macAddress, deviceType) {
    try {
        let args = {
            "latestFota" : latestFota,
            "macAddress"  : macAddress,
            "deviceType" : deviceType
        };
        
        let networkObj = await network.connectToNetwork(config.managerId);
        let invokeResponse = await network.invoke(networkObj, false, 'pushSystem', args);
        console.log(`invokeResponse: ${invokeResponse}`);

    } catch (error) {
        console.error(`Failed to push system "${macAddress}": ${error}`);
        process.exit(1);
    }
};


let pushUpdate = async function (firmwareVersion, macAddress) {
    try {
        let args = {
            "firmwareVersion" : firmwareVersion,
            "macAddress"  : macAddress,
            "timestampSend" : new Date().getTime(),
            "managerId" : config.managerId
        };
        let networkObj = await network.connectToNetwork(config.managerId);
        let invokeResponse = await network.invoke(networkObj, false, 'pushUpdateFOTA', args);
        console.log(`invokeResponse: ${invokeResponse}`);
        config.processing = 'update';
        fs.writeFileSync(configPath, JSON.stringify(config));
    } catch (error) {
        console.error(`Failed to push update "${macAddress}": ${error}`);
        process.exit(1);
    }
};

module.exports = { 
    push: push,
    pushSystem: pushSystem,
    pushUpdate: pushUpdate,
    pushMiddleware: pushMiddleware
  };
