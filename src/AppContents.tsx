import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import OnboardingPage from "./Onboarding/OnboardingPage";

function AppContents() {
  return (
    <Routes>
      <Route path="/" element={<OnboardingPage />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default AppContents;
