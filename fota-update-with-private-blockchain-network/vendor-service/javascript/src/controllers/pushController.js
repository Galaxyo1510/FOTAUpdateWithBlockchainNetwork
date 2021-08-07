
'use strict';

const pushMiddleware = require("../middleware/pushMiddleware");

const sha256 = require('js-sha256');
//connect to the network file
const network = require('../../network')
//connect to the config file
const path = require('path');
const fs = require('fs');
const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
const managerId = config.managerId;

let debug = console.log.bind(console);

let pushFirmware = async (req, res) => {
  try {
    // thực hiện upload
    await pushMiddleware.pushMiddleware(req, res);

    // Nếu upload thành công, không lỗi thì tất cả các file của bạn sẽ được lưu trong biến req.files
    debug(req.files);

    let data = fs.readFileSync(req.files[0].path, 'utf8');
    var hash = sha256(data.substr(0,-32));
    console.log("\nhash: ");
    console.log(hash);

    let networkObj = await network.connectToNetwork(managerId);
    let args = {
        "firmwareVersion" : req.files[0].filename,
        "firmwareHash"  : hash,
        "url" : "http://localhost:5000/files/" + req.files[0].filename,
        "deviceType" : req.body.deviceType,
        "timestamp" : new Date().getTime(),
        "managerId"  : managerId
    };
    let invokeResponse = await network.invoke(networkObj, false, 'pushFOTA', args);

    // Mình kiểm tra thêm một bước nữa, nếu như không có file nào được gửi lên thì trả về thông báo cho client
    if (req.files.length <= 0) {
      return res.send(`You must select at least 1 file or more.`);
    }

    // trả về cho người dùng cái thông báo đơn giản.
    return res.send(`Your files has been uploaded.`);
  } catch (error) {
    // Nếu có lỗi thì debug lỗi xem là gì ở đây
    debug(error);

    // Bắt luôn lỗi vượt quá số lượng file cho phép tải lên trong 1 lần
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.send(`Exceeds the number of files allowed to upload.`);
    }

    return res.send(`Error when trying upload many files: ${error}}`);
  }
};

let pushSystem = async (req, res) => {
  try {
    await pushMiddleware.pushSystem(req.body.latestFota, req.body.macAddress, req.body.deviceType);
    return res.send(`Your require has been uploaded.`)
  } catch (error) {
    // Nếu có lỗi thì debug lỗi xem là gì ở đây
    debug(error);
    return res.send(`Error when trying push system: ${error}}`);
  }
};

let pushUpdate = async (req, res) => {
  try {
    await pushMiddleware.pushUpdate(req.body.firmwareVersion, req.body.macAddress);

    return res.send(`Your require has been uploaded.`)
  } catch (error) {
    // Nếu có lỗi thì debug lỗi xem là gì ở đây
    debug(error);
    return res.send(`Error when trying push update: ${error}}`);
  }
};

module.exports = { 
  pushSystem: pushSystem,
  pushUpdate: pushUpdate,
  pushFirmware: pushFirmware
};