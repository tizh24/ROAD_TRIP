# Web Trip Planning Walking Skeleton — Specification

**Version:** 1.0.0
**Status:** Approved
**Approved:** 2026-08-14
**Created:** 2026-08-14
**Target:** Web-first

## 1. Mục tiêu

Cho phép một người dùng trên web đăng nhập, tạo và quản lý một lịch trình road
trip nhiều ngày, thêm các điểm dừng theo thứ tự, xem kết quả tuyến đường, lưu lại
và mở lại chuyến đi mà không mất dữ liệu.

Phiên bản này phải chứng minh được hành trình cốt lõi có giá trị cho người dùng
thật. Đây không phải bản demo chỉ hiển thị dữ liệu mẫu.

## 2. Giá trị người dùng

Sau khi hoàn thành hành trình, người dùng có thể trả lời được các câu hỏi:

- Tôi sẽ đi vào ngày nào và trong bao lâu?
- Mỗi ngày tôi sẽ ghé những đâu và theo thứ tự nào?
- Tuyến đường dự kiến giữa các điểm dừng ra sao?
- Tôi có thể quay lại tiếp tục chỉnh sửa kế hoạch sau không?
- Tôi có thể chia sẻ chuyến đi với một thành viên khác không?

## 3. Personas và quyền

### 3.1 Khách chưa đăng nhập

- Có thể xem trang công khai và trang đăng nhập.
- Không thể tạo, chỉnh sửa hoặc xem chuyến đi riêng tư.
- Khi cố truy cập chức năng cần tài khoản, được yêu cầu đăng nhập và sau đó quay
  lại đúng hành trình đang thực hiện.

### 3.2 Chủ chuyến đi (Owner)

- Tạo và xem chuyến đi của mình.
- Chỉnh sửa thông tin chung, ngày đi và điểm dừng.
- Sắp xếp lại điểm dừng.
- Mời hoặc gỡ thành viên.
- Quyết định quyền chỉnh sửa của thành viên.
- Xóa chuyến đi trong phạm vi chính sách khôi phục của sản phẩm.

### 3.3 Thành viên (Member)

- Chỉ truy cập chuyến đi khi có lời mời hợp lệ.
- Luôn được xem chuyến đi đã tham gia.
- Chỉ được chỉnh sửa khi owner cấp quyền chỉnh sửa.
- Không thể xóa chuyến đi, chuyển ownership hoặc thay đổi quyền của người khác.

## 4. Phạm vi chức năng

### 4.1 Đăng nhập

Người dùng phải có thể đăng nhập bằng ít nhất một phương thức được hỗ trợ. Sau
khi đăng nhập thành công, người dùng được đưa đến danh sách chuyến đi hoặc quay
lại thao tác bị gián đoạn trước đó.

Nếu đăng nhập thất bại hoặc bị hủy, hệ thống phải hiển thị trạng thái rõ ràng và
cho phép thử lại mà không tạo dữ liệu người dùng hoặc chuyến đi không hoàn chỉnh.

### 4.2 Danh sách chuyến đi

Người dùng đã đăng nhập có thể:

- Xem những chuyến đi mình sở hữu hoặc đã tham gia.
- Phân biệt vai trò của mình trong từng chuyến đi.
- Nhận biết trạng thái cơ bản và khoảng ngày của chuyến đi.
- Mở một chuyến đi để xem hoặc tiếp tục chỉnh sửa.
- Bắt đầu tạo chuyến đi mới.

Khi chưa có chuyến đi, hệ thống hiển thị empty state có hành động tạo chuyến đầu
tiên.

### 4.3 Tạo chuyến đi

Người dùng cung cấp tối thiểu:

- Tên chuyến đi.
- Ngày bắt đầu.
- Ngày kết thúc.

Mô tả và ngân sách dự kiến là tùy chọn trong phiên bản này.

Sau khi tạo thành công:

- Người tạo trở thành owner.
- Hệ thống tạo cấu trúc ngày tương ứng với khoảng thời gian chuyến đi.
- Người dùng được đưa đến màn hình lập lịch trình.
- Chuyến đi phải xuất hiện trong danh sách sau khi tải lại hoặc đăng nhập lại.

