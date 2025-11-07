import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apis from "../../APis/Api";
import type { VerifyOtpPayload, ResendOtpPayload } from "../../APis/Types";
import Notification from "../GlobalNotification/Notification";
import useAuthStore from "../../GlobalStore/store";
const OTP_LENGTH = 4;

const LoginOtpForm: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [notif, setNotif] = useState<{
    open: boolean;
    data: { success: boolean; message: string };
  }>({ open: false, data: { success: false, message: "" } });

  // identifier can be phone or email passed from LoginForm
  const state = (location.state || {}) as {
    identifier?: string;
    otp_id?: string;
    request_id?: string;
    device_type?: string;
    device_id?: string;
    frontend_type?: string;
  };
  const identifier = state.identifier || "";
  const isEmail = identifier.includes("@");
  const [localOtpId, setLocalOtpId] = useState<string | undefined>(
    state.otp_id
  );
  const localRequestId = state.request_id;
  const localDeviceType = state.device_type;
  const localDeviceId = state.device_id;
  const localFrontendType = state.frontend_type;

  const [timer, setTimer] = useState<number>(60);
  const [resendLoading, setResendLoading] = useState<boolean>(false);

  console.log("LoginOtpForm state:", state);

  useEffect(() => {
    // focus first input on mount
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (value: string, idx: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    if (value && idx < OTP_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    const key = e.key;
    if (key === "Backspace") {
      if (otp[idx]) {
        // clear current
        const next = [...otp];
        next[idx] = "";
        setOtp(next);
      } else if (idx > 0) {
        inputsRef.current[idx - 1]?.focus();
        const next = [...otp];
        next[idx - 1] = "";
        setOtp(next);
      }
    } else if (key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    } else if (key === "ArrowRight" && idx < OTP_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text").trim();
    if (!/^[0-9]+$/.test(paste)) return;
    const chars = paste.split("").slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < chars.length; i++) next[i] = chars[i];
    setOtp(next);
    const lastIdx = Math.min(chars.length, OTP_LENGTH) - 1;
    inputsRef.current[lastIdx]?.focus();
    e.preventDefault();
  };

  //Request OTP verification

  const handleVerify = async () => {
    const code = otp.join("");
    const payload: VerifyOtpPayload = {
      otp: code,
      otp_id: localOtpId ?? "",
      request_id: localRequestId ?? "",
      device_type: localDeviceType ?? "",
      device_id: localDeviceId ?? "",
      frontend_type: localFrontendType ?? "",
    };

    console.log("Verify payload:", payload);

    try {
      const response = await apis.OrganizationLoginOtpVerification(payload);
      console.log("OTP Verification response:", response);

      setNotif({
        open: true,
        data: {
          success: !!response?.success,
          message: response?.message,
        },
      });

      if (response?.data?.loggedUserDetails) {
        const { organization_id, center_id } = response.data.loggedUserDetails;

        // store whole logged-in details in global store
        const setOrganizationDetails =
          useAuthStore.getState().setOrganizationDetails;
        try {
          setOrganizationDetails(response.data.loggedUserDetails);
        } catch (e) {
          // ignore if store setter unavailable
          console.warn("Could not set organization details in store:", e);
        }

        setTimeout(() => {
          if (!organization_id && !center_id) {
            navigate("/organization-list");
          } else if (organization_id && !center_id) {
            navigate("/center");
          } else if (!organization_id && center_id) {
            navigate("/organization");
          } else if (organization_id && center_id) {
            navigate("/providers");
          }
        }, 1500);
      }
    } catch (err: unknown) {
      console.error("OTP verification error:", err);
      const message =
        err instanceof Error
          ? err.message
          : String(err ?? "Network or server error");
      setNotif({ open: true, data: { success: false, message } });
    }
  };

  //resend OTP

  const handleResend = async () => {
    if (timer > 0) return;
    if (!localRequestId) {
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
      const payload: ResendOtpPayload = {
        request_id: localRequestId || "",
        device_type: localDeviceType ?? "",
        device_id: localDeviceId ?? "",
        frontend_type: localFrontendType ?? "",
      };

      const response = await apis.OrganizationLoginResendOtpVerification(
        payload
      );
      console.log("Resend OTP response:", response);

      const success = response?.success ?? false;
      const message = response?.message;
      setNotif({ open: true, data: { success, message } });
      if (success) {
        setLocalOtpId(response.data?.otp_id);

        setTimer(60);
      }
    } catch (err: unknown) {
      console.error("Resend error:", err);
      const message =
        err instanceof Error
          ? err.message
          : String(err ?? "Network or server error");
      setNotif({ open: true, data: { success: false, message } });
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    setTimer(60);
    const id = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-center text-lg font-semibold text-gray-800">
        Verify Your Account
      </h2>
      <Notification
        open={notif.open}
        data={notif.data}
        onClose={() => setNotif((prev) => ({ ...prev, open: false }))}
      />

      <p className="mt-2 text-center text-sm text-gray-500">
        {identifier ? (
          isEmail ? (
            <>
              Enter the OTP you have received in your email{" "}
              <span className="font-medium text-gray-700">{identifier}</span>{" "}
            </>
          ) : (
            <>
              Enter the OTP you have received in your number{" "}
              <span className="font-medium text-gray-700">{identifier}</span>{" "}
            </>
          )
        ) : (
          <>Enter the OTP you have received</>
        )}
        <button
          type="button"
          className="text-sm text-blue-600 hover:underline ml-1"
          onClick={() => navigate("../login", { state: { identifier } })}
        >
          (Change)
        </button>
      </p>

      <div className="mt-6 flex justify-center space-x-3">
        {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputsRef.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[idx]}
            onChange={(e) =>
              handleChange(e.target.value.replace(/\s/g, ""), idx)
            }
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onPaste={handlePaste}
            className="w-14 h-12 text-center text-lg font-medium rounded-md border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`OTP digit ${idx + 1}`}
          />
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={handleVerify}
          className="w-full bg-blue-600 text-white py-2 rounded-md shadow-sm hover:bg-blue-700 transition-colors"
        >
          Verify Now
        </button>

        <button
          onClick={handleResend}
          className="w-full border border-blue-600 text-blue-600 py-2 rounded-md hover:bg-blue-50 transition-colors"
          disabled={timer > 0 || resendLoading}
        >
          {resendLoading
            ? "Resending..."
            : timer > 0
            ? `Resend OTP (${Math.floor(timer / 60)}:${String(
                timer % 60
              ).padStart(2, "0")})`
            : "Resend OTP"}
        </button>
      </div>
    </div>
  );
};

export default LoginOtpForm;
