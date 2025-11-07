import React from "react";
import StatCard from "../Organization/Components/StatCard";
import { IconCheck, IconX } from "@tabler/icons-react";
import ClinicTable from "./Components/ClinicTable";

const ClinicList = () => {
  return (
    <div className="  space-y-6 p-0">
      <div className="flex gap-4">
        <StatCard
          title="Total Clinics"
          value={"1,247"}
          delta={"12%"}
          deltaType="positive"
        />

        <StatCard
          title="Active Clinics"
          value={"1,089"}
          delta={"8%"}
          deltaType="positive"
          icon={<IconCheck className="text-green-600" />}
        />

        <StatCard
          title="Inactive Clinics"
          value={"158"}
          delta={"3%"}
          deltaType="negative"
          icon={<IconX className="text-red-500" />}
        />
      </div>
      {/* Clinic Table */}
      <ClinicTable />
    </div>
  );
};

export default ClinicList;
