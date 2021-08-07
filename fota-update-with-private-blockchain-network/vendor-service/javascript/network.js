'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');
const fs = require('fs');

//connect to the config file
const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
let connection_file = config.connection_file;
let gatewayDiscovery = config.gatewayDiscovery;  // = { enabled: true, asLocalhost: true }
let appAdmin = config.appAdmin;
let orgMSPID = config.orgMSPID;

// connect to the connection file
const ccpPath = path.join(process.cwd(), connection_file);
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

const util = require('util');
//--------------------------------------------------------------------------------------------------------------------------

exports.connectToNetwork = async function (managerId) {
    try {

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);

    console.log(`Wallet path: ${walletPath}`);
    console.log(`managerId: ${managerId}`);
    console.log(`wallet: ${util.inspect(wallet)}`);
    console.log(`ccp: ${util.inspect(ccp)}`);
    
    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists(managerId);
    if (!userExists) {
      console.log('An identity for the user ' + managerId + ' does not exist in the wallet');
      console.log('Run the registerUser.js application before retrying');
      let response = {};
      response.error = 'An identity for the user ' + managerId + ' does not exist in the wallet. Register ' + managerId + ' first';
      return response;
    }
    // Create a new gateway for connecting to our peer node.
    console.log('before gateway.connect: ');
    const gateway = new Gateway();
    await gateway.connect(ccpPath, { wallet, identity: managerId, discovery: gatewayDiscovery });

    // Connect to our local fabric
    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');

    console.log('Connected to mychannel. ');
    // Get the contract we have installed on the peer from the network.
    const contract = await network.getContract('fota');


    let networkObj = {
      contract: contract,
      network: network,
      gateway: gateway
    };

    return networkObj;

  } catch (error) {
    console.log(`Error processing transaction. ${error}`);
    console.log(error.stack);
    let response = {};
    response.error = error;
    return response;
  } finally {
    console.log('Done connecting to network.');
    // await gateway.disconnect();
  }
};

exports.invoke = async function (networkObj, isQuery, func, args) {
  try {
    console.log('inside invoke');
    console.log(`isQuery: ${isQuery}, func: ${func}, args: ${args}`);
    console.log(util.inspect(networkObj));


    // console.log(util.inspect(JSON.parse(args[0])));

    if (isQuery === true) {
      console.log('inside isQuery');

      // The transaction function ${func} will be evaluated on the endorsing peers. 
      // This is used for querying the world state. 
      if (args) {
        console.log(`inside isQuery, args: ${args}`);
        if(func != "queryByKey") {
          args = JSON.stringify(args);
        }
        let response = await networkObj.contract.evaluateTransaction(func, args);
        console.log(response);
        console.log(`Transaction ${func} with args ${args} has been evaluated`);
  
        await networkObj.gateway.disconnect();
        return response;
        
      } else {
        let response = await networkObj.contract.evaluateTransaction(func);
        console.log(response);
        console.log(`Transaction ${func} without args has been evaluated`);
  
        await networkObj.gateway.disconnect();
        return response;
      }
    } else {
      console.log('notQuery');
      if (args) {
        console.log('notQuery, args');
        console.log('$$$$$$$$$$$$$ args: ');
        console.log(args);

        console.log(util.inspect(args));
        args = JSON.stringify(args);
        console.log(util.inspect(args));

        console.log('before submit');
        console.log(util.inspect(networkObj));
        let response = await networkObj.contract.submitTransaction(func, args);
        console.log('after submit');

        console.log(response);
        console.log(`Transaction ${func} with args ${args} has been submitted`);
  
        await networkObj.gateway.disconnect();
  
        return response;


      } else {
        let response = await networkObj.contract.submitTransaction(func);
        console.log(response);
        console.log(`Transaction ${func} with args has been submitted`);
  
        await networkObj.gateway.disconnect();
  
        return response;
      }
    };

  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    return error;
  }
};

exports.registerUser = async function (args) {
  console.log('password');
  console.log(args.password);
  console.log('managerId ');
  console.log(args.managerId);

  if (!args.password || !args.managerId || !args.firstName || !args.lastName) {
    let response = {};
    response.error = 'Error! You need to fill all fields before you can register!';
    return response;
  }

  try {

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);
    console.log(`Wallet: ${wallet}`);

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists(args.managerId);
    if (userExists) {
      let response = {};
      console.log(`An identity for the user ${args.managerId} already exists in the wallet`);
      response.error = `Error! An identity for the user ${args.managerId} already exists in the wallet. Please enter
        a different license number.`;
      return response;
    }

    // Check to see if we've already enrolled the admin user.
    const adminExists = await wallet.exists(appAdmin);
    if (!adminExists) {
      console.log(`An identity for the admin user ${appAdmin} does not exist in the wallet`);
      console.log('Run the enrollAdmin.js application before retrying');
      let response = {};
      response.error = `An identity for the admin user ${appAdmin} does not exist in the wallet. 
        Run the enrollAdmin.js application before retrying`;
      return response;
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccpPath, { wallet, identity: appAdmin, discovery: gatewayDiscovery });

    // Connect to our local fabric
    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');

    console.log('Connected to mychannel. ');
    // Get the contract we have installed on the peer from the network.
    const contract = await network.getContract('fota');

    // Get the CA client object from the gateway for interacting with the CA.
    const ca = gateway.getClient().getCertificateAuthority();
    const adminIdentity = gateway.getCurrentIdentity();
    console.log(`AdminIdentity: + ${adminIdentity}`);

    // Register the user, enroll the user, and import the new identity into the wallet.
    const secret = await ca.register({ affiliation: '', enrollmentID: args.managerId, role: 'client' }, adminIdentity);

    const enrollment = await ca.enroll({ enrollmentID: args.managerId, enrollmentSecret: secret });
    const managerIdentity = await X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
    await wallet.import(args.managerId, managerIdentity);

    console.log(`Successfully registered voter ${args.firstName} ${args.lastName}. Use managerId ${args.managerId} to login above.`);
    let response = `Successfully registered voter ${args.firstName} ${args.lastName}. Use managerId ${args.managerId} to login above.`;
    return response;
  } catch (error) {
    console.error(`Failed to register user + ${args.managerId} + : ${error}`);
    let response = {};
    response.error = error;
    return response;
  }
};

