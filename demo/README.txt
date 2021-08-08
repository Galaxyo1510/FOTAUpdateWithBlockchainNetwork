"demo_build_blockchain_network.mp4": 
	- mô phỏng quá trình xây dựng một mạng Private Blockchain thông qua nền tảng Hyperledger Fabric.
	- quá trình xây dựng:
		+ run file start_network.sh để xây dựng kiến trúc cơ sở hạ tầng mạng. Sau khi run, kết quả thu về là các container được ghi nhận trong Docker Engine.
		+ thực hiện quá trình triển khai Smart Contract thông qua giao diện dòng lệnh trong container cli. Kết quả thu về là container đối tượng Smart Contract được khởi tạo trên peer0.org1.

"demo_vendor_service.mp4":
	- mô phỏng quá trình sử dụng ứng dụng khách Vendor Service để thực hiện quá trình cập nhật firmware cho thiết bị IoT ESP32.
	- quá trình sử dụng:
		+ đăng ký và đăng nhập tài khoản Manager.
		+ khởi tạo các thành phần cần thiết thông qua giao diện web (firmware, thiết bị IoT).
		+ tạo yêu cầu cập nhật và kiểm tra quá trình xử lý yêu cầu cập nhật thông qua giao diện console của Arduino IDE.
		+ Đồng thời kiểm tra thông tin các đối tượng trong World State thông qua giao diện CouchDB.