Nếu tạo thất bại, người dùng được biết dữ liệu nào cần sửa hoặc có thể thử lại.
Hệ thống không được tạo nhiều chuyến trùng nhau do người dùng bấm lại cùng một
thao tác đang xử lý.

### 4.4 Chỉnh sửa thông tin chuyến đi

Owner hoặc member có quyền chỉnh sửa có thể thay đổi:

- Tên.
- Mô tả.
- Ngày bắt đầu và ngày kết thúc.
- Ngân sách dự kiến.

Khi thay đổi khoảng ngày làm ảnh hưởng các ngày đã có điểm dừng, hệ thống phải
cảnh báo tác động và yêu cầu xác nhận trước khi loại bỏ hoặc di chuyển dữ liệu.

### 4.5 Quản lý ngày đi

- Mỗi ngày thuộc đúng một chuyến đi và một ngày lịch cụ thể.
- Các ngày được hiển thị theo thứ tự thời gian.
- Khoảng ngày luôn liên tục từ ngày bắt đầu đến ngày kết thúc.
- Người dùng không thể tạo hai ngày giống nhau trong cùng chuyến đi.

### 4.6 Tìm và thêm điểm dừng

Owner hoặc member có quyền chỉnh sửa có thể:

- Tìm địa điểm theo từ khóa.
- Xem các thông tin tối thiểu để phân biệt kết quả.
- Chọn một ngày và thêm địa điểm vào ngày đó.
- Nhập ghi chú tùy chọn cho điểm dừng.

Nếu tìm kiếm địa điểm tạm thời không khả dụng, lịch trình đã lưu vẫn phải xem và
chỉnh sửa được ở những phần không phụ thuộc tìm kiếm. Người dùng được thông báo
rõ và có thể thử lại.

### 4.7 Sắp xếp và xóa điểm dừng

- Điểm dừng có thứ tự rõ ràng trong từng ngày.
- Người có quyền chỉnh sửa có thể thay đổi thứ tự.
- Người dùng có thể chuyển điểm dừng sang ngày khác trong cùng chuyến đi.
- Xóa điểm dừng cần có phản hồi rõ ràng và không làm thay đổi các điểm khác.
- Sau khi tải lại trang, thứ tự phải giữ nguyên như lần lưu cuối cùng thành công.

### 4.8 Xem tuyến đường

Khi một ngày có đủ điểm dừng, người dùng có thể yêu cầu xem tuyến đường dự kiến.
Kết quả tối thiểu gồm:

- Thứ tự điểm đi qua.
- Đường đi được biểu diễn trên bản đồ.
- Tổng quãng đường dự kiến.
- Tổng thời gian di chuyển dự kiến.

Nếu không thể tính tuyến:

- Không được làm mất hoặc thay đổi các điểm dừng đã lưu.
- Hệ thống phải phân biệt dữ liệu nhập chưa hợp lệ với lỗi dịch vụ tạm thời khi
  có thể.
- Người dùng có thể thử lại.

Thông tin tuyến đường là ước tính, không phải cam kết an toàn hoặc điều kiện giao
thông thời gian thực.

### 4.9 Lưu và phục hồi trạng thái

- Mọi thay đổi phải thể hiện rõ trạng thái đang lưu, đã lưu hoặc lưu thất bại.
- Chỉ thông báo đã lưu sau khi dữ liệu được xác nhận thành công.
- Tải lại trang không được làm mất thay đổi đã lưu.
- Khi lưu thất bại, người dùng phải được thử lại mà không cần nhập lại toàn bộ
  nội dung nếu phiên trình duyệt vẫn còn hoạt động.
- Nếu hai phiên chỉnh sửa gây xung đột, hệ thống không được âm thầm ghi đè thay
  đổi mới hơn; người dùng phải nhận được thông báo để tải lại hoặc giải quyết.

### 4.10 Mời thành viên

Owner có thể gửi lời mời bằng định danh người dùng được hỗ trợ và chọn quyền:

