import { useEffect, useState } from "react";
import {
  Select,
  Button,
  Card,
  Text,
  Title,
  Loader,
  MultiSelect,
} from "@mantine/core";
import { DatePickerInput, type DatesRangeValue } from "@mantine/dates";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import apis from "../../APis/Api";
import useAuthStore from "../../GlobalStore/store";
import type {
  DashboardRequestPayload,
  DashboardResponse,
  DashboardTopic,
} from "../../APis/Types";

const COLORS = ["#0D52AF", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const TOPIC_OPTIONS = [
  { value: "appointments", label: "Appointments" },
  { value: "providers", label: "Providers" },
  { value: "revenue", label: "Revenue" },
  { value: "patients", label: "Patients" },
  { value: "departments", label: "Departments" },
  { value: "categories", label: "Categories" },
  { value: "tests,panels,packages", label: "Tests, Panels & Packages" },
  { value: "users", label: "Users" },
];

const PERIOD_UNIT_OPTIONS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const organizationDetails = useAuthStore((s) => s.organizationDetails);

  // Form state
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    "appointments",
  ]);
  const [dateRange, setDateRange] = useState<DatesRangeValue>([
    new Date(new Date().setDate(new Date().getDate() - 7)),
    new Date(),
  ]);
  const [periodUnit, setPeriodUnit] = useState<string>("day");
  const [periodValue, setPeriodValue] = useState<string>("1");
  const [activeStatus, setActiveStatus] = useState<string>("true");
  const [inactiveStatus, setInactiveStatus] = useState<string>("false");
  const [cancelledStatus, setCancelledStatus] = useState<string>("false");
  const [rescheduledStatus, setRescheduledStatus] = useState<string>("false");

  const formatDate = (date: Date | string | null): string => {
    if (!date) return "";
    if (typeof date === "string") return date;
    return date.toISOString().split("T")[0];
  };

  const fetchDashboardData = async () => {
    if (
      !organizationDetails?.organization_id ||
      !organizationDetails?.central_account_id
    ) {
      return;
    }

    if (!dateRange[0] || !dateRange[1]) {
      return;
    }

    if (selectedTopics.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const items = selectedTopics.map((topic) => ({
        topics: topic as DashboardTopic,
        date_range: {
          from: formatDate(dateRange[0]),
          to: formatDate(dateRange[1]),
        },
        period: {
          unit: periodUnit as "day" | "week" | "month" | "year",
          value: parseInt(periodValue) || 1,
        },
        criteria: {
          status: {
            active: activeStatus === "true",
            inactive: inactiveStatus === "true",
            cancelled: cancelledStatus === "true",
            rescheduled: rescheduledStatus === "true",
          },
        },
      }));

      const payload: DashboardRequestPayload = {
        hierarchy: {
          central_account_id: organizationDetails.central_account_id,
          organization_id: organizationDetails.organization_id,
          center_id: organizationDetails.center_id || undefined,
        },
        items,
      };

      console.log(
        "Dashboard Request Payload:",
        JSON.stringify(payload, null, 2)
      );

      const response = await apis.GetDashboard(payload);

      console.log("Dashboard Response:", response);
      setDashboardData(response);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationDetails]);

  const prepareChartData = (item: any) => {
    if (!item?.data || !Array.isArray(item.data)) {
      return [];
    }
    return item.data.map((dataBlock: any) => ({
      name: `${dataBlock.date_range?.from || ""}`,
      value: dataBlock.value || 0,
      date: dataBlock.date_range?.from || "",
    }));
  };

  const getTotalValue = (item: any) => {
    if (!item?.data || !Array.isArray(item.data)) {
      return 0;
    }
    return item.data.reduce((sum: number, d: any) => sum + (d.value || 0), 0);
  };

  const getTopicLabel = (topic: string) => {
    if (topic === "tests,panels,packages") {
      return "Tests, Panels & Packages";
    }
    const option = TOPIC_OPTIONS.find((opt) => opt.value === topic);
    return option?.label || topic;
  };

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      {/* Controls Section */}
      <Card shadow="sm" padding="md" radius="md" mb="md">
        <div className="space-y-3">
          <Title order={4}>Dashboard Configuration</Title>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="col-span-2">
              <MultiSelect
                label="Topics"
                placeholder="Select topics"
                data={TOPIC_OPTIONS}
                value={selectedTopics}
                onChange={setSelectedTopics}
                size="sm"
              />
            </div>

            <div className="col-span-2">
              <DatePickerInput
                type="range"
                label="Date Range"
                placeholder="Select dates"
                value={dateRange}
                onChange={setDateRange}
                size="sm"
              />
            </div>

            <div>
              <Select
                label="Period Unit"
                placeholder="Unit"
                data={PERIOD_UNIT_OPTIONS}
                value={periodUnit}
                onChange={(value) => setPeriodUnit(value || "day")}
                size="sm"
              />
            </div>

            <div>
              <Select
                label="Period Value"
                placeholder="Value"
                data={["1", "2", "3", "4", "5", "7", "10", "15", "30"]}
                value={periodValue}
                onChange={(value) => setPeriodValue(value || "1")}
                size="sm"
              />
            </div>

            <div>
              <Select
                label="Active"
                data={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                ]}
                value={activeStatus}
                onChange={(value) => setActiveStatus(value || "true")}
                size="sm"
              />
            </div>

            <div>
              <Select
                label="Inactive"
                data={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                ]}
                value={inactiveStatus}
                onChange={(value) => setInactiveStatus(value || "false")}
                size="sm"
              />
            </div>

            <div>
              <Select
                label="Cancelled"
                data={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                ]}
                value={cancelledStatus}
                onChange={(value) => setCancelledStatus(value || "false")}
                size="sm"
              />
            </div>

            <div>
              <Select
                label="Rescheduled"
                data={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                ]}
                value={rescheduledStatus}
                onChange={(value) => setRescheduledStatus(value || "false")}
                size="sm"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={fetchDashboardData}
                loading={loading}
                size="sm"
                className="!bg-[#0D52AF] w-full"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card shadow="sm" padding="md" radius="md">
          <div className="flex justify-center items-center gap-2 py-4">
            <Loader size="sm" />
            <Text size="sm">Loading dashboard data...</Text>
          </div>
        </Card>
      )}

      {/* Dashboard Data Display */}
      {!loading &&
        dashboardData &&
        dashboardData.data?.items &&
        dashboardData.data.items.length > 0 && (
          <div
            className={`grid gap-6 ${
              dashboardData.data.items.length === 1
                ? "grid-cols-1"
                : dashboardData.data.items.length === 2
                ? "grid-cols-1 lg:grid-cols-2"
                : dashboardData.data.items.length === 3
                ? "grid-cols-1 lg:grid-cols-3"
                : "grid-cols-1 lg:grid-cols-2"
            }`}
          >
            {dashboardData.data.items.map((item, index) => {
              const chartData = prepareChartData(item);
              const total = getTotalValue(item);

              return (
                <div key={`${item.topics}-${index}`}>
                  <Card shadow="sm" padding="md" radius="md">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Title order={4}>{getTopicLabel(item.topics)}</Title>
                        <Text size="lg" fw={700} c="blue">
                          Total: {total}
                        </Text>
                      </div>

                      <Text size="xs" c="dimmed">
                        {item.date_range?.from || "N/A"} to{" "}
                        {item.date_range?.to || "N/A"} •{" "}
                        {item.period?.value || 1} {item.period?.unit || "day"}
                        (s)
                      </Text>

                      {/* Line Chart */}
                      {chartData.length > 0 ? (
                        <div className="w-full">
                          <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="date"
                                style={{ fontSize: "12px" }}
                              />
                              <YAxis style={{ fontSize: "12px" }} />
                              <Tooltip />
                              <Legend wrapperStyle={{ fontSize: "12px" }} />
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="w-full py-6">
                          <Text ta="center" c="dimmed" size="sm">
                            No data available for this period
                          </Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}

      {/* No Data State */}
      {!loading &&
        (!dashboardData ||
          !dashboardData.data?.items ||
          dashboardData.data.items.length === 0) && (
          <Card shadow="sm" padding="md" radius="md">
            <Text ta="center" c="dimmed" size="sm" py="lg">
              {selectedTopics.length === 0
                ? "Please select at least one topic to view dashboard data"
                : !dateRange[0] || !dateRange[1]
                ? "Please select a valid date range"
                : "No data available for the selected criteria. Try adjusting your filters."}
            </Text>
          </Card>
        )}
    </div>
  );
};

export default Dashboard;
