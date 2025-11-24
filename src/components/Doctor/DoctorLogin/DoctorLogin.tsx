import { useState } from "react";
import { TextInput, Button, Text, PasswordInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Link, useNavigate } from "react-router-dom";
import apis from "../../../APis/Api";
import { useDeviceId } from "../../../Customhooks/useDeviceId";
import { useDeviceType } from "../../../Customhooks/useDeviceType";
import { useDoctorAuthStore } from "../../../GlobalStore/doctorStore";
// import { useNavigate } from "react-router-dom";
export default function DoctorLogin() {
  const navigate = useNavigate();
  const deviceId = useDeviceId();
  const deviceType = useDeviceType();
  //  const navigate =useNavigate();

  const [mobileOrEmail, setMobileOrEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const setDoctor = useDoctorAuthStore((s) => s.setDoctor);

  const handleSendOtp = async () => {
    // At least one identifier required
    if (!mobileOrEmail.trim() && !userId.trim()) {
      notifications.show({
        title: "Required Field",
        message: "Please enter Mobile/Email or User ID.",
        color: "red",
      });
      return;
    }

    // If user is trying to login with User ID, require password
    if (userId.trim() && !password.trim()) {
      notifications.show({
        title: "Required Field",
        message: "Please enter your password.",
        color: "red",
      });
      return;
    }

    // If using Mobile/Email (no User ID) and no password -> send OTP
    if (!userId.trim() && !password.trim()) {
      setLoading(true);
      try {
        const payload: any = {
          device_type: deviceType || "web",
          device_id: deviceId || "web-unknown",
          frontend_type: "browser",
        };

        const isMobile = /^[6-9]\d{9}$/.test(mobileOrEmail);
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mobileOrEmail);

        if (isMobile) payload.mobile = mobileOrEmail;
        else if (isEmail) payload.email = mobileOrEmail;
        else payload.user_id = mobileOrEmail;

        const response = await apis.DoctorLogin(payload);

        if (response && response.success) {
          notifications.show({
            title: "OTP Sent",
            message:
              response.message || "OTP has been sent to your mobile/email.",
            color: "green",
          });
          // persist pending identifier so OTP verify screen (if added later) can use it
          try {
            localStorage.setItem(
              "doctor-pending-login",
              JSON.stringify({ identifier: mobileOrEmail })
            );
          } catch (e) {
            console.warn("Could not persist pending login", e);
          }
        } else {
          notifications.show({
            title: "Error",
            message: response?.message || "Failed to send OTP",
            color: "red",
          });
        }
      } catch (error) {
        console.error("Send OTP error:", error);
        notifications.show({
          title: "Error",
          message: "Failed to send OTP. Try again.",
          color: "red",
        });
      } finally {
        setLoading(false);
      }

      return;
    }

    // Otherwise we have password (either with userId or with mobile/email) -> attempt login flow
    setLoading(true);
    try {
      const payload: any = {
        device_type: deviceType || "web",
        device_id: deviceId || "web-unknown",
        frontend_type: "browser",
        password,
      };

      // Priority: Use User ID if provided, otherwise use mobile/email
      if (userId.trim()) {
        payload.user_id = userId;
      } else {
        const isMobile = /^[6-9]\d{9}$/.test(mobileOrEmail);
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mobileOrEmail);

        if (isMobile) {
          payload.mobile = mobileOrEmail;
        } else if (isEmail) {
          payload.email = mobileOrEmail;
        } else {
          // Treat as user_id if doesn't match mobile or email pattern
          payload.user_id = mobileOrEmail;
        }
      }

      const response = await apis.DoctorLogin(payload);

      if (response.success && response.data) {
        const doctorData = response.data;

        // Store doctor data in Zustand
        setDoctor({
          doctor_id: doctorData.user_id, // Using user_id as doctor_id since API doesn't return doctor_id separately
          organization_id: doctorData.organization_id,
          organization_name: doctorData.organization_name,
          user_id: doctorData.user_id,
          center_name: doctorData.center_name,
          center_id: doctorData.center_id,
          central_account_id: doctorData.central_account_id,
          user_type: doctorData.user_type,
          name: doctorData.name,
          email: doctorData.email,
          mobile: doctorData.mobile,
          time_zone: doctorData.time_zone,
          currency: doctorData.currency,
          country: doctorData.country,
          access: doctorData.access ? JSON.stringify(doctorData.access) : null,
          image: doctorData.image,
        });

        notifications.show({
          title: "Login Successful",
          message: `Welcome back, Dr. ${doctorData.name}!`,
          color: "green",
        });

        // Navigate to doctor dashboard
        navigate("/doctor-dashboard");
      } else {
        notifications.show({
          title: "Error",
          message: response.message || "Failed to login",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      notifications.show({
        title: "Error",
        message: "An error occurred. Please try again.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <i>
          <svg
            width="40"
            height="43"
            viewBox="0 0 40 43"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.2558 13.3095V1.53571C10.2558 1.12842 10.4178 0.737803 10.7063 0.4498C10.9948 0.161798 11.3861 0 11.7941 0C12.2021 0 12.5934 0.161798 12.8819 0.4498C13.1704 0.737803 13.3325 1.12842 13.3325 1.53571V13.3095C13.3325 13.5811 13.4405 13.8415 13.6329 14.0335C13.8252 14.2255 14.0861 14.3333 14.3581 14.3333C14.6301 14.3333 14.8909 14.2255 15.0833 14.0335C15.2756 13.8415 15.3836 13.5811 15.3836 13.3095V3.07143C15.3836 2.66413 15.5457 2.27352 15.8342 1.98551C16.1227 1.69751 16.514 1.53571 16.922 1.53571C17.33 1.53571 17.7213 1.69751 18.0098 1.98551C18.2983 2.27352 18.4604 2.66413 18.4604 3.07143V14.8452C18.4604 14.8876 18.4583 14.9306 18.4542 14.9742C19.3424 14.6405 20.452 14.3251 21.5371 14.3251C22.5627 14.3251 23.4385 14.5811 24.0887 14.9087C24.4108 15.0684 24.7082 15.265 24.9523 15.4861C25.0733 15.5947 25.2107 15.738 25.3317 15.9161C25.4261 16.0595 25.6394 16.4076 25.6394 16.8929C25.6395 17.1532 25.5733 17.4093 25.447 17.6372C25.3207 17.865 25.1385 18.057 24.9174 18.1951L21.0058 20.6359L17.605 24.5059L14.7806 28.3923C14.2574 29.1114 13.5712 29.6967 12.778 30.1003C11.9847 30.5038 11.1071 30.7143 10.2168 30.7143H7.88053C6.92531 30.7229 5.9848 30.4791 5.15446 30.0077C4.32411 29.5362 3.63347 28.8538 3.15262 28.0299C2.41881 26.7665 1.74995 25.4666 1.14865 24.1353C0.562016 22.8023 0 21.242 0 19.9643V5.63095C0 5.22366 0.162077 4.83304 0.450576 4.54504C0.739075 4.25704 1.13036 4.09524 1.53836 4.09524C1.94636 4.09524 2.33765 4.25704 2.62615 4.54504C2.91465 4.83304 3.07673 5.22366 3.07673 5.63095V14.3292C3.07673 14.6008 3.18478 14.8612 3.37711 15.0532C3.56945 15.2452 3.8303 15.353 4.1023 15.353C4.3743 15.353 4.63516 15.2452 4.8275 15.0532C5.01983 14.8612 5.12788 14.6008 5.12788 14.3292V3.07143C5.12788 2.66413 5.28996 2.27352 5.57846 1.98551C5.86696 1.69751 6.25824 1.53571 6.66624 1.53571C7.07424 1.53571 7.46553 1.69751 7.75403 1.98551C8.04253 2.27352 8.20461 2.66413 8.20461 3.07143V13.3095C8.20461 13.5811 8.31266 13.8415 8.50499 14.0335C8.69733 14.2255 8.95819 14.3333 9.23018 14.3333C9.50218 14.3333 9.76304 14.2255 9.95538 14.0335C10.1477 13.8415 10.2558 13.5811 10.2558 13.3095ZM25.6394 43C22.5165 43.0007 19.4785 41.985 16.9859 40.1068C14.4934 38.2286 12.6822 35.5903 11.8269 32.592C13.6831 32.1954 15.3269 31.1277 16.442 29.5942L19.2111 25.7857L22.3494 22.2105L26.0025 19.9315C27.0526 19.2763 27.6906 18.1296 27.6906 16.8929C27.6869 16.1378 27.4584 15.4008 27.0342 14.7756C26.94 14.6356 26.8372 14.5016 26.7265 14.3743C30.4302 14.6544 33.881 16.3563 36.3541 19.1227C38.8273 21.889 40.1304 25.5045 39.9897 29.2097C39.849 32.9149 38.2754 36.4215 35.5995 38.9929C32.9236 41.5644 29.3537 43.0007 25.6394 43ZM31.7929 26.619C31.7929 26.076 31.5768 25.5552 31.1921 25.1712C30.8074 24.7872 30.2857 24.5714 29.7417 24.5714C29.1977 24.5714 28.676 24.7872 28.2913 25.1712C27.9067 25.5552 27.6906 26.076 27.6906 26.619C27.6906 27.1621 27.9067 27.6829 28.2913 28.0669C28.676 28.4509 29.1977 28.6667 29.7417 28.6667C30.2857 28.6667 30.8074 28.4509 31.1921 28.0669C31.5768 27.6829 31.7929 27.1621 31.7929 26.619ZM19.767 32.1722C19.4734 32.4547 19.3041 32.842 19.2964 33.249C19.2887 33.6559 19.4432 34.0493 19.7259 34.3427C20.4913 35.1375 21.4096 35.77 22.4257 36.202C23.4419 36.6341 24.5349 36.8569 25.6394 36.8571C26.7437 36.8572 27.8367 36.6347 28.8528 36.203C29.8689 35.7713 30.7873 35.1392 31.5529 34.3447C31.6929 34.1994 31.803 34.0279 31.8767 33.8401C31.9503 33.6524 31.9863 33.4519 31.9824 33.2503C31.9785 33.0486 31.9348 32.8497 31.8539 32.6649C31.773 32.4801 31.6564 32.313 31.5108 32.1732C31.3652 32.0334 31.1935 31.9236 31.0054 31.85C30.8173 31.7764 30.6165 31.7406 30.4145 31.7445C30.2125 31.7484 30.0133 31.7919 29.8281 31.8727C29.643 31.9535 29.4756 32.0699 29.3356 32.2152C28.8571 32.7118 28.2831 33.1069 27.648 33.3768C27.0128 33.6467 26.3297 33.7858 25.6394 33.7857C24.9491 33.7858 24.266 33.6467 23.6308 33.3768C22.9957 33.1069 22.4217 32.7118 21.9432 32.2152C21.6603 31.9221 21.2723 31.7532 20.8646 31.7455C20.4569 31.7378 20.0628 31.892 19.769 32.1742M23.5883 26.619C23.5883 26.076 23.3721 25.5552 22.9875 25.1712C22.6028 24.7872 22.0811 24.5714 21.5371 24.5714C20.9931 24.5714 20.4714 24.7872 20.0867 25.1712C19.702 25.5552 19.4859 26.076 19.4859 26.619C19.4859 27.1621 19.702 27.6829 20.0867 28.0669C20.4714 28.4509 20.9931 28.6667 21.5371 28.6667C22.0811 28.6667 22.6028 28.4509 22.9875 28.0669C23.3721 27.6829 23.5883 27.1621 23.5883 26.619Z"
              fill="#C78904"
            />
          </svg>
        </i>
        <div className="lg:text-4xl text-2xl font-semibold text-black">
          Welcome Dr. <span className="text-[#0D52AF]">Ajij Rahaman</span>
        </div>
      </div>
      <div className="text-[#74777E] mb-10">
        Sign in to your ClinikPe Doctor account
      </div>
      <div className="max-w-[400px] w-full mx-auto">
        <TextInput
          label="Mobile or Email id"
          placeholder="Enter your mobile or email"
          value={mobileOrEmail}
          onChange={(e) => setMobileOrEmail(e.currentTarget.value)}
          mb="md"
          size="md"
          radius="md"
          className="w-full"
        />

        <div className="flex items-center justify-center my-4">
          <Text size="sm" color="dimmed" fw={500}>
            OR
          </Text>
        </div>

        <TextInput
          label="User ID (optional)"
          placeholder="Enter your user ID"
          value={userId}
          onChange={(e) => setUserId(e.currentTarget.value)}
          mb="md"
          size="md"
          radius="md"
          className="w-full"
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          mb="md"
          size="md"
          radius="md"
          className="w-full"
        />

        <Button
          fullWidth
          color="blue"
          radius="md"
          size="md"
          onClick={handleSendOtp}
          loading={loading}
          className="!bg-[#0D52AF]"
        >
          Login Now
        </Button>
        <div className="mt-10">
          <Text ta="center" size="sm" mt="md" className="">
            Need help?{" "}
            <Link
              className="text-blue-500 cursor-pointer hover:underline"
              to=""
            >
              Contact Support
            </Link>
          </Text>
        </div>
      </div>
    </>
  );
}
