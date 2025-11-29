import React from "react";
import { Badge, Group, Text, Avatar } from "@mantine/core";
import { type BookingItem } from "../../../APis/Types";

interface BillsCardProps {
  booking: BookingItem;
  currency?: string;
}

const BillsCard: React.FC<BillsCardProps> = ({ booking, currency = "₹" }) => {
  const getGenderInitial = (gender?: string | null) => {
    if (!gender) return "";
    const g = gender.toLowerCase();
    if (g === "male") return "M";
    if (g === "female") return "F";
    return "";
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.split(" ");
    return parts
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-4 mb-2">
      <div className="flex items-center justify-between gap-3 relative h-20">
        {/* Left Side: Patient Image & Details */}
        <div className="flex items-center gap-2 min-w-0 flex-1 pr-16">
          <Avatar
            name={getInitials(booking.patient_name)}
            src={(booking as any).patient_image || undefined}
            color="blue"
            size={36}
            radius="md"
          />
          <div className="min-w-0 flex-1">
            <Text
              size="sm"
              fw={700}
              className="text-gray-900 truncate"
              title={booking.patient_name || "Unknown"}
            >
              {booking.patient_name || "—"}
            </Text>
            <Group gap="xs" className="text-xs text-gray-600">
              {booking.patient_age && <span>{booking.patient_age} years</span>}
              {booking.patient_gender && (
                <Badge
                  color={
                    booking.patient_gender.toLowerCase() === "male"
                      ? "blue"
                      : "pink"
                  }
                  size="sm"
                  variant="light"
                >
                  <span>{getGenderInitial(booking.patient_gender)}</span>
                </Badge>
              )}
            </Group>
          </div>
        </div>

        {/* Middle: Test Names (centered) - only show if tests exist */}
        {((booking as any).test_items?.length ?? 0) > 0 && (
          <div className="flex flex-col items-center justify-center gap-1 px-3 min-w-max w-40 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="text-center">
              <Text size="xs" c="dimmed" className="uppercase tracking-wide">
                Tests
              </Text>
              <div className="flex flex-wrap justify-center gap-1 mt-1">
                {(() => {
                  const arr = (booking as any).test_items || [];
                  const displayItems = arr.slice(0, 3); // Show max 3 badges
                  const extra = Math.max(0, arr.length - 3);

                  return (
                    <>
                      {displayItems.map((t: any, index: number) => (
                        <Badge
                          key={index}
                          size="xs"
                          variant="light"
                          color="blue"
                          className="text-xs"
                        >
                          {t?.name || ""}
                        </Badge>
                      ))}
                      {extra > 0 && (
                        <Badge size="xs" variant="light" color="gray">
                          +{extra}
                        </Badge>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Additional Info */}
        <div className="flex flex-col items-end justify-start gap-1 min-w-max pl-16">
          {/* Main Payable Amount - Highlighted */}
          {booking.payable_amount && (
            <div className="text-right">
              <Text size="sm" fw={700} c="blue" className="text-lg">
                {currency} {booking.payable_amount}
              </Text>
              <Text size="xs" c="dimmed">
                Amount to Pay
              </Text>
            </div>
          )}

          {/* Original Amount (Discount) */}
          {booking.total_amount && booking.payable_amount && (
            <div className="text-right">
              <Text size="xs" c="dimmed" className="line-through">
                {currency} {booking.total_amount}
              </Text>
            </div>
          )}

          {/* Savings */}
          {booking.total_amount && booking.payable_amount && (
            <div className="text-right">
              <Text size="xs" fw={500} c="green">
                Save {currency}{" "}
                {(
                  parseFloat(booking.total_amount) -
                  parseFloat(booking.payable_amount)
                ).toFixed(2)}
              </Text>
            </div>
          )}

          {booking.doctor_name && (
            <Text size="xs" c="dimmed" className="text-right">
              <span className="text-gray-600">Referred by:</span>{" "}
              <span className="font-medium">{booking.doctor_name}</span>
            </Text>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillsCard;
