import React from "react";
import { Select, TextInput } from "@mantine/core";

interface PaymentSectionProps {
  actualFee: number;
  discountType: "percentage" | "flat" | "";
  onDiscountTypeChange: (type: "percentage" | "flat" | "") => void;
  discountValue: string;
  onDiscountValueChange: (value: string) => void;
  payableAmount: number;
  amountPaid: string;
  onAmountPaidChange: (value: string) => void;
  isPaymentReceived: boolean;
  onPaymentReceivedChange: (value: boolean) => void;
  paymentMode: "cash" | "online" | "card" | "";
  onPaymentModeChange: (mode: "cash" | "online" | "card" | "") => void;
  paymentNote: string;
  onPaymentNoteChange: (note: string) => void;
  loadingFee: boolean;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  actualFee,
  discountType,
  onDiscountTypeChange,
  discountValue,
  onDiscountValueChange,
  payableAmount,
  amountPaid,
  onAmountPaidChange,
  isPaymentReceived,
  onPaymentReceivedChange,
  paymentMode,
  onPaymentModeChange,
  paymentNote,
  onPaymentNoteChange,
  loadingFee,
}) => {
  if (loadingFee) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-sm text-gray-500">Loading fee...</p>
      </div>
    );
  }

  if (!actualFee || actualFee === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-800">
          Payment Details
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Optional
        </span>
      </div>

      {/* Fee Display */}
      <div className="mb-3 p-3 bg-white rounded-lg border border-blue-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">
            Consultation Fee:
          </span>
          <span className="text-lg font-bold text-blue-600">
            ₹{actualFee.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Discount Section */}
      <div className="mb-3">
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Discount <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <TextInput
              type="number"
              placeholder="Enter discount"
              value={discountValue}
              onChange={(e) => onDiscountValueChange(e.target.value)}
              min="0"
            />
          </div>
          <Select
            data={[
              { value: "percentage", label: "%" },
              { value: "flat", label: "₹" },
            ]}
            value={discountType}
            onChange={(val) =>
              onDiscountTypeChange((val as "percentage" | "flat" | "") || "")
            }
            className="w-24"
            placeholder="Select"
          />
        </div>
      </div>

      {/* Payable Amount */}
      <div className="mb-3 p-3 bg-white rounded-lg border-2 border-green-300">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">
            Payable Amount:
          </span>
          <span className="text-xl font-bold text-green-600">
            ₹{payableAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Collect Payment Now Section */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="mb-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPaymentReceived}
              onChange={(e) => onPaymentReceivedChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Collect Payment Now
            </span>
            <span className="ml-2 text-xs text-gray-400">
              (Optional - can collect later)
            </span>
          </label>
        </div>

        {/* Show payment fields only if payment is received */}
        {isPaymentReceived && (
          <div className="bg-white rounded-lg p-3 border border-gray-200 space-y-3">
            {/* Amount Paid */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Amount Paid
              </label>
              <TextInput
                type="number"
                placeholder="Enter amount paid"
                value={amountPaid}
                onChange={(e) => onAmountPaidChange(e.target.value)}
                min="0"
                max={payableAmount.toString()}
              />
              {amountPaid && parseFloat(amountPaid) > payableAmount && (
                <p className="text-xs text-red-600 mt-1">
                  Amount paid cannot exceed payable amount
                </p>
              )}
              {amountPaid &&
                parseFloat(amountPaid) < payableAmount &&
                parseFloat(amountPaid) > 0 && (
                  <div className="flex items-center justify-between ">
                    <p className="text-xs  text-green-600 mt-1">
                      Advance: ₹{parseFloat(amountPaid).toFixed(2)} paid
                    </p>
                    <p className="text-xs flex items-center justify-center text-red-600 mt-1">
                      ₹{(payableAmount - parseFloat(amountPaid)).toFixed(2)}{" "}
                      remaining
                    </p>
                  </div>
                )}
              {amountPaid && parseFloat(amountPaid) === payableAmount && (
                <p className="text-xs text-green-600 mt-1">
                  Full payment received
                </p>
              )}
            </div>

            {/* Payment Mode */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Payment Mode
              </label>
              <Select
                data={[
                  { value: "cash", label: "Cash" },
                  { value: "online", label: "Online" },
                  { value: "card", label: "Card" },
                ]}
                value={paymentMode}
                onChange={(val) =>
                  onPaymentModeChange(
                    (val as "cash" | "online" | "card" | "") || ""
                  )
                }
                placeholder="Select payment mode"
              />
            </div>

            {/* Payment Note */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Payment Note{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <TextInput
                placeholder="Add a note..."
                value={paymentNote}
                onChange={(e) => onPaymentNoteChange(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
