import React from "react";
import { TextInput, Select, Button, Group } from "@mantine/core";
import { IconPercentage, IconCurrencyRupee } from "@tabler/icons-react";

export type PaymentDetails = {
  total: number; // computed from all investigations
  discount_unit: "flat" | "percent"; // renamed from discountType
  discount_value: number; // discount amount or percentage
  payable_amount: number; // computed: total - discount (considering unit)
  amount_received: number; // actual amount received from patient
  mode: string; // 'cash' / 'upi'
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
  // Calculate payable amount based on discount
  const calculatePayableAmount = () => {
    if (data.discount_unit === "percent") {
      return data.total - (data.total * data.discount_value) / 100;
    }
    return data.total - data.discount_value;
  };

  const payableAmount = calculatePayableAmount();

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex gap-6 items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-700 font-medium">
            Payment Details:
          </div>
          <Group gap="xs">
            <Button
              size="xs"
              variant={data.discount_unit === "flat" ? "filled" : "light"}
              color="blue"
              leftSection={<IconCurrencyRupee size={14} />}
              onClick={() => onChange({ discount_unit: "flat" })}
            >
              Flat
            </Button>
            <Button
              size="xs"
              variant={data.discount_unit === "percent" ? "filled" : "light"}
              color="blue"
              leftSection={<IconPercentage size={14} />}
              onClick={() => onChange({ discount_unit: "percent" })}
            >
              %
            </Button>
          </Group>
        </div>
        <div className="text-sm text-gray-600">Total: Rs. {data.total}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Discount</label>
          <TextInput
            value={String(data.discount_value ?? 0)}
            onChange={(e) => {
              const value = Number(e.currentTarget.value) || 0;
              onChange({ discount_value: value });
            }}
            type="number"
            min="0"
            rightSection={
              <span className="text-xs">
                {data.discount_unit === "percent" ? "%" : "Rs"}
              </span>
            }
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 block">
            Payable amount
          </label>
          <TextInput value={`Rs. ${payableAmount.toFixed(2)}`} disabled />
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 block">
            Amount received
          </label>
          <TextInput
            value={String(data.amount_received ?? 0)}
            onChange={(e) =>
              onChange({ amount_received: Number(e.currentTarget.value) || 0 })
            }
            type="number"
            min="0"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 block">Mode</label>
          <Select
            data={[
              { value: "cash", label: "Cash" },
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
