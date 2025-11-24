import { Button } from "@mantine/core";
import { useEffect, useCallback } from "react";
import Appointments from "../../../components/Doctor/Appointments/Appointments";
import { Link } from "react-router-dom";
import apis from "../../../APis/Api";
import { useDoctorAuthStore } from "../../../GlobalStore/doctorStore";

export default function DoctorDashboardPage() {
  const doctor = useDoctorAuthStore((s) => s.doctor);

  const fetchDashboard = useCallback(async () => {
    if (!doctor) return;
    if (!doctor.organization_id || !doctor.center_id) {
      console.warn(
        "Doctor missing organization or center id, skipping dashboard fetch."
      );
      return;
    }
    try {
      // Call the API and log the response structure
      const resp = await apis.DoctorDashboardData(
        doctor.organization_id ?? "",
        doctor.center_id ?? "",
        doctor.doctor_id
      );
      // Log the structure so you can inspect it
      console.log("DoctorDashboardData response:", resp);
    } catch (err) {
      console.error("Failed to fetch DoctorDashboardData:", err);
    }
  }, [doctor]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="lg:p-5 p-4 rounded-lg bg-white border border-[#EAEAEA] flex items-center justify-between">
              <div>
                <div className="text-sm mb-2 text-[#74777E]">
                  Appointments Today
                </div>
                <div className="text-2xl text-black font-semibold">12</div>
              </div>
              <div>
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 44 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="44" height="44" rx="10" fill="#DDE8F6" />
                  <path
                    d="M30.1667 31.2H13.8333V18.55H30.1667M26.6667 10.5V12.8H17.3333V10.5H15V12.8H13.8333C12.5383 12.8 11.5 13.8235 11.5 15.1V31.2C11.5 31.81 11.7458 32.395 12.1834 32.8263C12.621 33.2577 13.2145 33.5 13.8333 33.5H30.1667C30.7855 33.5 31.379 33.2577 31.8166 32.8263C32.2542 32.395 32.5 31.81 32.5 31.2V15.1C32.5 14.49 32.2542 13.905 31.8166 13.4737C31.379 13.0423 30.7855 12.8 30.1667 12.8H29V10.5M27.8333 23.15H22V28.9H27.8333V23.15Z"
                    fill="#0D52AF"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <div className="lg:p-5 p-4 rounded-lg bg-white border border-[#EAEAEA] flex items-center justify-between">
              <div>
                <div className="text-sm mb-2 text-[#74777E]">
                  Prescriptions Created
                </div>
                <div className="text-2xl text-black font-semibold">8</div>
              </div>
              <div>
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 44 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="44" height="44" rx="10" fill="#DEF5EE" />
                  <path
                    d="M16.3333 11C14.7706 11 13.5 12.2332 13.5 13.75V30.25C13.5 31.7668 14.7706 33 16.3333 33H27.6667C29.2294 33 30.5 31.7668 30.5 30.25V17.875H24.8333C24.0497 17.875 23.4167 17.2605 23.4167 16.5V11H16.3333ZM24.8333 11V16.5H30.5L24.8333 11ZM18.1042 19.4219H21.2917C22.757 19.4219 23.9479 20.5777 23.9479 22C23.9479 23.0957 23.244 24.0281 22.2523 24.402L24.156 26.1336L25.6523 24.8016C26.0109 24.4793 26.5732 24.5051 26.9052 24.8531C27.2372 25.2012 27.2107 25.7469 26.8521 26.0691L25.4531 27.3152L26.8565 28.5914C27.2151 28.918 27.2328 29.4594 26.8964 29.8074C26.5599 30.1555 26.0021 30.1727 25.6435 29.8461L24.1427 28.4797L22.5977 29.8547C22.2391 30.177 21.6768 30.1512 21.3448 29.8031C21.0128 29.4551 21.0393 28.9094 21.3979 28.5871L22.8411 27.3023L19.9724 24.6898C19.9326 24.6555 19.9016 24.6168 19.8706 24.5781H18.9852V26.4688C18.9852 26.9414 18.5867 27.3281 18.0997 27.3281C17.6128 27.3281 17.2143 26.9414 17.2143 26.4688V20.2812C17.2143 19.8086 17.6128 19.4219 18.0997 19.4219H18.1042ZM21.2917 22.8594C21.7786 22.8594 22.1771 22.4727 22.1771 22C22.1771 21.5273 21.7786 21.1406 21.2917 21.1406H18.9896V22.8594H21.2917Z"
                    fill="#02825C"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <div className="lg:p-5 p-4 rounded-lg bg-white border border-[#EAEAEA] flex items-center justify-between">
              <div>
                <div className="text-sm mb-2 text-[#74777E]">
                  Upcoming Revenue
                </div>
                <div className="text-2xl text-black font-semibold">₹3,200</div>
              </div>
              <div>
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 44 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="44" height="44" rx="10" fill="#F8ECD2" />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M32 26.2303C32 30.9006 27.8332 33 22 33C16.1668 33 12 30.9006 12 26.2633C12 21.1861 14.5004 18.6137 19.4996 16.0413L17.7295 12.6926C17.6239 12.5249 17.5651 12.3312 17.5594 12.1322C17.5536 11.9332 17.6012 11.7363 17.697 11.5626C17.7927 11.3889 17.9331 11.2448 18.1032 11.1458C18.2732 11.0467 18.4665 10.9964 18.6625 11.0002H25.7289C25.9126 11.005 26.0921 11.0571 26.2505 11.1518C26.4089 11.2464 26.541 11.3805 26.6343 11.5413C26.7276 11.702 26.7791 11.8843 26.7839 12.0709C26.7888 12.2574 26.7468 12.4422 26.6619 12.6078L24.5004 16.0413C29.4981 18.5791 32 21.1515 32 26.2303ZM18.8389 21.2144H21.443C21.6596 21.2804 21.9319 21.403 22.1501 21.6072C22.3133 21.7577 22.4341 21.9498 22.4998 22.1635H18.8405C18.7389 22.1635 18.6383 22.1838 18.5444 22.2233C18.4506 22.2628 18.3653 22.3207 18.2934 22.3937C18.2216 22.4666 18.1646 22.5532 18.1257 22.6486C18.0869 22.7439 18.0668 22.8461 18.0668 22.9492C18.0668 23.0524 18.0869 23.1546 18.1257 23.2499C18.1646 23.3452 18.2216 23.4319 18.2934 23.5048C18.3653 23.5778 18.4506 23.6356 18.5444 23.6751C18.6383 23.7146 18.7389 23.7349 18.8405 23.7349H22.2553C21.9894 24.0349 21.6522 24.2606 21.2759 24.3902C20.7908 24.5702 20.2804 24.6694 19.7642 24.6841H19.741C19.5835 24.6842 19.4298 24.7332 19.3004 24.8244C19.1711 24.9156 19.0722 25.0447 19.017 25.1945C18.9619 25.3444 18.953 25.5077 18.9917 25.6627C19.0304 25.8178 19.1147 25.9571 19.2335 26.0622L19.2366 26.0653L19.2443 26.0701L19.2644 26.0889C19.3742 26.1835 19.4872 26.2742 19.6033 26.3608C20.9375 27.3727 22.4548 28.1079 24.0687 28.5246C24.1681 28.5523 24.272 28.5595 24.3742 28.5459C24.4764 28.5322 24.575 28.4979 24.6639 28.4451C24.7529 28.3922 24.8306 28.3218 24.8924 28.238C24.9543 28.1542 24.999 28.0587 25.0239 27.9571C25.0489 27.8555 25.0536 27.7498 25.0378 27.6464C25.022 27.5429 24.9859 27.4437 24.9318 27.3545C24.8777 27.2654 24.8066 27.1882 24.7227 27.1273C24.6388 27.0665 24.5437 27.0233 24.4431 27.0003C23.4967 26.7538 22.5863 26.3818 21.7354 25.8941L21.819 25.8626C22.3419 25.6631 22.9175 25.3456 23.3662 24.8318C23.637 24.5254 23.849 24.1592 23.9805 23.7349H25.1595C25.3647 23.7349 25.5615 23.6522 25.7066 23.5048C25.8517 23.3575 25.9332 23.1576 25.9332 22.9492C25.9332 22.7409 25.8517 22.541 25.7066 22.3937C25.5615 22.2463 25.3647 22.1635 25.1595 22.1635H24.0857C24.0368 21.8319 23.9332 21.5111 23.7794 21.2144H25.1595C25.3647 21.2144 25.5615 21.1316 25.7066 20.9843C25.8517 20.8369 25.9332 20.6371 25.9332 20.4287C25.9332 20.2203 25.8517 20.0205 25.7066 19.8731C25.5615 19.7258 25.3647 19.643 25.1595 19.643H18.8405C18.6353 19.643 18.4385 19.7258 18.2934 19.8731C18.1483 20.0205 18.0668 20.2203 18.0668 20.4287C18.0668 20.6371 18.1483 20.8369 18.2934 20.9843C18.4385 21.1316 18.6353 21.2144 18.8405 21.2144H18.8389Z"
                    fill="#C18401"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <div className="md:col-span-2">
            <div className="lg:p-5 p-4 rounded-lg bg-white border border-[#EAEAEA]">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-lg text-black">
                  Upcoming Appointments
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    className="text-sm text-[#0D52AF]"
                    to="/doctor-appointments"
                  >
                    View All
                  </Link>
                  <Button size="xs" variant="default" onClick={fetchDashboard}>
                    Log Dashboard
                  </Button>
                </div>
              </div>
              <Appointments />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="lg:p-5 p-4 rounded-lg bg-white border border-[#EAEAEA]">
              <div className="mb-3 text-black font-semibold text-xl">
                Pending Actions
              </div>
              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-lg bg-[#FFEBEB] flex items-center justify-between gap-2">
                  <div>
                    <div className="text-black text-lg mb-1 font-medium">
                      3 appointments
                    </div>
                    <div className="text-[#74777E] text-sm">
                      Without prescriptions
                    </div>
                  </div>
                  <div>
                    <Button className="!bg-[#0D52AF]" size="lg">
                      Complete Now
                    </Button>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[#FAF3E5] flex items-center justify-between gap-2">
                  <div>
                    <div className="text-black text-lg mb-1 font-medium">
                      2 Unsigned
                    </div>
                    <div className="text-[#74777E] text-sm">Prescriptions</div>
                  </div>
                  <div>
                    <Button className="!bg-[#fff] !text-black" size="lg">
                      Review Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:p-5 p-4 rounded-lg bg-white border border-[#EAEAEA]">
              <div className="mb-3 text-black font-semibold text-xl">
                Earnings Snapshot
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="text-[#74777E]">This Week’s Earnings</div>
                  <div className="text-black font-semibold">₹ 18,400</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[#74777E]">Pending Payouts</div>
                  <div className="text-black font-semibold">₹ 2,000</div>
                </div>
                <div className="border border-t-[#EAEAEA]"></div>
                <div className="flex items-center justify-between">
                  <div className="text-[#74777E]">
                    Total Appointments (Week)
                  </div>
                  <div className="text-black font-semibold">42</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