- Chỉ xem.
- Có thể chỉnh sửa.

Một lời mời phải có trạng thái rõ ràng: đang chờ, đã chấp nhận, đã từ chối, đã
hết hạn hoặc đã thu hồi.

Người ngoài không thể truy cập trip chỉ bằng cách biết hoặc đoán định danh của
trip. Khi owner thu hồi quyền, người bị thu hồi không thể tiếp tục tải dữ liệu
mới hoặc thực hiện chỉnh sửa.

## 5. Quy tắc nghiệp vụ

1. Tên chuyến đi sau khi loại khoảng trắng không được rỗng.
2. Ngày kết thúc không được trước ngày bắt đầu.
3. Khoảng ngày tối đa của phiên bản đầu là 30 ngày.
4. Một chuyến đi có đúng một owner tại một thời điểm.
5. Người tạo chuyến đi trở thành owner và thành viên đầu tiên.
6. Chỉ owner được quản lý thành viên và quyền của họ.
7. Quyền chỉnh sửa không bao gồm quyền xóa trip hoặc quản lý quyền.
8. Mọi thao tác đọc hoặc ghi phải kiểm tra quyền hiện tại, không chỉ quyền tại
   thời điểm đăng nhập.
9. Một điểm dừng phải thuộc một ngày của chính chuyến đi đó.
10. Thứ tự điểm dừng trong một ngày không được trùng nhau sau khi lưu hoàn tất.
11. Ngân sách, nếu có, phải là số không âm và có đơn vị tiền tệ xác định.
12. Các thao tác được gửi lại do lỗi mạng không được tạo bản ghi trùng ngoài ý
    muốn.

## 6. Hành trình người dùng ưu tiên

### Journey A — Tạo lịch trình đầu tiên

1. Khách truy cập web và đăng nhập.
2. Người dùng chọn tạo chuyến đi.
3. Người dùng nhập tên và khoảng ngày hợp lệ.
4. Chuyến đi được tạo và hiển thị các ngày tương ứng.
5. Người dùng tìm rồi thêm ít nhất hai điểm dừng.
6. Người dùng sắp xếp điểm dừng.
7. Người dùng xem tuyến đường dự kiến.
8. Người dùng tải lại trang và vẫn thấy dữ liệu đã lưu.

### Journey B — Tiếp tục chỉnh sửa

1. Người dùng đăng nhập lại.
2. Người dùng thấy chuyến đi trong danh sách.
3. Người dùng mở trip và thấy trạng thái gần nhất đã lưu.
4. Người dùng thay đổi một điểm dừng.
5. Hệ thống xác nhận thay đổi đã được lưu.

### Journey C — Cộng tác có kiểm soát

1. Owner mời một người dùng với quyền chỉ xem.
2. Người được mời chấp nhận và xem được trip nhưng không sửa được.
3. Owner nâng quyền thành có thể chỉnh sửa.
4. Member thay đổi thứ tự điểm dừng thành công.
5. Member không thể xóa trip hoặc quản lý thành viên.
6. Owner thu hồi quyền và member không thể tiếp tục truy cập dữ liệu mới.

## 7. Trường hợp biên và lỗi bắt buộc

- Phiên đăng nhập hết hạn trong lúc chỉnh sửa.
- Người dùng gửi form tạo trip nhiều lần.
- Tên chỉ gồm khoảng trắng.
- Ngày kết thúc trước ngày bắt đầu.
- Khoảng ngày vượt quá giới hạn.
- Địa điểm không có kết quả hoặc kết quả không đầy đủ.
- Dịch vụ tìm kiếm hoặc tính tuyến tạm thời không hoạt động.
- Người dùng mất mạng trong lúc lưu.
- Hai cửa sổ chỉnh sửa cùng một trip.
- Member bị thu hồi quyền trong khi đang mở trip.
- Trip hoặc stop đã bị xóa/thay đổi trước khi thao tác hiện tại hoàn tất.
- Người ngoài thử truy cập trực tiếp bằng URL.
- Tuyến đường không thể đi qua toàn bộ điểm đã chọn.

