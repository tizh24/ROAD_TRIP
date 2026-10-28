"use client";
import { WorkspacePage, EmptyWorkspace } from "@/components/shell/WorkspacePage";

export default function AdminAffiliatesPanel() {
  return (
    <WorkspacePage title="Affiliates" description="Commission chỉ hiển thị khi affiliate integration được kích hoạt.">
      <EmptyWorkspace title="Chưa có lượt chuyển đổi nào" text="Tiền hoa hồng từ việc người dùng đặt vé/phòng qua app sẽ được ghi nhận tại đây." />
    </WorkspacePage>
  );
}
