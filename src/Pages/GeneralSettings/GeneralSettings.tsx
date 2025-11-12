import React, { useEffect, useRef, useState } from "react";
import { Button, Tabs, TextInput, Textarea, Select } from "@mantine/core";
import Notification from "../../components/Global/Notification";
import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";

const GeneralSettings: React.FC = () => {
  const { organizationDetails } = useAuthStore();

  const [centerLogo, setCenterLogo] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [bio, setBio] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [website, setWebsite] = useState("");
  const [legalBusinessName, setLegalBusinessName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notif, setNotif] = useState<{
    open: boolean;
    data: { success: boolean; message: string };
  }>({
    open: false,
    data: { success: true, message: "" },
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    const fetchSettings = async () => {
      const centerId = organizationDetails?.center_id;
      const orgId = organizationDetails?.organization_id;
      if (!centerId || !orgId) return;

      setLoading(true);
      try {
        const res = await apis.GetPaymentSettings(
          centerId,
          orgId,
          "information"
        );

        const maybe: unknown = res;
        let settingsArray: Array<{ key: string; value: string }> = [];

        if (maybe && typeof maybe === "object") {
          const obj = maybe as Record<string, unknown>;
          if (Array.isArray(obj.data))
            settingsArray = obj.data as Array<{ key: string; value: string }>;
        }

        const map = new Map<string, string>();
        settingsArray.forEach((s) => map.set(s.key, s.value));

        const logoUrl = map.get("information.center_logo") ?? "";
        setCenterLogo(logoUrl);
        setPreviewUrl(logoUrl); // Set preview to match the fetched logo

        setPracticeName(map.get("information.practice_name") ?? "");
        setBio(map.get("information.bio") ?? "");
        setTimeZone(map.get("information.time_zone") ?? "");
        setWebsite(map.get("information.webside") ?? "");
        setLegalBusinessName(map.get("information.legal_business_name") ?? "");
        setTaxId(map.get("information.tax_id") ?? "");
        setCity(map.get("information.city") ?? "");
        setState(map.get("information.state") ?? "");
        setZipCode(map.get("information.zip_code") ?? "");
        setCountry(map.get("information.country") ?? "");
        setEmail(map.get("information.email") ?? "");
        setPhone(map.get("information.phone") ?? "");
        setBillingAddress(map.get("information.billing_address") ?? "");
      } catch (err) {
        console.error("Failed to load settings:", err);
        setNotif({
          open: true,
          data: { success: false, message: "Failed to load settings" },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [organizationDetails]);

  const handleLogoUpload = async (file: File) => {
    // Create immediate local preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apis.ImageUpload(formData);

      if (response?.success && response?.data?.uploadPath) {
        const serverUrl = response.data.uploadPath;

        // Update both centerLogo and previewUrl with server URL
        setCenterLogo(serverUrl);
        setPreviewUrl(serverUrl);

        // Clean up local preview
        URL.revokeObjectURL(localPreview);

        setNotif({
          open: true,
          data: {
            success: true,
            message: response.message || "Logo uploaded successfully",
          },
        });
      } else {
        // If upload failed, revert to previous logo
        URL.revokeObjectURL(localPreview);
        setPreviewUrl(centerLogo);

        setNotif({
          open: true,
          data: {
            success: false,
            message: response?.message || "Upload failed",
          },
        });
      }
    } catch (err) {
      console.error("Error uploading logo:", err);

      // Revert to previous logo on error
      URL.revokeObjectURL(localPreview);
      setPreviewUrl(centerLogo);

      setNotif({
        open: true,
        data: { success: false, message: "Failed to upload logo" },
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setCenterLogo("");
    setPreviewUrl("");
  };

  const handleSave = async () => {
    const centerId = organizationDetails?.center_id;
    const orgId = organizationDetails?.organization_id;
    if (!centerId || !orgId) {
      setNotif({
        open: true,
        data: {
          success: false,
          message: "Missing organization or center information",
        },
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        central_account_id: organizationDetails?.central_account_id ?? "",
        settings: [
          { key: "information.center_logo", value: centerLogo },
          { key: "information.practice_name", value: practiceName },
          { key: "information.bio", value: bio },
          { key: "information.time_zone", value: timeZone },
          { key: "information.webside", value: website },
          { key: "information.legal_business_name", value: legalBusinessName },
          { key: "information.tax_id", value: taxId },
          { key: "information.city", value: city },
          { key: "information.state", value: state },
          { key: "information.zip_code", value: zipCode },
          { key: "information.country", value: country },
          { key: "information.email", value: email },
          { key: "information.phone", value: phone },
          { key: "information.billing_address", value: billingAddress },
        ],
      };

      const response = await apis.AddPaymentSettings(centerId, orgId, payload);

      setNotif({
        open: true,
        data: {
          success: response.success,
          message:
            response.message ||
            (response.success
              ? "Settings saved successfully"
              : "Failed to save settings"),
        },
      });
    } catch (err) {
      console.error("Error saving settings:", err);
      setNotif({
        open: true,
        data: { success: false, message: "Error saving settings" },
      });
    } finally {
      setLoading(false);
    }
  };

  // Display the preview URL if available, otherwise show placeholder
  const displayImage = previewUrl || centerLogo;

  return (
    <div className="p-2 min-h-screen">
      <Notification
        open={notif.open}
        data={notif.data}
        onClose={() => setNotif((s) => ({ ...s, open: false }))}
      />

      {/* Center Logo Card */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Center Logo
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          This logo will appear on your clinic booking site
        </p>

        <div className="mb-6">
          {displayImage ? (
            <img
              src={displayImage}
              alt="Center Logo"
              className="h-20 object-contain"
              onError={(e) => {
                // If image fails to load, show placeholder
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}

          {!displayImage && (
            <div className="w-24 h-20 bg-gray-100 flex items-center justify-center rounded border border-gray-200">
              <span className="text-gray-400 text-xs">No logo</span>
            </div>
          )}

          {displayImage && (
            <div className="hidden w-24 h-20 bg-gray-100 items-center justify-center rounded border border-gray-200">
              <span className="text-gray-400 text-xs">Failed to load</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            color="blue"
            loading={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {displayImage ? "Change Logo" : "Upload Logo"}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleLogoUpload(file);
                e.currentTarget.value = "";
              }
            }}
          />

          {displayImage && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRemoveLogo}
              disabled={uploading}
            >
              Remove Logo
            </Button>
          )}
        </div>
      </div>

      {/* Center Information Card */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Center Information
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          This information will be used to update your practice details.
        </p>

        <Tabs defaultValue="center-info">
          <Tabs.List className="mb-6 border-b border-gray-200 bg-gray-50 p-0">
            <Tabs.Tab
              value="center-info"
              className="px-0 py-3 mr-8 text-gray-700 font-medium text-sm"
            >
              Center Information
            </Tabs.Tab>
            <Tabs.Tab
              value="billing-info"
              className="px-0 py-3 text-gray-700 font-medium text-sm"
            >
              Billing Information
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="center-info" pt={0}>
            <div className="space-y-6">
              <TextInput
                label="Practice Name"
                placeholder="The Wellness Spot Chiropractic Clinic"
                value={practiceName}
                onChange={(e) => setPracticeName(e.currentTarget.value)}
                classNames={{
                  input: "border-gray-300 rounded-md",
                  label: "text-sm font-medium text-gray-700 mb-2",
                }}
              />
              <Textarea
                label="Bio"
                placeholder="Enter a short bio for your practice"
                value={bio}
                onChange={(e) => setBio(e.currentTarget.value)}
                rows={5}
                classNames={{
                  input: "border-gray-300 rounded-md",
                  label: "text-sm font-medium text-gray-700 mb-2",
                }}
              />
              <div className="grid grid-cols-2 gap-6">
                <Select
                  label="Time Zone"
                  placeholder="CDT - Chicago (GMT - 05:00)"
                  data={[
                    "CDT - Chicago (GMT - 05:00)",
                    "EST - New York (GMT - 05:00)",
                    "PST - Los Angeles (GMT - 08:00)",
                  ]}
                  value={timeZone}
                  onChange={(v) => setTimeZone(v ?? "")}
                  classNames={{
                    input: "border-gray-300 rounded-md",
                    label: "text-sm font-medium text-gray-700 mb-2",
                  }}
                />
                <TextInput
                  label="Website"
                  placeholder="Website url"
                  value={website}
                  onChange={(e) => setWebsite(e.currentTarget.value)}
                  classNames={{
                    input: "border-gray-300 rounded-md",
                    label: "text-sm font-medium text-gray-700 mb-2",
                  }}
                />
              </div>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="billing-info" pt={0}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <TextInput
                  label="Legal Business Name"
                  placeholder="Enter here"
                  value={legalBusinessName}
                  onChange={(e) => setLegalBusinessName(e.currentTarget.value)}
                  classNames={{
                    input: "border-gray-300 rounded-md",
                    label: "text-sm font-medium text-gray-700 mb-2",
                  }}
                />
                <TextInput
                  label="Tax ID / EIN"
                  placeholder="Enter here"
                  value={taxId}
                  onChange={(e) => setTaxId(e.currentTarget.value)}
                  classNames={{
                    input: "border-gray-300 rounded-md",
                    label: "text-sm font-medium text-gray-700 mb-2",
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <TextInput
                  label="City"
                  placeholder="Enter here"
                  value={city}
                  onChange={(e) => setCity(e.currentTarget.value)}
                  classNames={{
                    input: "border-gray-300 rounded-md",
                    label: "text-sm font-medium text-gray-700 mb-2",
                  }}
                />
                <TextInput
                  label="State"
                  placeholder="Enter here"
                  value={state}
                  onChange={(e) => setState(e.currentTarget.value)}
                  classNames={{
                    input: "border-gray-300 rounded-md",
                    label: "text-sm font-medium text-gray-700 mb-2",
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <TextInput
                  label="ZIP Code"
                  placeholder="Enter here"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.currentTarget.value)}
                  classNames={{
                    input: "border-gray-300 rounded-md",
                    label: "text-sm font-medium text-gray-700 mb-2",
                  }}
                />
                <Select
                  label="Country"
                  placeholder="Select Country"
                  data={["United States", "Canada", "Mexico"]}
                  value={country}
                  onChange={(v) => setCountry(v ?? "")}
                  classNames={{
                    input: "border-gray-300 rounded-md",
                    label: "text-sm font-medium text-gray-700 mb-2",
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <TextInput
                  label="Email"
                  type="email"
                  placeholder="Enter here"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  classNames={{
                    input: "border-gray-300 rounded-md",
                    label: "text-sm font-medium text-gray-700 mb-2",
                  }}
                />
                <TextInput
                  label="Phone"
                  placeholder="Enter here"
                  value={phone}
                  onChange={(e) => setPhone(e.currentTarget.value)}
                  classNames={{
                    input: "border-gray-300 rounded-md",
                    label: "text-sm font-medium text-gray-700 mb-2",
                  }}
                />
              </div>
              <Textarea
                label="Billing Address"
                placeholder="Enter billing address here..."
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.currentTarget.value)}
                rows={3}
                classNames={{
                  input: "border-gray-300 rounded-md",
                  label: "text-sm font-medium text-gray-700 mb-2",
                }}
              />
            </div>
          </Tabs.Panel>
        </Tabs>

        <div className="mt-8">
          <Button onClick={handleSave} loading={loading} color="blue" size="sm">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
