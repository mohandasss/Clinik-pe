import React, { useMemo, useState } from "react";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { Button, Popover, TextInput, Select } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import apis from "../../APis/Api";
import type { TestPackagePayload } from "../../APis/Types";
import { IconDots, IconPencil } from "@tabler/icons-react";
import type { TestPackageRow } from "../../APis/Types";
import EditPackageDrawer from "./Components/EditPackageDrawer";
import DeleteConfirm from "./Components/DeleteConfirm";
// navigate not required here — drawer handles add/edit

const MOCK_PACKAGES: TestPackageRow[] = [
  {
    id: "1",
    name: "Anemia package",
    fee: "Rs.100",
    gender: "Both",
    included: "C-Reactive Protein, CRP (Quantitative), Folic Acid, Vitamin B12",
    tests: [
      "C-Reactive Protein",
      "CRP (Quantitative)",
      "Folic Acid",
      "Vitamin B12",
    ],
    panels: [],
  },
  {
    id: "2",
    name: "Antenatal Package",
    fee: "Rs.100",
    gender: "Female",
    included: "Urine Routine Examination, Thyroid-Stimulating Hormone",
    tests: ["Urine Routine Examination", "Thyroid-Stimulating Hormone"],
    panels: ["Antenatal Panel"],
  },
  {
    id: "3",
    name: "Arthritis Package",
    fee: "Rs.100",
    gender: "Both",
    included: "C-Reactive Protein, C3 Complement",
    tests: ["C-Reactive Protein", "C3 Complement"],
    panels: ["Arthritis Profile"],
  },
  {
    id: "4",
    name: "Bad Obstetric History (BOH) Package",
    fee: "Rs.100",
    gender: "Female",
    included: "Thyroid-Stimulating Hormone, TSH, Lupus Anticoagulant",
    tests: ["Thyroid-Stimulating Hormone", "TSH", "Lupus Anticoagulant"],
    panels: ["Antenatal Panel"],
  },
  {
    id: "5",
    name: "CBC with GBP",
    fee: "Rs.100",
    gender: "Both",
    included: "Peripheral Blood Smear, Complete Blood Count (CBC)",
    tests: ["Peripheral Blood Smear", "Complete Blood Count (CBC)"],
    panels: [],
  },
];

