import React from "react";
import { TextInput, Select } from "@mantine/core";

export type PaymentDetails = {
  total: number; // computed
  discount: number; // total discount amount or percent per UI rule
  centerDiscount?: number; // additional discount from center
  referrerDiscount?: number; // additional discount for referrer
  discountType?: "rupee" | "percent";
  amountReceived: number;
  balance: number; // total - amountReceived - discount
  mode: string; // 'cash' / 'card' / 'upi' etc
  remarks?: string;
};

interface PaymentDetailsProps {
  data: PaymentDetails;
  onChange: (data: Partial<PaymentDetails>) => void;
}

const PaymentDetailsSection: React.FC<PaymentDetailsProps> = ({
  data,
  onChange,
}) => {
  const centerDiscount = data.centerDiscount ?? 0;
  const referrerDiscount = data.referrerDiscount ?? 0;
  const totalDiscount =
    (data.discount ?? 0) + centerDiscount + referrerDiscount;

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex gap-6 items-center justify-between mb-2">
        <div className="text-sm text-gray-700 font-medium">
          Payment Details:
        </div>
        <div className="text-sm text-gray-600">Total: Rs. {data.total}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Discount</label>
          <TextInput
            value={String(data.discount ?? 0)}
            onChange={(e) =>
              onChange({ discount: Number(e.currentTarget.value) || 0 })
            }
            rightSection={<span className="text-xs">%</span>}
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 block">
            Amount received
          </label>
          <TextInput
            value={String(data.amountReceived ?? 0)}
            onChange={(e) =>
              onChange({ amountReceived: Number(e.currentTarget.value) || 0 })
            }
            type="number"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 block">Balance</label>
          <TextInput value={`Rs. ${data.balance ?? 0}`} disabled />
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 block">Mode</label>
          <Select
            data={[
              { value: "cash", label: "Cash" },
              { value: "card", label: "Card" },
              { value: "upi", label: "UPI" },
            ]}
            value={data.mode}
            onChange={(v) => onChange({ mode: v || "cash" })}
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="text-xs text-gray-600 mb-1 block">Remarks</label>
        <TextInput
          value={data.remarks ?? ""}
          onChange={(e) => onChange({ remarks: e.currentTarget.value })}
        />
      </div>
      
    </div>
  );
};

export default PaymentDetailsSection;
