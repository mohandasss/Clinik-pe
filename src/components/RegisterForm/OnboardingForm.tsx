import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDeviceId } from "../../Customhooks/useDeviceId";
import { TextInput, Select, Button } from "@mantine/core";
import Notification from "../GlobalNotification/Notification";
import apis from "../../APis/Api";
import { useNavigate } from "react-router-dom";
import { useDeviceType } from "../../Customhooks/useDeviceType";

export interface OnboardingFormData {
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  role: string;
  countryCode?: string;
}

interface OnboardingFormProps {
  onSubmit?: (data: OnboardingFormData) => void;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onSubmit }) => {
  const location = useLocation();
  const [formData, setFormData] = useState<OnboardingFormData>({
    fullName: "",
    phoneNumber: "",
    emailAddress: "",
    role: "",
    countryCode: "+91",
  });
  const navigate = useNavigate();
  const deviceId = useDeviceId();
  const deviceType = useDeviceType();
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<{
    open: boolean;
    data: { success: boolean; message: string };
  }>({ open: false, data: { success: true, message: "" } });

  useEffect(() => {
    const state = (location.state || {}) as {
      phoneNumber?: string;
      countryCode?: string;
    };
    if (state.phoneNumber) {
      setFormData((prev) => ({
        ...prev,
        phoneNumber: state.phoneNumber || prev.phoneNumber,
        countryCode: state.countryCode || prev.countryCode,
      }));
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (
      !formData.fullName.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.emailAddress.trim() ||
      !formData.role
    ) {
      setNotif({
        open: true,
        data: {
          success: false,
          message: "Please fill in all required fields.",
        },
      });
      return;
    }
    if (onSubmit) {
      onSubmit(formData);
    }
    // Prepare trimmed payload and log it (for debugging / integration)
    const payload = {
      name: formData.fullName.trim(),
      mobile: formData.countryCode + formData.phoneNumber.trim(),
      email: formData.emailAddress.trim(),
      role: formData.role.trim().toLowerCase(),
      frontend_type: "browser",
      device_type: deviceType,
      device_id: deviceId || "",
    };

    console.log("Creating profile payload:", payload);
    setLoading(true);
    try {
      const response = await apis.RegisterOrganization(payload);
      console.log("Organization Registration Response:", response);
      // Use API response to show notification
      const success = response?.success ?? false;
      const message = response?.message;

      setNotif({ open: true, data: { success, message } });
      if (success) {
        setTimeout(() => {
          navigate("otp", {
            state: {
              phoneNumber: payload.mobile,
              countryCode: formData.countryCode,
              otp_id: response.data.otp_id,
              request_id: response.data.request_id,
              resendPayload: payload,
            },
          });
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      let message = "Network error occurred";
      if (err instanceof Error) message = err.message;
      else if (typeof err === "string") message = err;
      setNotif({ open: true, data: { success: false, message } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md ring-1 ring-gray-100">
      <Notification
        open={notif.open}
        data={notif.data}
        onClose={() => setNotif((s) => ({ ...s, open: false }))}
      />
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
              value={formData.countryCode}
              onChange={(val) =>
                setFormData({ ...formData, countryCode: val || "+91" })
              }
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
            data={["Staff", "Owner"]}
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
          disabled={loading}
          styles={{
            root: {
              backgroundColor: "#2563eb",
              "&:hover": {
                backgroundColor: "#1d4ed8",
              },
            },
          }}
        >
          {loading ? "Creating..." : "Get Started - Create Profile"}
        </Button>
      </form>
    </div>
  );
};

export default OnboardingForm;
