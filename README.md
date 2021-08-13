******************************************************************************************************************    

KHÓA LUẬN TỐT NGHIỆP CỬ NHÂN

TRƯỜNG ĐẠI HỌC KHOA HỌC TỰ NHIÊN

NGÀNH KỸ THUẬT ĐIỆN TỬ - VIỄN THÔNG

CHUYÊN NGÀNH MÁY TÍNH - HỆ THỐNG NHÚNG

******************************************************************************************************************    

Họ và Tên sv: 	Nguyễn Triệu Thiên Hào

MSSV: 			1720081

Tên đề tài: 	ứng dụng private blockchain network vào hệ thống cập nhật firmware từ xa cho thiết bị IoT

Tên GVHD: 		TS. Huỳnh Hữu Thuận

******************************************************************************************************************    

# FOTAUpdateWithBlockchainNetwork

- Thư mục "bao_cao" lưu trữ nội dung báo cáo của toàn bộ đồ án khóa luận.

- Thư mục "demo" lưu trữ video demo cho đồ án khóa luận.

- Thư mục "firmwareOTA_ESP32" lưu trữ source code lập trình nhúng cho thiết bị IoT (gồm 2 firmware fota0 và fota1).

- Thư mục "fota-update-with-private-blockchain-network" lưu trữ source để xây dựng hạ tầng mạng và ứng dụng dịch vụ.

  + Thư mục con "bin" chứa các thành phần công cụ cung cấp bởi nền tảng Hyperledger Fabric.
  
  + Thư mục con "blockchain-network" lưu trữ các file cấu hình cơ sở hạ tầng mạng (lưu ý file "start_network.sh" là source code để tạo hạ tầng mạng, "stop_network.sh" là source code để kết thúc mạng, "code_in_cli.sh" là source code để lập trình các cấu hình trên channel để cài đặt và khởi tạo đối tượng hợp đồng thông minh).
  
  + Thư mục con "chaincode" lưu trữ source code cho hợp đồng thông minh.
   
  + Thư mục con "vendor-service" lưu trữ source code cho ứng dụng dịch vụ Vendor Service.
