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

## Giới thiệu đề tài

Đề tài tập trung xây dựng hệ thống cung cấp dịch vụ cập nhật firmware từ xa cho các thiết bị IoT được đăng ký trên hệ thống. Thông qua kiến trúc mạng Private Blockchain để tăng tính bảo mật trong quá trình lưu trữ và vận chuyển dữ liệu trên môi trường mạng.

## Mô tả hoạt động hệ thống

+ Các người dùng đầu cuối (các Manager) sẽ đăng nhập vào hệ thống thông qua thông tin định danh được đăng ký trước đó trên hệ thống. Thông qua việc đăng nhập, các Manager sẽ có thể truy cập đến các gateway trong mạng để thực hiện các giao dịch mạng.

+ Đăng tải/ đăng ký các cấu trúc dữ liệu trên cơ sở dữ liệu của hệ thống: thông tin thiết bị IoT, file binary firmware và thông tin mô tả.

+ Thực hiện đăng tải yêu cầu cập nhật firmware được chỉ định cho một thiết bị IoT trên cơ sở dữ liệu. 

+ Hệ thống thực hiện quá trình xác thực yêu cầu và cập nhật lại tình trạng quá trình trên đối tượng lưu trữ trong cơ sở dữ liệu hệ thống. Qua đó, các Manager có thể truy vấn để kiểm tra tình trạng của yêu cầu.

## Kiến trúc hệ thống

+ Các thiết bị IoT: trong nội dung nghiên cứu, thiết bị dược lựa chọn là ESP32-NodeMCU. Thiết bị cung cấp tính năng giao tiếp môi trường mạng thông qua chuẩn WiFi, qua đó thiết bị dễ dàng giao tiếp các hệ thống mạng bằng giao thức HTTP/HTTPS.   

+ Cơ sở hạ tầng mạng Private Blockchain: được xây dựng dựa trên nền tảng Hyperledger Fabric theo mô hình mạng ngang hàng (peer to peer) và công nghệ Sổ cái phân tán. Mạng cung cấp các gateway để các ứng dụng khách và người dùng dễ dàng truy cập đến các kênh phân phôi trong mạng. Các thành phần vật lý trong mạng được triển khai trên nền tảng Docker.

+ Hợp đồng thông minh: một hợp đồng thông minh sẽ được xây dựng và triển khai trên các kênh trong mạng. qua đó cung cấp các đơn vị cơ sở dữ liệu (dựa trên nền tảng CouchDB) cho các peer trong mạng. Chức năng để lưu trữ các logic giao dịch hỗ trợ việc giao tiếp người dùng đầu cuối với cơ sở dữ liệu. 

+ Ứng dụng khách Vendor Service: được xây dựng dựa trên 1 web server trên nền tảng JavaScript qua đó cung cấp các API hỗ trợ việc trao đổi các giao dịch giữa các thành phần trong mạng. 

## Mã nguồn đồ án

- Thư mục "bao_cao" lưu trữ nội dung báo cáo của toàn bộ đồ án khóa luận.

- Thư mục "demo" lưu trữ video demo cho đồ án khóa luận.

- Thư mục "firmwareOTA_ESP32" lưu trữ source code lập trình nhúng cho thiết bị IoT (gồm 2 firmware fota0 và fota1).

- Thư mục "fota-update-with-private-blockchain-network" lưu trữ source để xây dựng hạ tầng mạng và ứng dụng dịch vụ.

  + Thư mục con "bin" chứa các thành phần công cụ cung cấp bởi nền tảng Hyperledger Fabric.
  
  + Thư mục con "blockchain-network" lưu trữ các file cấu hình cơ sở hạ tầng mạng (lưu ý file "start_network.sh" là source code để tạo hạ tầng mạng, "stop_network.sh" là source code để kết thúc mạng, "code_in_cli.sh" là source code để lập trình các cấu hình trên channel để cài đặt và khởi tạo đối tượng hợp đồng thông minh).
  
  + Thư mục con "chaincode" lưu trữ source code cho hợp đồng thông minh.
   
  + Thư mục con "vendor-service" lưu trữ source code cho ứng dụng dịch vụ Vendor Service.
