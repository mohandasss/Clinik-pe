import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  TextInput,
  Button,
  Text,
  Anchor,
  Select,
  Checkbox,
} from "@mantine/core";
import { IconArrowLeft, IconClock } from "@tabler/icons-react";
import Notification from "../../components/Global/Notification";
import ImageUpload from "../../components/ImageUpload/ImageUpload";
import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";

interface WorkingHours {
  monday: { enabled: boolean; start: string; end: string };
  tuesday: { enabled: boolean; start: string; end: string };
  wednesday: { enabled: boolean; start: string; end: string };
  thursday: { enabled: boolean; start: string; end: string };
  friday: { enabled: boolean; start: string; end: string };
  saturday: { enabled: boolean; start: string; end: string };
  sunday: { enabled: boolean; start: string; end: string };
}

const AddCenter: React.FC = () => {
  const navigate = useNavigate();

  const organizationDetails = useAuthStore(
    (state) => state.organizationDetails
  );
  console.log("Organization Details from Store:", organizationDetails);
  const organizationId = organizationDetails?.organization_id
    ? String(organizationDetails.organization_id)
    : undefined;

  useEffect(() => {
    if (organizationDetails?.organization_name) {
      setForm((prev) => ({
        ...prev,
        organization: organizationDetails.organization_name,
      }));
    }
  }, [organizationDetails]);

  const [centerPhoto, setCenterPhoto] = useState<File | null>(null);
  const [uploadPath, setUploadPath] = useState<string>("");
  const [form, setForm] = useState({
    centerName: "",
    organization: "",
    phoneNumber: "",
    secondaryPhone: "",
    emailAddress: "",
    type: "Clinic",
    address: "",
  });

  const [errors, setErrors] = useState({
    centerName: "",
    phoneNumber: "",
    secondaryPhone: "",
    emailAddress: "",
    address: "",
  });

  const [notif, setNotif] = useState<{
    open: boolean;
    data: { success: boolean; message: string };
  }>({
    open: false,
    data: { success: true, message: "" },
  });

  //mock timgs
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { enabled: false, start: "09:00", end: "17:00" },
    tuesday: { enabled: false, start: "09:00", end: "17:00" },
    wednesday: { enabled: false, start: "09:00", end: "17:00" },
    thursday: { enabled: false, start: "09:00", end: "17:00" },
    friday: { enabled: false, start: "09:00", end: "17:00" },
    saturday: { enabled: false, start: "09:00", end: "17:00" },
    sunday: { enabled: false, start: "09:00", end: "17:00" },
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    if (errors[key as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      centerName: "",
      phoneNumber: "",
      secondaryPhone: "",
      emailAddress: "",
      address: "",
    };

    let isValid = true;

    // Center Name validation
    if (!form.centerName.trim()) {
      newErrors.centerName = "Center name is required";
      isValid = false;
    }

    // Phone Number validation (10 digits)
    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
      isValid = false;
    }

    // Secondary Phone validation (optional, but must be valid if provided)
    if (form.secondaryPhone.trim() && !/^\d{10}$/.test(form.secondaryPhone)) {
      newErrors.secondaryPhone = "Phone number must be 10 digits";
      isValid = false;
    }

    // Email validation
    if (!form.emailAddress.trim()) {
      newErrors.emailAddress = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress)) {
      newErrors.emailAddress = "Invalid email format";
      isValid = false;
    }

    // Address validation
    if (!form.address.trim()) {
      newErrors.address = "Address is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const buildPayload = () => {
    // Build working_hours array
    const workingHoursArray = (
      Object.keys(workingHours) as (keyof WorkingHours)[]
    )
      .filter((day) => workingHours[day].enabled)
      .map((day) => ({
        week_day: day,
        start_time: workingHours[day].start,
        end_time: workingHours[day].end,
      }));

    const payload = {
      name: form.centerName.trim(),
      address: form.address.trim(),
      email: form.emailAddress.trim(),
      primary_contact: `+91${form.phoneNumber.trim()}`,
      secondary_contact: form.secondaryPhone.trim()
        ? `+91${form.secondaryPhone.trim()}`
        : "",
      image_path: uploadPath,
      is_clinic: form.type === "Clinic" || form.type === "Both" ? 1 : 0,
      is_diagnostic: form.type === "Diagnostic" || form.type === "Both" ? 1 : 0,
      working_hours: workingHoursArray,
    };

    return payload;
  };

  const toggleDay = (day: keyof WorkingHours) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const updateTime = (
    day: keyof WorkingHours,
    timeType: "start" | "end",
    value: string
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [timeType]: value },
    }));
  };

  //creating payload and submitting
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Validation failed");
      return;
    }

    if (!organizationId) {
      setNotif({
        open: true,
        data: {
          success: false,
          message: "Organization ID not found. Please login again.",
        },
      });
      return;
    }

    const payload = buildPayload();
    const response = await apis.AddClinicFromInside(organizationId, payload);
    console.log("AddClinic response:", response);
    if (response && response.success) {
      setNotif({
        open: true,
        data: { success: true, message: response.message },
      });
      // navigate after 1.5s
      setTimeout(() => {
        setNotif((s) => ({ ...s, open: false }));
        navigate("/centers");
      }, 1500);
    } else {
      setNotif({
        open: true,
        data: { success: false, message: response?.message },
      });
    }

    // TODO: Submit payload to API
    // Example: await apiClient.post('/centers', payload);
  };

  const dayLabels = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  // --- Utility types
  type DayKey = keyof WorkingHours;

  const DayRow: React.FC<{
    day: DayKey;
    label: string;
    hours: WorkingHours[DayKey];
    onToggle: (d: DayKey) => void;
    onUpdate: (d: DayKey, t: "start" | "end", v: string) => void;
  }> = ({ day, label, hours, onToggle, onUpdate }) => {
    return (
      <div key={day} className="flex items-center gap-18 py-0">
        <div className="flex  gap-4">
          <div className="w-6 flex-shrink-0">
            <Checkbox
              checked={hours.enabled}
              onChange={() => onToggle(day)}
              aria-label={`Enable ${label}`}
            />
          </div>

          <div className="w-40 flex-shrink-0">
            <Text size="sm" className="font-medium text-gray-700">
              {label}
            </Text>
          </div>
        </div>

        <input
          type="time"
          value={hours.start}
          onChange={(e) => onUpdate(day, "start", e.currentTarget.value)}
          disabled={!hours.enabled}
          className="text-sm px-3 py-2 border border-gray-300 rounded-md flex-1 w-48 focus:outline-none focus:ring-0 focus:border-gray-300"
        />

        <span className="text-gray-300 flex-shrink-0">—</span>

        <input
          type="time"
          value={hours.end}
          onChange={(e) => onUpdate(day, "end", e.currentTarget.value)}
          disabled={!hours.enabled}
          className="text-sm px-3 py-2 border border-gray-300 rounded-md flex-1 w-48 focus:outline-none focus:ring-0 focus:border-gray-300"
        />
      </div>
    );
  };

  return (
    <div className="p-0">
      <Notification
        open={notif.open}
        data={notif.data}
        onClose={() => setNotif((s) => ({ ...s, open: false }))}
      />
      {/* Back Button */}
      <div className="mb-4">
        <Anchor
          component="button"
          onClick={() => navigate("/centers")}
          className="flex items-center gap-2 px-3 py-1 hover:no-underline rounded-md text-blue-600 text-sm transition-colors duration-150 hover:bg-blue-50 no-underline"
        >
          <IconArrowLeft size={16} />
          <Text size="sm" fw={600} className="font-medium">
            Back to Center
          </Text>
        </Anchor>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Add New Center</h2>
        <p className="text-sm text-gray-600">
          Enter center information to create a new record.
        </p>
      </div>

      {/* Form Card */}
      <Paper withBorder radius="md" className="p-6">
        <form onSubmit={handleSubmit}>
          {/* Image Upload Component */}
          <ImageUpload
            photo={centerPhoto}
            onPhotoChange={setCenterPhoto}
            onUploadPathChange={setUploadPath}
            title="Center Photo"
            description="Upload a professional headshot"
            subtitle="JPG, PNG up to 5MB"
          />

          {/* Divider */}
          <div className="h-px bg-gray-200 mb-6"></div>

          {/* Center Details Section */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Center Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Center Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Center Name <span className="text-red-500">*</span>
                </label>
                <TextInput
                  placeholder="e.g., Downtown Diagnostic Hub"
                  value={form.centerName}
                  onChange={(e) =>
                    handleChange("centerName", e.currentTarget.value)
                  }
                  error={errors.centerName}
                  classNames={{
                    input:
                      "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                  }}
                />
                {errors.centerName && (
                  <Text size="xs" c="red" mt={4}>
                    {errors.centerName}
                  </Text>
                )}
              </div>

              {/* Organization */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Organization
                </label>
                <TextInput
                  placeholder="Organization Name"
                  value={form.organization}
                  disabled
                  classNames={{
                    input:
                      "text-sm px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600",
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Phone Number with Country Code */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="w-16 flex-shrink-0">
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
                      value={form.phoneNumber}
                      onChange={(e) => {
                        const value = e.currentTarget.value.replace(/\D/g, "");
                        if (value.length <= 10) {
                          handleChange("phoneNumber", value);
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

              {/* Secondary Phone Number with Country Code */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Secondary Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="w-16 flex-shrink-0">
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
                      placeholder="9876543210 (Optional)"
                      value={form.secondaryPhone}
                      onChange={(e) => {
                        const value = e.currentTarget.value.replace(/\D/g, "");
                        if (value.length <= 10) {
                          handleChange("secondaryPhone", value);
                        }
                      }}
                      error={errors.secondaryPhone}
                      classNames={{
                        input:
                          "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                      }}
                    />
                  </div>
                </div>
                {errors.secondaryPhone && (
                  <Text size="xs" c="red" mt={4}>
                    {errors.secondaryPhone}
                  </Text>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <TextInput
                  placeholder="contact@wellness.com"
                  value={form.emailAddress}
                  onChange={(e) =>
                    handleChange("emailAddress", e.currentTarget.value)
                  }
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

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Type
                </label>
                <Select
                  placeholder="Select Type"
                  data={["Clinic", "Diagnostic", "Both"]}
                  value={form.type}
                  onChange={(val) => handleChange("type", val || "Clinic")}
                  classNames={{
                    input:
                      "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <TextInput
                  placeholder="123 Main Street, Suite 400"
                  value={form.address}
                  onChange={(e) =>
                    handleChange("address", e.currentTarget.value)
                  }
                  error={errors.address}
                  classNames={{
                    input:
                      "text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500",
                  }}
                />
                {errors.address && (
                  <Text size="xs" c="red" mt={4}>
                    {errors.address}
                  </Text>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 mb-6"></div>

          {/* Working Hours Section */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-6 flex items-center gap-2">
              <IconClock size={18} />
              Working Hours
            </h3>

            <div className="space-y-4">
              {(Object.keys(workingHours) as DayKey[]).map((day) => (
                <DayRow
                  key={day}
                  day={day}
                  label={dayLabels[day]}
                  hours={workingHours[day]}
                  onToggle={toggleDay}
                  onUpdate={updateTime}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 mb-6"></div>

          {/* Submit Button */}
          <div className="flex justify-start">
            <Button
              type="submit"
              variant="filled"
              color="blue"
              className="px-6 py-2 rounded-md"
            >
              Add Center
            </Button>
          </div>
        </form>
      </Paper>
    </div>
  );
};

export default AddCenter;
