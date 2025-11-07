import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Paper, TextInput, Button, Text } from "@mantine/core";
import { useDeviceId } from "../../Customhooks/useDeviceId";
import { useDeviceType } from "../../Customhooks/useDeviceType";
import apis from "../../APis/Api";
import Notification from "../GlobalNotification/Notification";

interface LoginFormProps {
  onLogin?: (identifier: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [isMobileInput, setIsMobileInput] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const deviceId = useDeviceId();
  const deviceType = useDeviceType();
  const numberInputRef = useRef<HTMLInputElement | null>(null);
  const [notif, setNotif] = useState<{
    open: boolean;
    data: { success: boolean; message: string };
  }>({ open: false, data: { success: true, message: "" } });

  useEffect(() => {
    const state = (location.state || {}) as { identifier?: string };
    if (state.identifier) setIdentifier(state.identifier);
  }, [location.state]);

  //mock country list
  const COUNTRIES = [{ code: "IN", name: "India", dial_code: "+91" }];

  useEffect(() => {
    const val = identifier.trim();
    if (!val) {
      setIsMobileInput(false);
      return;
    }
    const first = val[0];
    const shouldBeMobile = first === "+" || /\d/.test(first);

    // Only update if changing state, and restore focus after render
    if (shouldBeMobile !== isMobileInput) {
      setIsMobileInput(shouldBeMobile);
      // Restore focus after the input field switches
      if (shouldBeMobile) {
        setTimeout(() => numberInputRef.current?.focus(), 0);
      }
    }
  }, [identifier, isMobileInput]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!identifier.trim()) return;

    let emailMobile = identifier.trim();
    if (isMobileInput) {
      const digits = emailMobile.replace(/\D/g, "");
      const code = (countryCode || "+91").replace(/\D/g, "");
      emailMobile = `+${code}${digits}`;
    }

    const payload = {
      emailMobile,
      device_type: deviceType,
      device_id: deviceId || "",
      frontend_type: "browser",
    };

    console.log("Login payload:", payload);

    const response = await apis.OrganizationLogin(payload);
    console.log("Login response:", response.data.otpDetails);

    setNotif({
      open: true,
      data: { success: !!response.success, message: response.message },
    });

    const trimmed = identifier.trim();
    if (onLogin) onLogin(trimmed);

    // extract otp details and navigate to the OTP page with required state
    const otp_id = response?.data?.otpDetails.otp_id;
    const request_id = response?.data?.otpDetails.request_id;

    // Navigate to login-otp so the OTP form has identifier + otp/request ids
    if (response?.success) {
      setTimeout(() => {
        navigate("../login-otp", {
          state: {
            identifier: trimmed,
            otp_id,
            request_id,
            device_type: deviceType,
            device_id: deviceId || "",
            frontend_type: "browser",
          },
        });
      }, 1500);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <Paper
        withBorder
        radius="md"
        className="p-6 w-full max-w-md bg-white shadow-xl"
        style={{ boxShadow: "0 2px 10px rgba(16,24,40,0.04)" }}
      >
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Login</h3>
          <Text color="dimmed" size="sm">
            Start your journey with ClinikPe
          </Text>
        </div>

        <Notification
          open={notif.open}
          data={notif.data}
          onClose={() => setNotif((s) => ({ ...s, open: false }))}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          {isMobileInput ? (
            <div className="flex gap-2 items-center">
              <select
                aria-label="Country code"
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e.currentTarget.value);
                  setTimeout(() => numberInputRef.current?.focus(), 0);
                }}
                className="px-3 py-2 focus:outline-none focus:ring-0 rounded-md border border-gray-200 w-36 text-sm bg-white"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.dial_code}>
                    {c.dial_code}
                  </option>
                ))}
              </select>
              <input
                placeholder="Mobile number"
                value={identifier}
                onChange={(e) => setIdentifier(e.currentTarget.value)}
                ref={numberInputRef}
                autoFocus
                className="px-3 py-2 rounded-md border border-gray-200 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <TextInput
              placeholder="Mobile or Email id"
              value={identifier}
              onChange={(e) => setIdentifier(e.currentTarget.value)}
              size="md"
            />
          )}

          <Button
            type="submit"
            fullWidth
            styles={{ root: { backgroundColor: "#0b5ed7" } }}
          >
            Login Now
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default LoginForm;
