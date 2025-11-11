import React, { useEffect, useState } from "react";
import { Button, TextInput, ActionIcon } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { IconPencil } from "@tabler/icons-react";
import OtpPinInput from "./Components/OtpPinInput";
import Notification from "../Global/Notification";
import { useDeviceId } from "../../Customhooks/useDeviceId";
import { useDeviceType } from "../../Customhooks/useDeviceType";
import apis from "../../APis/Api";
import type {
  VerifyOtpPayload,
  OrganizationAddPayload,
  ResendOtpPayload,
} from "../../APis/Types";

const OnboardingOtpForm: React.FC = () => {
  const [otpValue, setOtpValue] = useState<string>("");
  const [notif, setNotif] = useState<{
    open: boolean;
    data: { success: boolean; message: string };
  }>({ open: false, data: { success: true, message: "" } });
  const navigate = useNavigate();
  const location = useLocation();
  const deviceId = useDeviceId();
  const deviceType = useDeviceType();
  const [timer, setTimer] = useState<number>(60);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const state = (location.state || {}) as {
    phoneNumber?: string;
    countryCode?: string;
    otp_id?: string;
    request_id?: string;
    resendPayload?: OrganizationAddPayload;
  };
  const [localOtpId, setLocalOtpId] = useState<string | undefined>(
    state.otp_id
  );
  const maskNumber = (num?: string) => {
    if (!num) return "xxxxxx1234";
    const cleaned = num.replace(/\D/g, "");
    if (cleaned.length <= 4) return cleaned;
    const visible = cleaned.slice(-4);
    const masked = "x".repeat(Math.max(0, cleaned.length - 4));
    return `${masked}${visible}`;
  };

  const phoneDisplay = state.phoneNumber
    ? `${state.countryCode ?? "+91"} -${maskNumber(state.phoneNumber)}`
    : "+91 - xxxxxx1234";

  const handleComplete = (val: string) => {
    setOtpValue(val);
    // Optionally auto-verify here or enable the Verify button
    console.log("OTP complete:", val);
  };

  const handleVerify = () => {
    // validate length: expect exactly 4 digits
    if (otpValue.length !== 4) {
      setNotif({
        open: true,
        data: {
          success: false,
          message: "Please enter the complete 4-digit OTP.",
        },
      });
      return;
    }

    // Build verify payload using state.request_id and otp id from local state
    const payload = {
      request_id: state.request_id || "",
      otp_id: localOtpId || state.otp_id || "",
      otp: otpValue,
      device_type: deviceType || "unknown",
      device_id: deviceId || "",
      frontend_type: "browser",
    };

    const verify = async () => {
      try {
        console.log("Verifying OTP payload:", payload);
        const resp = await apis.OrganizationOtpVerification(
          payload as VerifyOtpPayload
        );
        console.log("OTP verify response:", resp);
        const success = resp?.success ?? false;
        const message = resp?.message;
        setNotif({ open: true, data: { success, message } });

        if (success) {
          setTimeout(() => navigate("/organization-onboard"), 1500);
        }
      } catch (err) {
        console.error(err);
        
        setNotif({ open: true, data: { success: false, message } });
      }
    };

    verify();
  };

  // countdown timer effect
  useEffect(() => {
    setTimer(60);
    const id = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleResend = async () => {
    // only allow when timer === 0
    if (timer > 0) return;
    if (!state.request_id) {
      setNotif({
        open: true,
        data: {
          success: false,
          message: "No request id available to resend OTP",
        },
      });
      return;
    }
    setResendLoading(true);
    try {
      const resendPayload: ResendOtpPayload = {
        request_id: state.request_id || "",
        device_type: deviceType || "unknown",
        device_id: deviceId || "",
        frontend_type: "browser",
      };

      const resp = await apis.ResendOrganizationOtp(resendPayload);
      console.log("Resend response:", resp);
      const success = resp?.success ?? false;
      const message =
        resp?.message ?? (success ? "OTP resent" : "Resend failed");
      setNotif({ open: true, data: { success, message } });
      if (success) {
        // update otp id returned by resend
        setLocalOtpId(resp.data?.otp_id);
        // restart timer (the existing interval from mount will handle countdown)
        setTimer(60);
      }
    } catch (err) {
      console.error(err);
      let message = "Network error";
      if (err instanceof Error) message = err.message;
      setNotif({ open: true, data: { success: false, message } });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md ring-1 ring-gray-100">
      <Notification
        open={notif.open}
        data={notif.data}
        onClose={() => setNotif((s) => ({ ...s, open: false }))}
      />
      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        Verify Your Mobile Number
      </h3>
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2 text-center">
          We have sent a 4-digit code to {phoneDisplay}. Please enter it below
          to continue
        </p>
        <div className="max-w-sm mx-auto">
          <TextInput
            readOnly
            value={phoneDisplay}
            size="sm"
            className="w-full"
            variant="filled"
            styles={{
              input: {
                backgroundColor: "#f3f4f6", // tailwind gray-100
                borderColor: "#e5e7eb",
                paddingRight: 40,
              },
            }}
            rightSection={
              <ActionIcon
                variant="transparent"
                onClick={() =>
                  navigate("/", {
                    state: {
                      phoneNumber: state.phoneNumber,
                      countryCode: state.countryCode,
                    },
                  })
                }
                aria-label="Edit phone number"
              >
                <IconPencil size={16} />
              </ActionIcon>
            }
          />
        </div>
      </div>

      <div className="mb-72">
        <div className="flex gap-2 justify-center">
          <OtpPinInput
            length={4}
            value={otpValue}
            onChange={(v) => setOtpValue(v)}
            onComplete={handleComplete}
          />
        </div>
        <div className="text-center text-sm text-gray-500 mt-3">
          {timer > 0 ? (
            <>
              Resend OTP in {Math.floor(timer / 60)}:
              {String(timer % 60).padStart(2, "0")}.{" "}
              <button className="text-gray-400" disabled>
                Resend
              </button>
            </>
          ) : (
            <>
              <button
                className="text-blue-600"
                onClick={handleResend}
                disabled={resendLoading}
              >
                {resendLoading ? "Resending..." : "Resend"}
              </button>
            </>
          )}
        </div>
      </div>

      <Button
        fullWidth
        onClick={handleVerify}
        disabled={otpValue.length !== 4}
        styles={{ root: { backgroundColor: "#2563eb", borderRadius: 6 } }}
      >
        Verify & Continue
      </Button>
    </div>
  );
};

export default OnboardingOtpForm;
