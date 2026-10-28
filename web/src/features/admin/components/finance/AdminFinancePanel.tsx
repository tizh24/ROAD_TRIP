"use client";
import { WorkspacePage, EmptyWorkspace } from "@/components/shell/WorkspacePage";

export default function AdminFinancePanel() {
  return (
    <WorkspacePage title="Tài chính" description="Doanh thu, invoice và reconciliation chỉ hiển thị khi finance data source được kết nối và quyền truy cập hợp lệ." status="Quyền hạn chế">
      <EmptyWorkspace title="Chưa có nguồn dữ liệu tài chính" text="Không hiển thị doanh thu bằng dữ liệu mẫu. Khi integration hoàn tất, báo cáo sẽ có khoảng thời gian, trạng thái đồng bộ và audit metadata. Dữ liệu thanh toán không được hiển thị khi chưa được xác thực." />
    </WorkspacePage>
  );
}
