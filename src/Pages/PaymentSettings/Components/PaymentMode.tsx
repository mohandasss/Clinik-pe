import React from "react";
import { Switch } from "@mantine/core";

type PaymentModeProps = {
  cashPayment: boolean;
  onlinePayment: boolean;
  onCashChange: (value: boolean) => void;
  onOnlineChange: (value: boolean) => void;
};

const PaymentMode: React.FC<PaymentModeProps> = ({
  cashPayment,
  onlinePayment,
  onCashChange,
  onOnlineChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100 h-full flex flex-col">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Payment Mode
        </h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="cash-payment" className="text-gray-700 font-medium">
            Cash Payment
          </label>
          <Switch
            id="cash-payment"
            checked={cashPayment}
            onChange={(e) => onCashChange(e.currentTarget.checked)}
            size="sm"
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="online-payment" className="text-gray-700 font-medium">
            Online Payment
          </label>
          <Switch
            id="online-payment"
            checked={onlinePayment}
            onChange={(e) => onOnlineChange(e.currentTarget.checked)}
            size="sm"
          />
        </div>
      </div>

      {/* filler to occupy remaining height so there is no internal scroll */}
      <div className="flex-1" />
    </div>
  );
};

export default PaymentMode;
