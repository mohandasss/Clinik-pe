import React, { useEffect, useState } from "react";
import PaymentMode from "./Components/PaymentMode";
import BankDetails from "./Components/BankDetails";
import Notification from "../../components/Global/Notification";
import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";
import type { PaymentSettingsPayload, PaymentSetting } from "../../APis/Types";

interface FormData {
  cashPayment: boolean;
  onlinePayment: boolean;
  accountName: string;
  accountType: string | null;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  verified: boolean;
}

interface NotificationState {
  open: boolean;
  data: {
    success: boolean;
    message: string;
  };
}

const INITIAL_FORM_DATA: FormData = {
  cashPayment: false,
  onlinePayment: false,
  accountName: "",
  accountType: null,
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  branchName: "",
  verified: false,
};

const PaymentSettings: React.FC = () => {
  const { organizationDetails } = useAuthStore();

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<NotificationState>({
    open: false,
    data: { success: true, message: "" },
  });

  const centerId = organizationDetails?.center_id;
  const organizationId = organizationDetails?.organization_id;
  const centralAccountId = organizationDetails?.central_account_id;

  // Helper: Update form field
  const updateField = <K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Helper: Show notification
  const showNotification = (success: boolean, message: string) => {
    setNotif({ open: true, data: { success, message } });
  };

  // Helper: Build API payload
  const buildPayload = (): PaymentSettingsPayload => {
    const settings: PaymentSetting[] = [
      { key: "payment.cash", value: formData.cashPayment },
      { key: "payment.online", value: formData.onlinePayment },
      { key: "payment.bank_account_name", value: formData.accountName },
      { key: "payment.bank_account_type", value: formData.accountType || "" },
      { key: "payment.bank_account_number", value: formData.accountNumber },
      { key: "payment.ifsc_code", value: formData.ifscCode },
      { key: "payment.bank_name", value: formData.bankName },
      { key: "payment.branch_name", value: formData.branchName },
    ];

    return {
      central_account_id: centralAccountId || "",
      settings,
    };
  };

  // Helper: Parse truthy values
  const isTruthy = (value: unknown): boolean => {
    return value === true || value === 1 || value === "1" || value === "true";
  };

  // Helper: Parse settings array response
  const parseSettingsResponse = (
    response: unknown
  ): Map<string, string | boolean> => {
    const map = new Map<string, string | boolean>();
    let settingsArray: Array<{ key: string; value: string | boolean }> = [];

    if (Array.isArray(response)) {
      settingsArray = response;
    } else if (response && typeof response === "object") {
      const obj = response as Record<string, unknown>;
      if (Array.isArray(obj.data)) {
        settingsArray = obj.data;
      } else if (Array.isArray(obj.settings)) {
        settingsArray = obj.settings;
      }
    }

    settingsArray.forEach((setting) => {
      map.set(setting.key, setting.value);
    });

    return map;
  };

  // Fetch payment settings
  const fetchPaymentSettings = async () => {
    if (!centerId || !organizationId) return;

    setLoading(true);
    try {
      const response = await apis.GetPaymentSettings(
        centerId,
        organizationId,
        "payment"
      );
      const settingsMap = parseSettingsResponse(response);

      setFormData({
        cashPayment: isTruthy(settingsMap.get("payment.cash")),
        onlinePayment: isTruthy(settingsMap.get("payment.online")),
        accountName:
          (settingsMap.get("payment.bank_account_name") as string) || "",
        accountType:
          (settingsMap.get("payment.bank_account_type") as string | null) ||
          null,
        accountNumber:
          (settingsMap.get("payment.bank_account_number") as string) || "",
        ifscCode: (settingsMap.get("payment.ifsc_code") as string) || "",
        bankName: (settingsMap.get("payment.bank_name") as string) || "",
        branchName: (settingsMap.get("payment.branch_name") as string) || "",
        verified: isTruthy(
          settingsMap.get("payment.provided_account_information")
        ),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load payment settings";
      showNotification(false, message);
      console.error("Error fetching payment settings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Save payment settings
  const handleSave = async () => {
    if (!formData.verified) {
      showNotification(
        false,
        "Please verify that you provided all account information correctly."
      );
      return;
    }

    if (!centerId || !organizationId) {
      showNotification(false, "Missing organization or center information.");
      return;
    }

    setLoading(true);
    try {
      const payload = buildPayload();
      const response = await apis.AddPaymentSettings(
        centerId,
        organizationId,
        payload
      );

      showNotification(response?.success || false, response?.message);
    } catch (error) {
      showNotification(false, message);
      console.error("Error saving payment settings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings on mount
  useEffect(() => {
    fetchPaymentSettings();
  }, [centerId, organizationId]);

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <Notification
        open={notif.open}
        data={notif.data}
        onClose={() => setNotif((prev) => ({ ...prev, open: false }))}
      />

      <div className="grid grid-cols-12 gap-6 max-w-screen-2xl mx-auto">
        {/* Payment Mode Sidebar */}
        <aside className="col-span-3">
          <PaymentMode
            cashPayment={formData.cashPayment}
            onlinePayment={formData.onlinePayment}
            onCashChange={(value) => updateField("cashPayment", value)}
            onOnlineChange={(value) => updateField("onlinePayment", value)}
          />
        </aside>

        {/* Bank Details Form */}
        <main className="col-span-9">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <BankDetails
              accountName={formData.accountName}
              accountType={formData.accountType}
              accountNumber={formData.accountNumber}
              ifscCode={formData.ifscCode}
              bankName={formData.bankName}
              branchName={formData.branchName}
              onAccountNameChange={(value) => updateField("accountName", value)}
              onAccountTypeChange={(value) => updateField("accountType", value)}
              onAccountNumberChange={(value) =>
                updateField("accountNumber", value)
              }
              onIfscCodeChange={(value) => updateField("ifscCode", value)}
              onBankNameChange={(value) => updateField("bankName", value)}
              onBranchNameChange={(value) => updateField("branchName", value)}
            />

            {/* Verification Checkbox */}
            <div className="flex items-center gap-2 mt-6 mb-4">
              <input
                type="checkbox"
                id="verify-info"
                checked={formData.verified}
                onChange={(e) => updateField("verified", e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="verify-info" className="text-sm text-gray-700">
                I provided all the account information correctly.
              </label>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={loading}
              className={`
                bg-blue-600 hover:bg-blue-700 
                text-white text-sm font-medium 
                px-6 py-2 rounded-md 
                transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {loading ? "Saving..." : "Save Now"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentSettings;
