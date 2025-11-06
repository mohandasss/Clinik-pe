import { useState } from "react";
import { TextInput, Select, Button } from "@mantine/core";

// ========================================
// OnboardingForm Component
// Reusable form for clinic/lab onboarding
// ========================================

export interface OnboardingFormData {
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  role: string;
}

interface OnboardingFormProps {
  onSubmit?: (data: OnboardingFormData) => void;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<OnboardingFormData>({
    fullName: "",
    phoneNumber: "",
    emailAddress: "",
    role: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md ring-1 ring-gray-100">
      {/* Form Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Let's Get Your Clinic or Lab Online
        </h2>
        <p className="text-sm text-gray-600">
          Create your profile, reach more patients, and manage bookings in
          minutes
        </p>
      </div>

      {/* Trust Indicator */}
      <div className="">
        <div className="mb-6 bg-gray-100 p-2 text-xs text-gray-500 text-center">
          Take less than 5 minutes • Data is 100% secure
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Full Name Input */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Full Name
          </label>
          <TextInput
            placeholder="Enter full name"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            size="md"
            styles={{
              input: {
                borderColor: "#e5e7eb",
                "&:focus": {
                  borderColor: "#2563eb",
                },
              },
            }}
          />
        </div>

        {/* Phone Number Input */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Phone Number
          </label>
          <div className="flex gap-2">
            <Select
              data={["+91", "+1", "+44", "+61"]}
              defaultValue="+91"
              size="md"
              className="w-24"
              styles={{
                input: {
                  borderColor: "#e5e7eb",
                },
              }}
            />
            <TextInput
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              size="md"
              className="flex-1"
              styles={{
                input: {
                  borderColor: "#e5e7eb",
                  "&:focus": {
                    borderColor: "#2563eb",
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Email Address Input */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Email Address
          </label>
          <TextInput
            placeholder="Enter email address"
            type="email"
            value={formData.emailAddress}
            onChange={(e) =>
              setFormData({ ...formData, emailAddress: e.target.value })
            }
            size="md"
            styles={{
              input: {
                borderColor: "#e5e7eb",
                "&:focus": {
                  borderColor: "#2563eb",
                },
              },
            }}
          />
        </div>

        {/* Role Select */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Role{" "}
            <span className="text-gray-500 font-normal">(Owner/Staff)</span>
          </label>
          <Select
            placeholder="Select role"
            data={["Owner", "Staff", "Manager", "Doctor"]}
            value={formData.role}
            onChange={(value) =>
              setFormData({ ...formData, role: value || "" })
            }
            size="md"
            styles={{
              input: {
                borderColor: "#e5e7eb",
                "&:focus": {
                  borderColor: "#2563eb",
                },
              },
            }}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="md"
          className="mt-2"
          styles={{
            root: {
              backgroundColor: "#2563eb",
              "&:hover": {
                backgroundColor: "#1d4ed8",
              },
            },
          }}
        >
          Get Started - Create Profile
        </Button>
      </form>
    </div>
  );
};

export default OnboardingForm;
