import React, { useState } from "react";
import {
  TextInput,
  Checkbox,
  Button,
  Group,
  Paper,
  ActionIcon,
  Modal,
} from "@mantine/core";
import Notification from "../Global/Notification";
import { useNavigate } from "react-router-dom";
import { IconMapPin } from "@tabler/icons-react";
import SelectableMap from "../../MapSelector/SelectableMap";
import apis from "../../APis/Api";

type Address = {
  address: string;
  city?: string;
  postal_code?: string;
  lat?: string;
  lng?: string;
};

const OrganizationForm: React.FC = () => {
  const [organizationName, setOrganizationName] = useState("");
  const [centerName, setCenterName] = useState("");
  const [branchType, setBranchType] = useState<{
    diagnosis: boolean;
    clinic: boolean;
  }>({ diagnosis: false, clinic: false });
  // Always present a single address by default
  const [addresses, setAddresses] = useState<Address[]>([
    { address: "", city: "", postal_code: "", lat: "", lng: "" },
  ]);
  const [primaryContact, setPrimaryContact] = useState("");
  const [secondaryContact, setSecondaryContact] = useState("");
  const [branchEmail, setBranchEmail] = useState("");
  const navigate = useNavigate();

  const updateAddress = (idx: number, field: keyof Address, val: string) =>
    setAddresses((s) =>
      s.map((a, i) => (i === idx ? { ...a, [field]: val } : a))
    );

  // modal state for map selector
  const [mapOpen, setMapOpen] = useState(false);

  type Errors = {
    organizationName?: string;
    address?: string;
    primaryContact?: string;
    secondaryContact?: string;
    branchEmail?: string;
  };

  const [errors, setErrors] = useState<Errors>({});

  const handleMapLocationSelect = (lat: number, lng: number) => {
    updateAddress(0, "lat", String(lat));
    updateAddress(0, "lng", String(lng));
    setNotif({
      open: true,
      data: { success: true, message: "Location selected from map." },
    });
    setMapOpen(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    // Basic validation
    const newErrors: Errors = {};
    if (!organizationName.trim())
      newErrors.organizationName = "Organization name is required";
    if (!addresses[0]?.address?.trim())
      newErrors.address = "Primary address is required";
    // validate primary contact (expect 10 digits)
    const primaryDigits = (primaryContact || "").replace(/\D/g, "");
    if (!primaryContact.trim()) {
      newErrors.primaryContact = "Primary contact is required";
    } else if (primaryDigits.length !== 10) {
      newErrors.primaryContact = "Enter a valid 10-digit mobile number";
    }
    // secondary contact optional but if provided validate
    if (secondaryContact.trim()) {
      const sec = secondaryContact.replace(/\D/g, "");
      if (sec.length !== 10)
        newErrors.secondaryContact = "Enter a valid 10-digit mobile number";
    }
    // email validation if provided
    if (branchEmail.trim()) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(branchEmail.trim()))
        newErrors.branchEmail = "Enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setNotif({
        open: true,
        data: { success: false, message: "Please fix the highlighted errors." },
      });
      return;
    }
    // Build API payload in required snake_case shape
    const addr = addresses[0] || {
      line_1: "",
      line_2: "",
      country: "",
      state_or_province: "",
      district: "",
      city: "",
      village: "",
      town: "",
      land_mark: "",
      instruction: "",
      address: "",
      postal_code: "",
      lat: "",
      lng: "",
    };
    const payload = {
      organization_name: organizationName.trim(),
      center_name: centerName.trim(),
      is_clinic: branchType.clinic ? 1 : 0,
      is_diagnostic: branchType.diagnosis ? 1 : 0,
      primary_contact: primaryContact.trim(),
      secondary_contact: secondaryContact.trim() || undefined,
      address: {
        address: addr.address.trim(),
        lat: (addr.lat || "").toString(),
        lng: (addr.lng || "").toString(),
        postalCode: (addr.postal_code || "").toString(),
        line_1: "",
        line_2: "",
        country: "",
        state_or_province: "",
        district: "",
        city: "",
        village: "",
        town: "",
        land_mark: "",
        instruction: "",
      },
      branch_email: (branchEmail || "").trim(),
    };

    const response = await apis.AddOrganization(payload);
    console.log("Organization API payload:", response);

    // optionally show a notification and navigate
    if (response.success) {
      setNotif({
        open: true,
        data: {
          success: response.success,
          message: response.message,
        },
      });
      setTimeout(() => {
        navigate("/success");
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

  const [notif, setNotif] = useState<{
    open: boolean;
    data: { success: boolean; message: string };
  }>({ open: false, data: { success: true, message: "" } });

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md ring-1 ring-gray-100"
    >
      <Notification
        open={notif.open}
        data={notif.data}
        onClose={() => setNotif((s) => ({ ...s, open: false }))}
      />
      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        Add Your Clinic Or Diagnostic Center
      </h3>
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2 text-center">
          Patients will see this information when booking. You can add more
          branches later.
        </p>
      </div>
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-sm font-medium">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <TextInput
              placeholder="Enter organization name"
              value={organizationName}
              onChange={(e) => {
                setOrganizationName(e.currentTarget.value);
                setErrors((s) => ({ ...s, organizationName: undefined }));
              }}
              error={errors.organizationName}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">Center Name</label>
            <TextInput
              placeholder="Enter Center name"
              value={centerName}
              onChange={(e) => setCenterName(e.currentTarget.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Branch Type</label>
          <Group className="my-2">
            <Checkbox
              label="Diagnosis Center"
              checked={branchType.diagnosis}
              onChange={(e) => {
                const checked = e.currentTarget.checked;
                setBranchType((s) => ({ ...s, diagnosis: checked }));
              }}
            />
            <Checkbox
              label="Clinic"
              checked={branchType.clinic}
              onChange={(e) => {
                const checked = e.currentTarget.checked;
                setBranchType((s) => ({ ...s, clinic: checked }));
              }}
            />
          </Group>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Address <span className="text-red-500">*</span>
            </label>
          </div>

          <div className="space-y-3 mt-3">
            {addresses.map((addr, i) => (
              <Paper
                key={i}
                withBorder
                radius="md"
                className="p-3 border-gray-200"
              >
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <TextInput
                      className="flex-1"
                      placeholder={
                        i === 0
                          ? "Enter primary address"
                          : "Enter additional address"
                      }
                      value={addr.address}
                      onChange={(e) => {
                        updateAddress(i, "address", e.currentTarget.value);
                        setErrors((s) => ({ ...s, address: undefined }));
                      }}
                      error={i === 0 ? errors.address : undefined}
                    />
                  </div>

                  <div>
                    {/* <TextInput
                      placeholder="City"
                      value={addr.city}
                      onChange={(e) =>
                        updateAddress(i, "city", e.currentTarget.value)
                      }
                    /> */}
                    <TextInput
                      placeholder="Postal Code"
                      value={addr.postal_code}
                      onChange={(e) =>
                        updateAddress(i, "postal_code", e.currentTarget.value)
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex gap-2">
                      <TextInput
                        placeholder="Latitude"
                        value={addr.lat}
                        onChange={(e) =>
                          updateAddress(i, "lat", e.currentTarget.value)
                        }
                      />
                      <TextInput
                        placeholder="Longitude"
                        value={addr.lng}
                        onChange={(e) =>
                          updateAddress(i, "lng", e.currentTarget.value)
                        }
                      />
                    </div>
                    <div className="flex-shrink-0">
                      <ActionIcon
                        size={36}
                        variant="light"
                        color="blue"
                        onClick={() => setMapOpen(true)}
                        aria-label="Open map selector"
                        title="Open map selector"
                      >
                        <IconMapPin />
                      </ActionIcon>
                    </div>
                  </div>
                </div>
              </Paper>
            ))}
          </div>
        </div>

        <Modal
          opened={mapOpen}
          onClose={() => setMapOpen(false)}
          title="Select location"
          size="xl"
          centered
        >
          <SelectableMap
            height="600px"
            initialLat={
              addresses[0]?.lat ? parseFloat(addresses[0].lat) : 22.548256
            }
            initialLng={
              addresses[0]?.lng ? parseFloat(addresses[0].lng) : 88.345177
            }
            onLocationSelect={handleMapLocationSelect}
          />
        </Modal>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-sm font-medium">
              Primary Contact Number <span className="text-red-500">*</span>
            </label>
            <TextInput
              placeholder="Enter primary contact number"
              value={primaryContact}
              onChange={(e) => {
                setPrimaryContact(e.currentTarget.value);
                setErrors((s) => ({ ...s, primaryContact: undefined }));
              }}
              error={errors.primaryContact}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">Secondary Number</label>
            <TextInput
              placeholder="Enter secondary number"
              value={secondaryContact}
              onChange={(e) => {
                setSecondaryContact(e.currentTarget.value);
                setErrors((s) => ({ ...s, secondaryContact: undefined }));
              }}
              error={errors.secondaryContact}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Branch Email</label>
          <TextInput
            placeholder="Enter branch email address"
            value={branchEmail}
            onChange={(e) => {
              setBranchEmail(e.currentTarget.value);
              setErrors((s) => ({ ...s, branchEmail: undefined }));
            }}
            error={errors.branchEmail}
          />
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            type="submit"
            fullWidth
            style={{ backgroundColor: "#2563eb" }}
          >
            Continue - Complete Setup in Dashboard
          </Button>
        </div>
      </div>
    </form>
  );
};

export default OrganizationForm;
