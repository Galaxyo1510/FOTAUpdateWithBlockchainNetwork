/**
 * Created by trungquandev.com's author on 17/08/2019.
 * server.js
 */
const express = require("express");
var bodyParser = require('body-parser');
const app = express();
const initRoutes = require("./routes/web");
// Cho phép lý dữ liệu từ form method POST
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json());
// Khởi tạo các routes cho ứng dụng
initRoutes(app);

// chọn một port mà bạn muốn và sử dụng để chạy ứng dụng tại local
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`I'm running at localhost:${PORT}/`);
});
