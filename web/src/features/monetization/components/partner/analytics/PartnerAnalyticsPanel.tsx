"use client";
import { WorkspacePage, EmptyWorkspace } from "@/components/shell/WorkspacePage";

export default function PartnerAnalyticsPanel() {
  return (
    <WorkspacePage title="Phân tích" description="Chỉ số hiệu quả sẽ xuất hiện khi có nguồn dữ liệu được kết nối.">
      <EmptyWorkspace title="Đang thu thập dữ liệu" text="Biểu đồ sẽ hiển thị khi chiến dịch của bạn bắt đầu có lượt tương tác đầu tiên." />
    </WorkspacePage>
  );
}
