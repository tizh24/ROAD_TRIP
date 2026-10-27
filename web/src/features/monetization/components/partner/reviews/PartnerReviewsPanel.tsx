"use client";
import { WorkspacePage, EmptyWorkspace } from "@/components/shell/WorkspacePage";

export default function PartnerReviewsPanel() {
  return (
    <WorkspacePage title="Đánh giá" description="Phản hồi từ khách sẽ xuất hiện khi review được kích hoạt.">
      <EmptyWorkspace title="Chưa có đánh giá nào" text="Khi có người dùng check-in và để lại đánh giá trên lộ trình, chúng sẽ xuất hiện ở đây." />
    </WorkspacePage>
  );
}
