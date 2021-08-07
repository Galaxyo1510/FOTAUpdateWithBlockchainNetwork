/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

//import Hyperledger Fabric 1.4 SDK
const { Contract } = require('fabric-contract-api');

//import our file which contains our constructors and auxiliary function
const sha256 = require('js-sha256');
const Manager = require('./Manager')
const FirmwareOTA = require('./FirmwareOTA')
const IoTSystem = require('./IoTSystem')
const UpdateFOTA = require('./UpdateFOTA')

class MyFotaContract extends Contract {
    
    async init(ctx){
        console.info('============= START : Initialize Ledger ===========');
        const myAsset = 
            {
                managerDashboard:       {indexName: 'manager~name'      , key: "manager"},
                systemDashboard:        {indexName: 'system~name'       , key: "system"},
                fotaDashboard:          {indexName: 'fota~name'         , key: "fota"},
                updateDashboard:        {indexName: 'update~name'       , key: "update"},
                fotaByOnerDashboard:    {indexName: 'fotaOner~name'     , key: "~managerId"},
                updateByOnerDashboard:  {indexName: 'updateOner~name'   , key: "~managerId"},
            };
        await ctx.stub.putState('dashboard', Buffer.from(JSON.stringify(myAsset)));
        console.info('Added <--> ', myAsset);
        console.info('============= END : Initialize Ledger ===========');
    }

    async pushManager(ctx, args) {
        args = JSON.parse(args.toString());
        //create a new manager
        let newManager = await new Manager(args.managerId, args.password, args.firstName, args.lastName);
        let indexName = 'manager~name';
        let managerIndexKey = ctx.stub.createCompositeKey(indexName, [newManager.type, newManager.managerId]);
        //update state with new manager
        await ctx.stub.putState(newManager.managerId, Buffer.from(JSON.stringify(newManager)));
        await ctx.stub.putState(managerIndexKey, Buffer.from('\u0000'));
    }

    async pushSystem(ctx, args) {
        args = JSON.parse(args.toString());

        let system = await new IoTSystem(args.latestFota, args.macAddress, args.deviceType);
        
        let indexName = 'system~name';
        let systemIndexKey = ctx.stub.createCompositeKey(indexName, [system.type, system.macAddress]);
        // //update state with system object we just created
        await ctx.stub.putState(system.macAddress, Buffer.from(JSON.stringify(system)));
        await ctx.stub.putState(systemIndexKey, Buffer.from('\u0000'));
    }

     async pushFOTA(ctx, args) {
        args = JSON.parse(args.toString());
        //generate fota
        let fota = await new FirmwareOTA(args.firmwareVersion, args.firmwareHash, args.url, args.deviceType, args.timestamp, args.managerId);
        
        let indexName = 'fotaOner~name';
        let fotaOnerIndexKey = ctx.stub.createCompositeKey(indexName, [args.managerId, fota.firmwareVersion]);
        //update state with fota object we just created
        await ctx.stub.putState(fota.firmwareVersion, Buffer.from(JSON.stringify(fota)));
        await ctx.stub.putState(fotaOnerIndexKey, Buffer.from('\u0000'));
    }
    
    async pushUpdateFOTA(ctx, args) {
        args = JSON.parse(args.toString());
        // generate update
        let update = await new UpdateFOTA(ctx, args.firmwareVersion, args.macAddress, args.timestampSend, args.managerId);
        let indexName = 'updateOner~name';
        let updateOnerIndexKey = ctx.stub.createCompositeKey(indexName, [args.managerId, update.txid]);
        // update state with fota object we just created
        await ctx.stub.putState(update.txid, Buffer.from(JSON.stringify(update)));
        await ctx.stub.putState(updateOnerIndexKey, Buffer.from('\u0000'));
    }

    async verifyRequire(ctx, args) {
        args = JSON.parse(args.toString());
        let response = "";
        // need to create enum object for error response

        let update = await this.queryByKey(ctx, args.txid); 
        if (update === "NOT_EXIST") {
            response = "NO_MATCH_TXID";
        } else {
            update = JSON.parse(update);

            let fota = await this.queryByKey(ctx, update.firmwareVersion); 
            if (fota === "NOT_EXIST") {
                response = "NO_HAVE_FOTA";
                update.status = "aborted";
                update.failedAttempts++;
            } else {
                fota = JSON.parse(fota);
    
                if (fota.firmwareHash === args.firmwareHash) {
                    response = "VERIFIED";
                    update.status = "verified";
                } else {
                    response = "NO_MATCH_HASH";
                    update.status = "aborted";
                    update.failedAttempts++;
                }
            }
            await ctx.stub.putState(update.txid, Buffer.from(JSON.stringify(update)));
        }
        return response;
    }
    async verifyManager(ctx, args) {
        args = JSON.parse(args.toString());
        
        let response = false;
        // need to create enum object for error response

        let manager = await this.queryByKey(ctx, args.managerId); 
        if (manager === "NOT_EXIST") response = false;
        else {
            manager = JSON.parse(manager);

            if (manager.password === sha256(args.password)) {
                response = true;
            } else {
                response = false;
            }
        }
        return response;
    }

    async recordRequire(ctx, args) {
        args = JSON.parse(args.toString());
        let response = "";

        let update = await this.queryByKey(ctx, args.txid); 
        if (update === "NOT_EXIST") {
            response = "ABORTED";
        } else {
            update = JSON.parse(update);

            switch(args.statusDevice) {
                case "DONE":
                    response = "COMPLETED";
                    update.status = "completed";
                    // cập nhật lastestFirmware trong hệ thống
                    let system = await this.queryByKey(ctx, update.macAddress); 
                    if (system === "NOT_EXIST") {
                        response = "NO_HAVE_SYSTEM";
                    } else {
                        system = JSON.parse(system);
                        system.latestFota = update.firmwareVersion;
                        await ctx.stub.putState(system.macAddress, Buffer.from(JSON.stringify(system)));
                    }
                    break;
                case "FAIL":
                    response = "CONTINUE";
                    update.status = "unverified";
                    update.failedAttempts++;
                    break;
                default:
                    response = "ABORTED";
                    update.status = "aborted";
                    update.failedAttempts++;
                }
            await ctx.stub.putState(update.txid, Buffer.from(JSON.stringify(update)));
        }
        return response;
    }


    async queryAllByPartialCompositeKey(ctx, args) {
        args = JSON.parse(args.toString());
        
        let arrResult = [];
        let resultsIterator = await ctx.stub.getStateByPartialCompositeKey(args.indexName, [args.key]);

        while (true) {
            let responseRange = await resultsIterator.next();
            if (!responseRange || !responseRange.value || !responseRange.value.key) {
                return arrResult;
            }
            console.log(responseRange.value.key);

            // let value = res.value.value.toString('utf8');
            let objectType;
            let attributes;
            ({
                objectType,
                attributes
            } = await ctx.stub.splitCompositeKey(responseRange.value.key));

            let returnedId = attributes[1];

            const buffer = await ctx.stub.getState(returnedId); // get the car from chaincode state
            if (!buffer || buffer.length === 0) {
                throw new Error(`this does not create`);
            }
            arrResult.push(buffer.toString());
        }
    }

    async queryByKey (ctx, key) {
        const buffer = await ctx.stub.getState(key.toString()); // get the car from chaincode state
        if (!buffer || buffer.length === 0) {
            return "NOT_EXIST";
        }
        else return buffer.toString();
    }
}
module.exports = MyFotaContract;
