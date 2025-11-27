import { Outlet } from "react-router-dom";
import FeatureCard from "../Onboarding/Components/FeatureCard";
import { IconUsers, IconClock, IconCreditCard } from "@tabler/icons-react";
import logoPng from "../../assets/logo.png";

const OnboardingPage = () => {
  return (
    <div className="min-h-screen bg-blue-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Column */}
        <div className="lg:flex-1 lg:p-16 flex flex-col justify-center">
          {/* Logo Section */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-2">
              <img
                src={logoPng}
                alt="ClinikPe logo"
                className="w-50 h-auto"
              />
            </div>
          </div>

          {/* Main Heading */}
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4">
              Grow Your Clinic & Lab With
            </h2>
            <p className="text-gray-600 text-base lg:text-lg xl:text-xl max-w-md">
              Reach more patients, simplify bookings, and get paid faster - all
              in one platform
            </p>
          </div>

          {/* Feature Cards Section */}
          <div className="flex flex-wrap gap-12 lg:gap-12 mb-12">
            <FeatureCard
              icon={<IconUsers size={32} />}
              title="Increase Patients"
              description="Be visible online & attract new patients"
            />
            <FeatureCard
              icon={<IconClock size={32} />}
              title="Save Time"
              description="Manage appointments and reports digitally"
            />
            <FeatureCard
              icon={<IconCreditCard size={32} />}
              title="Get paid Directly"
              description="Secure instant settlement to your bank account"
            />
          </div>

          {/* Security Note */}
          <div className="flex items-start gap-2 text-gray-500 text-sm lg:text-base">
            <span>🔒</span>
            <p>
              Your documents & data 100% secure and only used for verification.
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:flex-1 lg:p-16 flex items-center justify-center">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
