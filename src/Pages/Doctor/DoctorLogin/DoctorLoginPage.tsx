import { Image } from "@mantine/core";
import DoctorLogin from "../../../components/Doctor/DoctorLogin/DoctorLogin";

export default function DoctorLoginPage() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="bg-[#0D52AF] h-screen hidden md:flex flex-col items-center justify-center gap-3 p-10">
          <div>
            <Image src="/images/logo-fav.webp" alt="" />
          </div>
          <div className="text-4xl font-semibold text-white">
            Clinik Pe <span className="text-[#CC8C01]">Doctor</span>
          </div>
          <div className="text-2xl text-white font-semibold">
            Smart e-Prescriptions for Every Clinic
          </div>
          <div>
            <Image src="/images/d-loginLeft.webp" alt="" />
          </div>
          <div className="text-sm text-white">
            © 2025 Clinik Pe. All Rights Reserved
          </div>
        </div>
        <div className="bg-[#F9FAFB] h-screen flex flex-col items-center justify-center gap-3 p-10">
          <DoctorLogin />
        </div>
      </div>
    </>
  );
}
