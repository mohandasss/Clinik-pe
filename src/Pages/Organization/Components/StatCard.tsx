import React from "react";
import { IconBuilding, IconArrowUp, IconArrowDown } from "@tabler/icons-react";

type Props = {
  title: string;
  value: string | number;
  delta: string; // e.g. "+12% from last month"
  deltaType?: "positive" | "negative";
  icon?: React.ReactNode;
};

const StatCard: React.FC<Props> = ({
  title,
  value,
  delta,
  deltaType = "positive",
  icon,
}) => {
  const DeltaIcon = deltaType === "positive" ? IconArrowUp : IconArrowDown;
  const deltaColor =
    deltaType === "positive" ? "text-green-600" : "text-red-500";
  const iconBg = deltaType === "positive" ? "bg-green-50" : "bg-red-50";
  const defaultIconColor =
    deltaType === "positive" ? "text-green-600" : "text-red-500";

  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm p-4 ring-1 ring-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <h3 className="text-2xl font-semibold text-gray-900 mt-1">{value}</h3>
        </div>

        <div className="flex flex-col items-end">
          <div
            className={`w-10 h-10 rounded-md ${iconBg} flex items-center justify-center`}
          >
            {icon ?? <IconBuilding size={18} className={defaultIconColor} />}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`${deltaColor} text-sm font-medium flex items-center gap-1`}
        >
          <DeltaIcon size={14} /> {delta}
        </span>
        <span className="text-xs text-gray-400">from last month</span>
      </div>
    </div>
  );
};

export default StatCard;
