"use client";
import { WorkspacePage, EmptyWorkspace } from "@/components/shell/WorkspacePage";

export default function CampaignsPanel() {
  return (
    <WorkspacePage title="Chiến dịch" description="Quản lý hiển thị ưu tiên khi campaign service được kết nối.">
      <EmptyWorkspace title="Chưa có chiến dịch mới nào" text="Tạo chiến dịch sẽ khả dụng khi module quảng cáo được kết nối. Danh sách và trạng thái chiến dịch sẽ hiển thị tại đây." />
    </WorkspacePage>
  );
}
