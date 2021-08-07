/**
 * Created by trungquandev.com's author on 17/08/2019.
 * routes/web.js
 */
const express = require("express");
const router = express.Router();
const downloadController = require("../controllers/downloadController");
const loginController = require("../controllers/loginController");
const pushController = require("../controllers/pushController");
const handleRequireController = require("../controllers/handleRequireController");

let initRoutes = (app) => {

  // Gọi ra trang home cho việc login
  router.get("/", loginController.getHome);

  router.get("/signinHome", loginController.signinHome);

  router.post("/signin", loginController.signin);

  // Gọi ra trang home cho việc upload
  router.post("/login", loginController.login);

  router.get("/uploadHome", loginController.getUploadHome);
  
  // Upload nhiều file với phương thức post
  router.post("/pushFirmware", pushController.pushFirmware);

  router.post("/pushSystem", pushController.pushSystem)

  router.post("/pushUpdate", pushController.pushUpdate)

  router.get("/checkRequire/:macAddress", handleRequireController.checkRequire)

  router.get("/verifyRequire/:dataVerify", handleRequireController.verifyRequire)
  
  router.get("/recordRequire/:dataRecord", handleRequireController.recordRequire)

  router.get('/query/:txid', handleRequireController.queryRequire)

  router.get("/files", downloadController.getFilesList)

  router.get("/files/:name", downloadController.downloadFiles)

  router.get('/favicon.ico', (req, res) => {
    const path =  `${__dirname}/../views/favicon.ico`;
  
    res.download(path, (err) => {
      if (err) {
        res.status(500).send({
          message: "File can not be downloaded: " + err,
        });
      }
    })});
  return app.use("/", router);
};

module.exports = initRoutes;