const TestPackage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, _setPageSize] = useState(10);
  const [query, setQuery] = useState("");
  const [packages, setPackages] = useState<TestPackageRow[]>(MOCK_PACKAGES);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingRow, setEditingRow] = useState<TestPackageRow | null>(null);
  const [editingOpen, setEditingOpen] = useState(false);
  const [deletingRow, setDeletingRow] = useState<TestPackageRow | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const filtered = useMemo(() => {
    let data = packages;
    if (query) {
      const q = query.toLowerCase();
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.included.toLowerCase().includes(q)
      );
    }
    return data;
  }, [query, packages]);

  const total = filtered.length;
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSavePackage = (row: TestPackageRow) => {
    (async () => {
      setSaving(true);
      try {
        const payload: TestPackagePayload = {
          name: row.name,
          fee: row.fee,
          gender: row.gender,
          tests: row.tests,
          panels: row.panels,
        };
        if (packages.some((p) => p.id === row.id)) {
          // update
          await apis.UpdateTestPackage(row.id, payload);
          setPackages((prev) => prev.map((p) => (p.id === row.id ? row : p)));
          notifications.show({
            title: "Updated",
            message: "Package updated",
            color: "green",
          });
        } else {
          // create
          const resp = await apis.AddTestPackage(payload);
          // if response returns object with package, use it; otherwise use the row created locally
          const newRow = resp?.data?.package || row;
          setPackages((prev) => [newRow, ...prev]);
          notifications.show({
            title: "Saved",
            message: "Package added",
            color: "green",
          });
        }
      } catch (err) {
        console.error(err);
        notifications.show({
          title: "Error",
          message: "Failed to save package. Falling back to local change.",
          color: "red",
        });
        // fallback: still update local state
        setPackages((prev) => {
          const found = prev.some((p) => p.id === row.id);
          if (found) return prev.map((p) => (p.id === row.id ? row : p));
          return [row, ...prev];
        });
      } finally {
        setSaving(false);
      }
    })();
  };

  const handleDeleteConfirm = (id: string) => {
    (async () => {
      setDeleting(true);
      try {
        await apis.DeleteTestPackage(id);
        setPackages((prev) => prev.filter((p) => p.id !== id));
        setDeletingRow(null);
        notifications.show({
          title: "Deleted",
          message: "Package removed",
          color: "red",
        });
      } catch (err) {
        console.error(err);
        // fallback to removing locally
        setPackages((prev) => prev.filter((p) => p.id !== id));
        setDeletingRow(null);
        notifications.show({
          title: "Deleted (local)",
          message: "Package removed locally",
          color: "yellow",
        });
      } finally {
        setDeleting(false);
      }
    })();
  };

  // Load test packages from API when mounted, fallback to mock if API fails
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingPackages(true);
      try {
        const resp = await apis.GetTestPackages();
        if (mounted && resp?.data?.packages) setPackages(resp.data.packages);
      } catch (err) {
        console.warn("GetTestPackages failed, using local mocks", err);
        // fallback to MOCK_PACKAGES already in state
      } finally {
        setLoadingPackages(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const columns: DataTableColumn<TestPackageRow>[] = [
    {
      accessor: "sno",
      title: "S.NO.",
      render: (_r, i) => <div>{(page - 1) * pageSize + (i + 1)}.</div>,
      width: 100,
    },
    {
      accessor: "name",
      title: "Name",
      render: (r) => <div className="font-medium text-gray-900">{r.name}</div>,
    },
    {
      accessor: "fee",
      title: "Fee",
      width: 100,
      render: (r) => <div>{r.fee}</div>,
    },
    {
      accessor: "gender",
      title: "Gender",
      width: 80,
      render: (r) => <div className="text-sm text-gray-600">{r.gender}</div>,
    },
    {
      accessor: "included",
      title: "Tests",
      render: (r) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {r.included}
        </div>
      ),
    },
    {
      accessor: "panels",
      title: "Panels",
      render: (r) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {Array.isArray(r.panels) && r.panels.length
            ? r.panels.join(", ")
            : ""}
        </div>
      ),
    },
    {
      accessor: "action",
      title: "ACTION",
      width: 100,
      render: (r) => {
        return (
          <div className="flex items-center gap-2">
            <button
              className="text-blue-600 text-sm"
              onClick={() => {
                setEditingRow(r);
                setEditingOpen(true);
              }}
            >
              <IconPencil size={16} />
            </button>
            <Popover position="bottom" withArrow shadow="md">
              <Popover.Target>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <IconDots className="rotate-90" />
                </button>
              </Popover.Target>
              <Popover.Dropdown>
                <div className="flex flex-col gap-2 min-w-max">
                  <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    onClick={() => {
                      setDeletingRow(r);
                      setDeleteModalOpen(true);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </Popover.Dropdown>
            </Popover>
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Test packages</h2>
          <div className="ml-auto w-64">
            <TextInput
              placeholder="Search in page"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={() => {
            setEditingRow(null); // clear any selected row
            setEditingOpen(true); // open drawer in add mode
          }}
          variant="filled"
          color="blue"
          disabled={loadingPackages}
        >
          + Add new
        </Button>
      </div>

      {/* <div className="mb-3">
        <div className="flex items-center gap-4">
          <div className="ml-auto w-64">
            <TextInput
              placeholder="Search in page"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div> */}

      <DataTable
        records={rows}
        columns={columns}
        highlightOnHover
        className="text-sm"
        striped={false}
        idAccessor="id"
      />

      <EditPackageDrawer
        opened={editingOpen}
        onClose={() => {
          setEditingOpen(false);
          setEditingRow(null);
        }}
        row={editingRow}
        onSave={handleSavePackage}
        loading={saving}
      />

      <DeleteConfirm
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => deletingRow && handleDeleteConfirm(deletingRow.id)}
        itemName={deletingRow?.name}
        loading={deleting}
      />

      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
        <div>
          Showing {(page - 1) * pageSize + 1} to{" "}
          {Math.min(page * pageSize, total)} of {total} entries
        </div>
        <div className="inline-flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded text-gray-600"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <div className="inline-flex items-center gap-1">
            {Array.from(
              { length: Math.max(1, Math.ceil(total / pageSize)) },
              (_, i) => i + 1
            ).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded ${
                  page === n ? "bg-blue-600 text-white" : "border text-gray-600"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <Select
            value={String(pageSize)}
            onChange={(val) => {
              _setPageSize(Number(val || 10));
              setPage(1);
            }}
            data={["10", "20", "50"]}
            className="w-24"
          />

          <button
            className="px-3 py-1 border rounded text-gray-600"
            disabled={page >= Math.ceil(Math.max(1, total) / pageSize)}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestPackage;
