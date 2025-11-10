import React from "react";
import { TextInput, Text } from "@mantine/core";

interface ProviderBasicInfoProps {
  fullName: string;
  licenseNumber: string;
  errors: {
    fullName: string;
  };
  onChange: (key: string, value: string) => void;
}

const ProviderBasicInfo: React.FC<ProviderBasicInfoProps> = ({
  fullName,
  licenseNumber,
  errors,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Full Name<span className="text-red-500">*</span>
        </label>
        <TextInput
          placeholder="Enter full name"
          value={fullName}
          onChange={(e) => onChange("fullName", e.currentTarget.value)}
          error={errors.fullName}
          classNames={{
            input:
              "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
          }}
        />
        {errors.fullName && (
          <Text size="xs" c="red" mt={4}>
            {errors.fullName}
          </Text>
        )}
      </div>

      {/* License Number */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          License Number
        </label>
        <TextInput
          placeholder="Enter license number"
          value={licenseNumber}
          onChange={(e) => onChange("licenseNumber", e.currentTarget.value)}
          classNames={{
            input:
              "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
          }}
        />
      </div>
    </div>
  );
};

export default ProviderBasicInfo;
