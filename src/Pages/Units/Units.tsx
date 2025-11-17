import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Button, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import apis from "../../APis/Api";
import type { Unit } from "../../APis/Types";
import UnitsTable from "./Components/UnitsTable";
import AddUnitModal from "./Components/AddUnitModal";
import DeleteConfirm from "../TestPackages/Components/DeleteConfirm";

const Units: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Load units from API
  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apis.GetTestUnits(query || "");

      if (response.success && response.data) {
        setUnits(response.data.units);
      } else {
        notifications.show({
          title: "Error",
          message: response.message ,
          color: "red",
        });
      }
    } catch (error) {
      console.error("Failed to load units:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch units",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  // Filter units locally based on search query
  const filtered = useMemo(() => {
    if (!query) return units;
    const q = query.toLowerCase();
    return units.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.description.toLowerCase().includes(q)
    );
  }, [units, query]);

  const total = filtered.length;
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Add new unit
  const handleAddUnit = async (name: string) => {
    setSaving(true);
    try {
      const response = await apis.AddTestUnits(name);

      if (response.success) {
        notifications.show({
          title: "Success",
          message: response.message ,
          color: "blue",
        });
        setIsAddModalOpen(false);
        await loadUnits();
      } else {
        notifications.show({
          title: "Error",
          message: response.message ,
          color: "red",
        });
      }
    } catch (error) {
      console.error("Failed to add unit:", error);
      notifications.show({
        title: "Error",
        message: "Failed to add unit",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete unit
  const handleDeleteUnit = async () => {
    if (!unitToDelete) return;

    setDeleting(true);
    try {
      const response = await apis.DeleteTestUnits(unitToDelete.uid);

      if (response.success) {
        notifications.show({
          title: "Success",
          message: response.message ,
          color: "blue",
        });
        setIsDeleteModalOpen(false);
        setUnitToDelete(null);
        await loadUnits();
      } else {
        notifications.show({
          title: "Warning",
          message: response.message ,
          color: "yellow",
        });
        setIsDeleteModalOpen(false);
        setUnitToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete unit:", error);
      notifications.show({
        title: "Error",
        message: "Failed to delete unit",
        color: "red",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClick = (unit: Unit) => {
    setUnitToDelete(unit);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 items-center flex-1">
          <h2 className="text-lg font-semibold text-gray-800">Units</h2>
          <div className="w-64">
            <TextInput
              placeholder="Search units"
              value={query}
              onChange={(e) => {
                setQuery(e.currentTarget.value);
                setPage(1);
              }}
              aria-label="Search units"
            />
          </div>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="filled"
          color="blue"
          disabled={loading}
        >
          + Add new
        </Button>
      </div>

      {/* Table */}
      <UnitsTable
        records={rows}
        page={page}
        pageSize={pageSize}
        setPage={setPage}
        setPageSize={setPageSize}
        total={total}
        onDelete={handleDeleteClick}
      />

      {/* Add Modal */}
      <AddUnitModal
        opened={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddUnit}
        loading={saving}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirm
        opened={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUnitToDelete(null);
        }}
        onConfirm={handleDeleteUnit}
        itemName={unitToDelete?.name}
        loading={deleting}
      />
    </div>
  );
};

export default Units;
