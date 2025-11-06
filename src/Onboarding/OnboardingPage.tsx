import FeatureCard from "../components/FeatureCard";
import OnboardingForm, {
  type OnboardingFormData,
} from "../components/OnboardingForm";
import { IconUsers, IconClock, IconCreditCard } from "@tabler/icons-react";
import logoPng from "../assets/logo.png";

const OnboardingPage = () => {
  const handleFormSubmit = (data: OnboardingFormData) => {
    console.log("Form submitted:", data);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop-only main container (hidden on small screens) */}
      <div className="hidden lg:block">
        {/* Main Container for large screens */}
        <div className="flex flex-row min-h-screen">
          {/* ========================================
              LEFT SECTION - Branding & Features
              ======================================== */}
          <div className="flex-1 bg-transparent p-8 lg:p-16 flex flex-col justify-center">
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
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Grow Your Clinic & Lab With
              </h2>
              <p className="text-gray-600 text-base max-w-md">
                Reach more patients, simplify bookings, and get paid faster -
                all in one platform
              </p>
            </div>

            {/* Feature Cards Section */}
            <div className="flex flex-wrap gap-8 lg:gap-12 mb-12">
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
            <div className="flex items-start gap-2 text-gray-500 text-sm">
              <span>🔒</span>
              <p>
                Your documents & data 100% secure and only used for
                verification.
              </p>
            </div>
          </div>

          {/* ========================================
            RIGHT SECTION - Onboarding Form
            ======================================== */}
          <div className="flex-1 bg-transparent p-8 lg:p-16 flex items-center justify-center">
            <OnboardingForm  onSubmit={handleFormSubmit} />
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default OnboardingPage;
