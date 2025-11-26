import { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Drawer,
  Select,
  Badge,
  TextInput,
  Group,
  Avatar,
  Button,
} from "@mantine/core";
import { IconSearch, IconEye } from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import apis from "../../../APis/Api";
import { useDoctorAuthStore } from "../../../GlobalStore/doctorStore";
import type { DoctorAppointment } from "../../../APis/Types";

interface AppointmentsProps {
  // Optional: pass appointments data from parent to avoid duplicate API calls
  externalData?: DoctorAppointment[];
  externalLoading?: boolean;
  hidePagination?: boolean;
}

export default function Appointments({
  externalData,
  externalLoading,
  hidePagination,
}: AppointmentsProps = {}) {
  const navigate = useNavigate();
  const [opened, setOpened] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<DoctorAppointment | null>(null);
  const [page, setPage] = useState(1);
  const [recordsData, setRecordsData] = useState<DoctorAppointment[]>([]);
  const [allRecords, setAllRecords] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const PAGE_SIZE = 10;

  const doctor = useDoctorAuthStore((state) => state.doctor);

  // Check if we're using external data (from parent component like Dashboard)
  const useExternalData = externalData !== undefined;

  // Initialize default date range on component mount (only when fetching our own data)
  useEffect(() => {
    if (useExternalData) return; // Skip if using external data

    const today = new Date();

    // from_date: 2 days ago
    const fromDateObj = new Date(today);
    fromDateObj.setDate(fromDateObj.getDate() - 2);

    // to_date: 7 days from now
    const toDateObj = new Date(today);
    toDateObj.setDate(toDateObj.getDate() + 7);

    setFromDate(fromDateObj.toISOString().split("T")[0]);
    setToDate(toDateObj.toISOString().split("T")[0]);
  }, [useExternalData]);

  // Update local state when external data changes
  useEffect(() => {
    if (useExternalData && externalData) {
      setRecordsData(externalData);
      setAllRecords(externalData);
      setTotalRecords(externalData.length);
    }
  }, [externalData, useExternalData]);

  const fetchAppointments = async () => {
    if (useExternalData) return; // Skip if using external data
    if (!doctor?.organization_id || !doctor?.user_id) {
      console.error("Missing doctor organization_id or user_id");
      return;
    }
    if (!fromDate || !toDate) return; // Wait for dates to be set

    setLoading(true);
    try {
      const response = await apis.GetDoctorAppointments(
        doctor.organization_id,
        doctor.center_id || "all",
        doctor.user_id,
        page,
        PAGE_SIZE,
        fromDate,
        toDate
      );

      console.log("Appointments API Response:", response);

      if (response.success && response.data?.appointments) {
        const appointments = Array.isArray(response.data.appointments)
          ? response.data.appointments
          : [];
        setRecordsData(appointments);
        setAllRecords(appointments);
        setTotalRecords(response.data.pagination?.totalRecords || 0);
      } else {
        // Set empty arrays if response is not successful
        setRecordsData([]);
        setAllRecords([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      // Set empty arrays on error
      setRecordsData([]);
      setAllRecords([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (useExternalData) return; // Skip if using external data
    if (!fromDate || !toDate) return; // Wait for dates to be set

    // fetch whenever page changes, doctor (center/user) changes, or date range changes
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    doctor?.center_id,
    doctor?.user_id,
    fromDate,
    toDate,
    useExternalData,
  ]);

  // Reset page when center or doctor user changes so the new data loads from page 1
  useEffect(() => {
    if (!useExternalData) {
      setPage(1);
    }
  }, [doctor?.center_id, doctor?.user_id, useExternalData]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    if (!value.trim()) {
      setRecordsData(allRecords);
      return;
    }

    const filtered = allRecords.filter(
      (r) =>
        r.patient_name.toLowerCase().includes(value) ||
        (r.symptoms && r.symptoms.toLowerCase().includes(value))
    );
    setRecordsData(filtered);
  };

  const handleView = (appointment: DoctorAppointment) => {
    setSelectedAppointment(appointment);
    setOpened(true);
  };

  const formatTime = (time: string) => {
    // Convert 24hr format to 12hr format
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4 items-center justify-between">
        <TextInput
          placeholder="Search..."
          leftSection={<IconSearch size={16} />}
          className="w-full sm:w-64"
          onChange={handleSearch}
        />
        <div className="grid grid-cols-3 gap-3">
          <Select
            placeholder="All type"
            data={["All type", "In-Clinic", "Online", "Completed"]}
            defaultValue="All type"
          />
          <Select
            placeholder="All status"
            data={["All status", "Upcoming", "Checked In"]}
            defaultValue="All status"
          />
          <Select
            placeholder="Timing"
            data={["Timing", "Morning", "Afternoon", "Evening"]}
            defaultValue="Timing"
          />
        </div>
      </div>

      {/* Data Table */}
      {hidePagination ? (
        <DataTable<DoctorAppointment>
          withTableBorder
          borderRadius="md"
          highlightOnHover
          minHeight={200}
          records={Array.isArray(recordsData) ? recordsData : []}
          fetching={useExternalData ? externalLoading : loading}
          noRecordsText="No appointments found"
          columns={[
            {
              accessor: "time",
              title: "Time",
              width: 120,
              render: (record) => formatTime(record.time),
            },
            {
              accessor: "patient",
              title: "Patient",
              render: (record) => (
                <Group gap="sm">
                  <Avatar src={record.patient_image} radius="xl" size="sm" />
                  <div>
                    <p className="font-medium">{record.patient_name}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(record.date)}
                    </p>
                  </div>
                </Group>
              ),
            },
            {
              accessor: "doctor_name",
              title: "Doctor",
              render: (record) => (
                <div>
                  <p className="font-medium">{record.doctor_name}</p>
                </div>
              ),
            },
            {
              accessor: "type",
              title: "Type",
              render: (record) => (
                <Badge
                  size="lg"
                  color={
                    record.appointment_type === "online"
                      ? "#0D52AF"
                      : record.appointment_type === "in_clinic"
                      ? "teal"
                      : "gray"
                  }
                  variant="light"
                >
                  {record.appointment_type === "in_clinic"
                    ? "In-Clinic"
                    : record.appointment_type === "online"
                    ? "Online"
                    : "N/A"}
                </Badge>
              ),
            },
            {
              accessor: "duration",
              title: "Duration",
              render: (record) => `${record.duration} min`,
            },
            {
              accessor: "status",
              title: "Status",
              render: (record) => <Badge>{record.appointment_status}</Badge>,
            },
            {
              accessor: "action",
              title: "Action",
              render: (record) => (
                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-xs"
                  onClick={() => handleView(record)}
                >
                  <IconEye size={16} />
                </Button>
              ),
            },
          ]}
        />
      ) : (
        <DataTable<DoctorAppointment>
          withTableBorder
          borderRadius="md"
          highlightOnHover
          minHeight={200}
          totalRecords={totalRecords}
          recordsPerPage={PAGE_SIZE}
          page={page}
          onPageChange={setPage}
          records={Array.isArray(recordsData) ? recordsData : []}
          fetching={useExternalData ? externalLoading : loading}
          noRecordsText="No appointments found"
          columns={[
            {
              accessor: "time",
              title: "Time",
              width: 120,
              render: (record) => formatTime(record.time),
            },
            {
              accessor: "patient",
              title: "Patient",
              render: (record) => (
                <Group gap="sm">
                  <Avatar src={record.patient_image} radius="xl" size="sm" />
                  <div>
                    <p className="font-medium">{record.patient_name}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(record.date)}
                    </p>
                  </div>
                </Group>
              ),
            },
            {
              accessor: "doctor_name",
              title: "Doctor",
              render: (record) => (
                <div>
                  <p className="font-medium">{record.doctor_name}</p>
                </div>
              ),
            },
            {
              accessor: "type",
              title: "Type",
              render: (record) => (
                <Badge
                  size="lg"
                  color={
                    record.appointment_type === "online"
                      ? "#0D52AF"
                      : record.appointment_type === "in_clinic"
                      ? "teal"
                      : "gray"
                  }
                  variant="light"
                >
                  {record.appointment_type === "in_clinic"
                    ? "In-Clinic"
                    : record.appointment_type === "online"
                    ? "Online"
                    : "N/A"}
                </Badge>
              ),
            },
            {
              accessor: "duration",
              title: "Duration",
              render: (record) => `${record.duration} min`,
            },
            {
              accessor: "status",
              title: "Status",
              render: (record) => <Badge>{record.appointment_status}</Badge>,
            },
            {
              accessor: "action",
              title: "Action",
              render: (record) => (
                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-xs"
                  onClick={() => handleView(record)}
                >
                  <IconEye size={16} />
                </Button>
              ),
            },
          ]}
        />
      )}

      {/* Drawer */}
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Appointment Details"
        position="right"
        size="md"
      >
        {selectedAppointment ? (
          <>
            <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#EAEAEA]">
              <div className="flex items-center gap-4 mb-2">
                <Avatar
                  src={selectedAppointment.patient_image}
                  radius="xl"
                  size="lg"
                />
                <div>
                  <div className="text-lg text-black font-semibold">
                    {selectedAppointment.patient_name}
                  </div>
                  <div className="text-sm text-[#74777E]">
                    Patient ID: {selectedAppointment.patient_id}
                  </div>
                  <div className="text-sm text-[#74777E]">
                    Appointment ID: {selectedAppointment.uid}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              <div className="text-lg text-black font-semibold mb-2">
                Appointment Details
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-[#74777E]">Date</p>
                  <p className="font-medium">
                    {formatDate(selectedAppointment.date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#74777E]">Time</p>
                  <p className="font-medium">
                    {formatTime(selectedAppointment.time)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#74777E]">Duration</p>
                  <p className="font-medium">
                    {selectedAppointment.duration} minutes
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#74777E]">Type</p>
                  <p className="font-medium">
                    {selectedAppointment.appointment_type === "in_clinic"
                      ? "In-Clinic"
                      : selectedAppointment.appointment_type === "online"
                      ? "Online"
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#74777E]">Status</p>
                  <Badge>{selectedAppointment.appointment_status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-[#74777E]">Doctor</p>
                  <p className="font-medium">
                    {selectedAppointment.doctor_name}
                  </p>
                </div>
              </div>
            </div>
            {selectedAppointment.symptoms && (
              <>
                <div className="text-lg mt-4 mb-2">Symptoms</div>
                <div className="p-4 bg-[#F9F9F9] rounded-lg text-[#74777E]">
                  {selectedAppointment.symptoms}
                </div>
              </>
            )}
            <div className="mt-6">
              <Button
                fullWidth
                className="!bg-[#0D52AF]"
                size="md"
                onClick={() => {
                  navigate("/e-prescription", {
                    state: {
                      appointment: selectedAppointment,
                    },
                  });
                }}
              >
                Create Prescription
              </Button>
            </div>
          </>
        ) : (
          <p>No appointment selected.</p>
        )}
      </Drawer>
    </>
  );
}
