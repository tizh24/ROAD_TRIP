"use client";
import { WorkspacePage, EmptyWorkspace } from "@/components/shell/WorkspacePage";

export default function PartnerBillingPanel() {
  return (
    <WorkspacePage title="Thanh toán" description="Phương thức thanh toán và hoá đơn chỉ hiện khi integration sẵn sàng.">
      <EmptyWorkspace title="Chưa có dữ liệu thanh toán" text="Số dư, phương thức nạp tiền và hoá đơn sẽ xuất hiện khi hệ thống thanh toán đối tác được kết nối." />
    </WorkspacePage>
  );
}
