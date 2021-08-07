
'use strict';

const path = require('path');
const fs = require('fs');

//connect to the network file
const network = require('../../network')

//connect to the config file
const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);


let registerManager = async function (managerId, password, firstName, lastName) {
    try {
        let args = {
            "managerId" : managerId,
            "password"  : password,
            "firstName" : firstName,
            "lastName"  : lastName
        };
        let result1 = await network.registerUser(args);
        console.log(`result: ${result1}`);
        let networkObj = await network.connectToNetwork(args.managerId);
        let invokeResponse = await network.invoke(networkObj, false, 'pushManager', args);
        console.log(`invokeResponse: ${invokeResponse}`);

        // if (invokeResponse.error) {
        //     res.send(invokeResponse.error);
        // } else {
    
        // console.log('after network.invoke ');
        // let parsedResponse = JSON.parse(invokeResponse);
        // parsedResponse += '. Use voterId to login above.';
        // res.send(parsedResponse);
    
        // }

    } catch (error) {
        console.error(`Failed to register user "${managerId}": ${error}`);
        process.exit(1);
    }
};

let authenticateManager = async function (managerId, password) {
    try {
        let args = {
            "managerId" : managerId.toString(),
            "password"  : password.toString()
        };
        let networkObj = await network.connectToNetwork(args.managerId);
        let result = await network.invoke(networkObj, true, 'verifyManager', args);
        console.log(`result: ${result}`);
        if (result) {
            config.managerId = managerId;
            fs.writeFileSync(configPath, JSON.stringify(config));
        }
        return result;
    } catch (error) {
        return false;
    }
}

module.exports = { 
    registerManager: registerManager,
    authenticateManager: authenticateManager
  };