## 8. Yêu cầu trải nghiệm cơ bản

- Hoạt động tốt trên desktop và màn hình web cỡ tablet/mobile phổ biến.
- Mọi hành động bất đồng bộ có trạng thái đang xử lý rõ ràng.
- Không cho phép gửi lặp khi một thao tác không an toàn đang xử lý.
- Có empty, loading, error, success và retry state.
- Có thể sử dụng luồng chính bằng bàn phím.
- Thông báo lỗi hướng dẫn người dùng khắc phục, không hiển thị lỗi nội bộ.
- Dữ liệu minh họa phải được phân biệt với dữ liệu người dùng thật.

## 9. Tiêu chí nghiệm thu

Walking skeleton được chấp nhận khi:

1. Một người dùng mới hoàn thành Journey A trên môi trường staging mà không cần
   can thiệp trực tiếp vào dữ liệu.
2. Dữ liệu đã lưu vẫn tồn tại sau khi tải lại và đăng nhập lại.
3. Owner, member chỉ xem, member chỉnh sửa và outsider đều bị giới hạn đúng theo
   ma trận quyền.
4. Thử gửi lặp thao tác tạo không sinh hai trip ngoài ý muốn.
5. Lỗi tìm kiếm hoặc tính tuyến không làm mất itinerary đã lưu.
6. Xung đột chỉnh sửa không âm thầm ghi đè dữ liệu mới hơn.
7. Journey A, B và các đường dẫn phân quyền quan trọng được kiểm chứng tự động.
8. Người vận hành có thể xác định một request thất bại từ đầu đến cuối mà không
   đọc dữ liệu nhạy cảm của người dùng.
9. Hệ thống có thể được khởi động trong môi trường phát triển theo hướng dẫn và
   triển khai lên staging một cách lặp lại.

## 10. Chỉ số sản phẩm ban đầu

Các hành vi cần đo lường theo cách bảo vệ quyền riêng tư:

- Hoàn tất đăng nhập.
- Bắt đầu và hoàn tất tạo trip.
- Thêm điểm dừng đầu tiên.
- Tính tuyến thành công hoặc thất bại.
- Mời và chấp nhận thành viên.
- Quay lại chỉnh sửa trip.

Các chỉ số đánh giá ban đầu:

- Tỷ lệ người đăng nhập tạo được trip đầu tiên.
- Thời gian trung vị từ đăng nhập đến điểm dừng đầu tiên.
- Tỷ lệ trip có ít nhất hai điểm dừng.
- Tỷ lệ tính tuyến thành công.
- Tỷ lệ người dùng quay lại chỉnh sửa trong 7 ngày.

## 11. Ngoài phạm vi phiên bản này

- Ứng dụng mobile native.
- Offline-first và tải bản đồ offline.
- GPS tracking và group live location.
- SOS và cảnh báo an toàn.
- Check-in thực tế trong chuyến đi.
- Ghi nhận, chia và thanh toán expense.
- Trip memory, photobook và xuất PDF.
- Community feed, post, comment, challenge và clone trip công khai.
- Partner portal, quảng cáo, affiliate, subscription và payment.
- AI recommendation và tối ưu itinerary tự động.
- Chat nhóm và voting.

## 12. Giả định cần xác nhận

Specification này sử dụng các giả định sau:

1. Web là client duy nhất của walking skeleton đầu tiên.
2. Chuyến đi mặc định là riêng tư.
3. Người được mời phải có hoặc tạo tài khoản trước khi truy cập.
4. V1 hỗ trợ một loại tiền tệ cho mỗi trip, mặc định theo thị trường Việt Nam.
5. Giới hạn chuyến đi ban đầu là 30 ngày.
6. Owner có thể cấp quyền chỉ xem hoặc chỉnh sửa.
7. Xóa trip cần khả năng khôi phục trong một khoảng thời gian, thay vì mất ngay
   lập tức.

Các giả định thay đổi sau khi duyệt phải được cập nhật trong specification trước
khi tạo technical plan.
