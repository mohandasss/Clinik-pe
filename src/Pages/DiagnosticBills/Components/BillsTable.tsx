import React, { useState, useEffect } from "react";
import { Button, Pagination, Group, Text, Center, Loader } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import apis from "../../../APis/Api";
import useAuthStore from "../../../GlobalStore/store";
import {
  type BookingItem,
  type BookingsListResponse,
} from "../../../APis/Types";
import BillsCard from "./BillsCard";

interface BillsTableProps {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onAddNew: () => void;
}

const BillsTable: React.FC<BillsTableProps> = ({
  page,
  pageSize,
  onPageChange,
  onAddNew,
}) => {
  const [bills, setBills] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const organizationDetails = useAuthStore((s) => s.organizationDetails);

  const total = totalRecords || bills.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const orgCurrency = organizationDetails?.currency ?? "₹";

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      try {
        const orgId = organizationDetails?.organization_id;
        const centerId = organizationDetails?.center_id;
        if (!orgId || !centerId) {
          setBills([]);
          setTotalRecords(0);
          return;
        }

        const resp = await apis.GetBillingList(orgId, centerId, page, pageSize);
        const data = resp as BookingsListResponse;
        if (data?.data?.bookings) {
          setBills(data.data.bookings);
          setTotalRecords(
            data.data.pagination?.totalRecords ?? data.data.bookings.length
          );
        } else {
          setBills([]);
          setTotalRecords(0);
        }
      } catch (err) {
        console.warn("GetBillingList failed:", err);
        setBills([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, [organizationDetails, page, pageSize]);

  if (!loading && bills.length === 0) {
    return (
      <div className="space-y-6">
        {/* Empty State */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No cases to show.
            </h3>
            <p className="text-sm text-gray-600">
              Get started by adding a new case.
            </p>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={onAddNew}
              variant="filled"
              color="blue"
            >
              Add new case
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && bills.length === 0 && (
        <Center py={40}>
          <Loader />
        </Center>
      )}

      {/* Cards Container */}
      {bills.length > 0 && (
        <div className="space-y-0">
          {bills.map((bill) => (
            <BillsCard
              key={bill.booking_uid}
              booking={bill}
              currency={orgCurrency}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <Text size="sm" c="dimmed">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, total)} of {total} entries
          </Text>
          <Group gap="xs">
            <Pagination
              value={page}
              onChange={onPageChange}
              total={totalPages}
              size="sm"
            />
          </Group>
        </div>
      )}
    </div>
  );
};

export default BillsTable;
