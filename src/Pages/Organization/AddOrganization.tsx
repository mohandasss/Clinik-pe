import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Paper, TextInput, Button, Text, Anchor, Select } from "@mantine/core";
import Notification from "../../components/Global/Notification";
import { IconArrowLeft } from "@tabler/icons-react";
import apis from "../../APis/Api";

const AddOrganization: React.FC = () => {
  const navigate = useNavigate();

  const [notif, setNotif] = useState<{
    open: boolean;
    data: { success: boolean; message: string };
  }>({
    open: false,
    data: { success: true, message: "" },
  });

  const [form, setForm] = useState({
    organizationName: "",
    address: "",
    phone: "",
    countryCode: "+91",
    legalId: "",
    email: "",
    foundedDate: "",
  });

  const handleChange = (k: string, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    // validate fields
    const newErrors: Record<string, string> = {};
    if (!form.organizationName.trim())
      newErrors.organizationName = "Organization name is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    // phone validation: expect a 10-digit mobile number (we provide country code via dropdown)
    const phoneVal = (form.phone || "").trim();
    const digits = phoneVal.replace(/\D/g, "");
    if (!phoneVal) {
      newErrors.phone = "Phone is required";
    } else {
      // if user pasted full international (e.g. 91XXXXXXXXXX), accept and extract last 10 digits
      let phoneDigits = digits;
      if (digits.length === 12 && digits.startsWith("91"))
        phoneDigits = digits.slice(2);
      if (phoneDigits.length !== 10)
        newErrors.phone = "Enter a valid 10-digit mobile number";
    }

    if (!form.legalId.trim()) newErrors.legalId = "Legal id is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(form.email.trim()))
        newErrors.email = "Enter a valid email address";
    }

    if (!form.foundedDate.trim())
      newErrors.foundedDate = "Founded date is required";

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      setNotif({
        open: true,
        data: { success: false, message: "Please fix the errors in the form." },
      });
      return;
    }

    // combine country code and phone digits into payload phone
    const digitsAll = (form.phone || "").replace(/\D/g, "");
    const digitsOnly =
      digitsAll.length === 12 && digitsAll.startsWith("91")
        ? digitsAll.slice(2)
        : digitsAll.slice(-10);
    const countryRaw = form.countryCode || "+91";
    const countryNormalized = countryRaw.startsWith("+")
      ? countryRaw
      : `+${countryRaw}`;
    const payload = {
      organization_name: form.organizationName.trim(),
      address: form.address.trim(),
      phone: `${countryNormalized}${digitsOnly}`,
      legal_id: form.legalId.trim(),
      email: form.email.trim(),
      founded_date: form.foundedDate.trim(),
    };

    const response = await apis.AddOrganizationFromInside(payload);
    console.log("AddOrganization response:", response);

    if (response.success) {
      setNotif({
        open: true,
        data: {
          success: response.success,
          message: response.message,
        },
      });
      setTimeout(() => {
        // navigate back to list and request a refresh
        navigate("/organizations", { state: { refresh: true } });
      }, 1500);
    } else {
      setNotif({
        open: true,
        data: {
          success: response.success,
          message: response.message,
        },
      });
    }
  };

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  return (
    <div className="p-0">
      <Notification
        open={notif.open}
        data={notif.data}
        onClose={() => setNotif((s) => ({ ...s, open: false }))}
      />

      <div className="mb-4">
        <Anchor
          component="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1 hover:no-underline rounded-md text-blue-600 text-sm transition-colors duration-150 hover:bg-blue-50 no-underline"
        >
          <IconArrowLeft size={16} />
          <Text size="sm" fw={600} className="font-medium">
            Back to Organizations
          </Text>
        </Anchor>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Add New Organization</h2>
        <p className="text-sm text-gray-600">
          Enter organization information to create a new record.
        </p>
      </div>

      <Paper withBorder radius="md" className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="text-sm font-medium mb-3">Organization Details</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text size="xs" className="text-gray-600 mb-2">
                  Organization Name
                </Text>
                <TextInput
                  placeholder="e.g., Wellness Clinic Group"
                  value={form.organizationName}
                  onChange={(e) =>
                    handleChange("organizationName", e.currentTarget.value)
                  }
                  error={formErrors.organizationName}
                />
              </div>

              <div>
                <Text size="xs" className="text-gray-600 mb-2">
                  Legal ID
                </Text>
                <TextInput
                  placeholder="e.g., 12364"
                  value={form.legalId}
                  onChange={(e) =>
                    handleChange("legalId", e.currentTarget.value)
                  }
                  error={formErrors.legalId}
                />
              </div>

              <div>
                <Text size="xs" className="text-gray-600 mb-2">
                  Phone Number
                </Text>
                <div className="flex items-center gap-2">
                  <Select
                    data={["+91"]}
                    value={form.countryCode}
                    onChange={(v) => handleChange("countryCode", v ?? "+91")}
                    className="w-20 "
                  />
                  <TextInput
                    placeholder="xxxxxxxxxx"
                    value={form.phone}
                    onChange={(e) =>
                      handleChange("phone", e.currentTarget.value)
                    }
                    className="flex-1"
                    error={formErrors.phone}
                  />
                </div>
              </div>

              <div>
                <Text size="xs" className="text-gray-600 mb-2">
                  Email Address
                </Text>
                <TextInput
                  placeholder="contact@wellness.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.currentTarget.value)}
                  error={formErrors.email}
                />
              </div>

              <div>
                <Text size="xs" className="text-gray-600 mb-2">
                  Founded Date
                </Text>
                <TextInput
                  type="date"
                  value={form.foundedDate}
                  onChange={(e) =>
                    handleChange("foundedDate", e.currentTarget.value)
                  }
                  error={formErrors.foundedDate}
                />
              </div>

              <div className="">
                <Text size="xs" className="text-gray-600 mb-2">
                  Address
                </Text>
                <TextInput
                  placeholder="Enter full address here..."
                  value={form.address}
                  onChange={(e) =>
                    handleChange("address", e.currentTarget.value)
                  }
                  error={formErrors.address}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button type="submit" style={{ backgroundColor: "#0b5ed7" }}>
              Add Organization
            </Button>
          </div>
        </form>
      </Paper>
    </div>
  );
};

export default AddOrganization;
