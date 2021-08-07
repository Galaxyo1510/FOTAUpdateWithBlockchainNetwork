'use strict';

const path = require('path');
const fs = require('fs');
const network = require('../../network')
const util = require('util');

//connect to the config file
const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);


const checkRequire = async (req, res) => {

    let networkObj = await network.connectToNetwork(config.managerId);
    let args = {"indexName":"updateOner~name", "key":config.managerId}
    let responsePayload = await network.invoke(networkObj, true, 'queryAllByPartialCompositeKey', args);
    responsePayload = JSON.parse(responsePayload);
    console.log(`update: ${util.inspect(responsePayload)}`);
    let require = {
        "txid":"null",
        "firmwareVersion":"null"
    };
    let i = 0;
    let pivot = -1;
    while (responsePayload[i] != undefined) {
        let pending = JSON.parse(responsePayload[i]);
        if (pending.status === "unverified" && req.params.macAddress === pending.macAddress) {
            if (pivot === -1) {
                pivot = i;
            } else {
                let prePending = JSON.parse(responsePayload[pivot]);
                if (pending.timestampSend < prePending.timestampSend) pivot = i;
            }
        }
        i++;
    }
    let  response = {"response": "FALSE","require":"null"};
    if (pivot != -1) {
        let require = JSON.parse(responsePayload[pivot]);
        response = {
            "response": "TRUE",
            "require": {
                "txid": require.txid,
                "firmwareVersion":require.firmwareVersion
            }
        };
    }
    // lựa ra 1 cái thôi trả về pending
    res.status(200).json(response);
};

const verifyRequire = async function (req, res) {
    try {
        let dataVerify = req.params.dataVerify.toString().split(",");
        let args = {"txid":dataVerify[0], "firmwareHash":dataVerify[1]}
        console.log(`data: ${util.inspect(args)}`);

        let networkObj = await network.connectToNetwork(config.managerId);
        let result = await network.invoke(networkObj, false, 'verifyRequire', args);

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.status(200).json({response: result.toString()});
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
};
  


const recordRequire = async (req, res) => {
    try {
        let dataRecord = req.params.dataRecord.toString().split(",");
        let args = {
            "txid":         dataRecord[0], 
            "statusDevice": dataRecord[1], 
        }
        console.log(`data: ${util.inspect(args)}`);

        let networkObj = await network.connectToNetwork(config.managerId);
        let result = await network.invoke(networkObj, false, 'recordRequire', args);
         
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        res.status(200).json({response: result.toString()});
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
};


let queryRequire = async function (req, res) {
    try {
      let networkObj = await network.connectToNetwork(managerId);
      let result = await network.invoke(networkObj, true, 'queryByKey', req.params.txid.toString());
      console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
      res.status(200).json({response: result.toString()});
  } catch (error) {
      console.error(`Failed to evaluate transaction: ${error}`);
      res.status(500).json({error: error});
      process.exit(1);
    }
  };
  

module.exports = { 
    checkRequire:   checkRequire,
    verifyRequire:  verifyRequire,
    recordRequire:  recordRequire,
    queryRequire: queryRequire
};