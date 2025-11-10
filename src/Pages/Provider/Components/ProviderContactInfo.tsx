import React from "react";
import { TextInput, Select, Text } from "@mantine/core";

interface ProviderContactInfoProps {
  medicalCenter: string;
  emailAddress: string;
  phoneNumber: string;
  status: string;
  errors: {
    medicalCenter: string;
    emailAddress: string;
    phoneNumber: string;
  };
  onChange: (key: string, value: string) => void;
}

const ProviderContactInfo: React.FC<ProviderContactInfoProps> = ({
  medicalCenter,
  emailAddress,
  phoneNumber,
  status,
  errors,
  onChange,
}) => {
  return (
    <>
      {/* Row 2: Medical Center | Email Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Medical Center */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Medical Center<span className="text-red-500">*</span>
          </label>
          <Select
            placeholder="Select center"
            data={["Center 1", "Center 2", "Center 3"]}
            value={medicalCenter}
            onChange={(val) => onChange("medicalCenter", val || "")}
            error={errors.medicalCenter}
            classNames={{
              input:
                "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
            }}
            searchable
          />
          {errors.medicalCenter && (
            <Text size="xs" c="red" mt={4}>
              {errors.medicalCenter}
            </Text>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Email Address
          </label>
          <TextInput
            placeholder="doctor@example.com"
            value={emailAddress}
            onChange={(e) => onChange("emailAddress", e.currentTarget.value)}
            error={errors.emailAddress}
            classNames={{
              input:
                "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
            }}
          />
          {errors.emailAddress && (
            <Text size="xs" c="red" mt={4}>
              {errors.emailAddress}
            </Text>
          )}
        </div>
      </div>

      {/* Row 3: Phone Number | Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Phone Number
          </label>
          <div className="flex items-center gap-2">
            <div className="w-20 flex-shrink-0">
              <TextInput
                value="+91"
                disabled
                classNames={{
                  input:
                    "text-sm px-2 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 text-center",
                }}
              />
            </div>
            <div className="flex-1">
              <TextInput
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.currentTarget.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    onChange("phoneNumber", value);
                  }
                }}
                error={errors.phoneNumber}
                classNames={{
                  input:
                    "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                }}
              />
            </div>
          </div>
          {errors.phoneNumber && (
            <Text size="xs" c="red" mt={4}>
              {errors.phoneNumber}
            </Text>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Status
          </label>
          <div className="flex items-center gap-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="Active"
                checked={status === "Active"}
                onChange={(e) => onChange("status", e.currentTarget.value)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="Inactive"
                checked={status === "Inactive"}
                onChange={(e) => onChange("status", e.currentTarget.value)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Inactive</span>
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProviderContactInfo;
