import React from "react";
import { Select, TextInput, Checkbox } from "@mantine/core";

type BankDetailsProps = {
  accountName: string;
  accountType: string | null;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  verified: boolean;
  onAccountNameChange: (value: string) => void;
  onAccountTypeChange: (value: string | null) => void;
  onAccountNumberChange: (value: string) => void;
  onIfscCodeChange: (value: string) => void;
  onBankNameChange: (value: string) => void;
  onBranchNameChange: (value: string) => void;
  onVerifiedChange: (value: boolean) => void;
};

const BankDetails: React.FC<BankDetailsProps> = ({
  accountName,
  accountType,
  accountNumber,
  ifscCode,
  bankName,
  branchName,
  verified,
  onAccountNameChange,
  onAccountTypeChange,
  onAccountNumberChange,
  onIfscCodeChange,
  onBankNameChange,
  onBranchNameChange,
  onVerifiedChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Bank Details</h2>

      <div className="space-y-6">
        {/* Account Name & Account Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name <span className="text-red-500">*</span>
            </label>
            <TextInput
              placeholder="Enter account name"
              value={accountName}
              onChange={(e) => onAccountNameChange(e.currentTarget.value)}
              classNames={{
                input:
                  "border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500",
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type <span className="text-red-500">*</span>
            </label>
            <Select
              placeholder="Select account type"
              data={["Savings", "Current", "Business", "Other"]}
              value={accountType}
              onChange={onAccountTypeChange}
              classNames={{
                input:
                  "border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500",
              }}
            />
          </div>
        </div>

        {/* Account Number & IFSC Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number <span className="text-red-500">*</span>
            </label>
            <TextInput
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => onAccountNumberChange(e.currentTarget.value)}
              classNames={{
                input:
                  "border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500",
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IFSC Code <span className="text-red-500">*</span>
            </label>
            <TextInput
              placeholder="Enter IFSC code"
              value={ifscCode}
              onChange={(e) => onIfscCodeChange(e.currentTarget.value)}
              classNames={{
                input:
                  "border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500",
              }}
            />
          </div>
        </div>

        {/* Bank Name & Branch Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <TextInput
              placeholder="Enter bank name"
              value={bankName}
              onChange={(e) => onBankNameChange(e.currentTarget.value)}
              classNames={{
                input:
                  "border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500",
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch Name <span className="text-red-500">*</span>
            </label>
            <TextInput
              placeholder="Enter branch name"
              value={branchName}
              onChange={(e) => onBranchNameChange(e.currentTarget.value)}
              classNames={{
                input:
                  "border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500",
              }}
            />
          </div>
        </div>

        {/* Verification Checkbox */}
        {/* <div className="flex items-center gap-2">
          <Checkbox
            checked={verified}
            onChange={(e) => onVerifiedChange(e.currentTarget.checked)}
            label="I provided all the account information correctly."
          />
        </div> */}
      </div>
    </div>
  );
};

export default BankDetails;
