import React, { useEffect, useState, useCallback } from "react";
import { Button, TextInput, Popover, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDots, IconPencil } from "@tabler/icons-react";
import NameStatusModal from "../Components/NameStatusModal";
import DeleteConfirm from "../../TestPackages/Components/DeleteConfirm";
import apis from "../../../APis/Api";
import useAuthStore from "../../../GlobalStore/store";

// Types
type Department = {
  id: string;
  uid: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
};

type PaginationInfo = {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
};

// Constants
const PAGE_SIZE = 5;

const TestDepartment: React.FC = () => {
  // State Management
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    pageNumber: 1,
    pageSize: PAGE_SIZE,
    totalPages: 1,
    totalRecords: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete States
  const [toDelete, setToDelete] = useState<Department | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auth Store
  const organizationId = useAuthStore(
    (state) => state.organizationDetails?.organization_id
  );
  const centerId = useAuthStore(
    (state) => state.organizationDetails?.center_id
  );

  // Notification Helper
  const showNotification = useCallback(
    (message: string, type: "success" | "error" | "warning") => {
      const colorMap = {
        success: "green",
        error: "red",
        warning: "yellow",
      };
      notifications.show({
        title: type.charAt(0).toUpperCase() + type.slice(1),
        message,
        color: colorMap[type],
      });
    },
    []
  );

  // Fetch Departments
  const fetchDepartments = useCallback(async () => {
    if (!organizationId || !centerId) {
      console.warn("Missing organization or center ID");
      return;
    }

    setLoading(true);
    try {
      const response = await apis.GetAllDepartments(
        organizationId,
        centerId,
        pagination.pageNumber,
        PAGE_SIZE
      );

      if (response.data?.departments) {
        setDepartments(response.data.departments);

        // Update pagination info from API response
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      showNotification("Failed to fetch departments", "error");
    } finally {
      setLoading(false);
    }
  }, [organizationId, centerId, pagination.pageNumber, showNotification]);

  // Load departments on mount and when page changes
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Handlers - Add Department
  const handleAdd = useCallback(() => {
    setEditing(null);
    setIsModalOpen(true);
  }, []);

  // Handlers - Save Department
  const handleSave = useCallback(
    async ({ name, status }: { name: string; status: string }) => {
      if (!name.trim()) {
        showNotification("Department name is required", "warning");
        return;
      }

      setSaving(true);
      try {
        if (editing) {
          // Update existing department
          await apis.UpdateDepartment(editing.id, { name, status });
          showNotification("Department updated successfully", "success");
        } else {
          // Add new department
          await apis.CreateDepartment({
            organization_id: organizationId,
            center_id: centerId,
            name,
            status,
          });
          showNotification("Department added successfully", "success");
        }

        // Refresh the list
        await fetchDepartments();
        setIsModalOpen(false);
        setEditing(null);
      } catch (error) {
        console.error("Save error:", error);
        showNotification("Failed to save department", "error");
      } finally {
        setSaving(false);
      }
    },
    [editing, organizationId, centerId, showNotification, fetchDepartments]
  );

  // Handlers - Edit Department
  const handleEdit = useCallback((department: Department) => {
    setEditing(department);
    setIsModalOpen(true);
  }, []);

  // Handlers - Delete Department
  const handleDelete = useCallback((department: Department) => {
    setToDelete(department);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!toDelete) return;

    setIsDeleting(true);
    try {
      await apis.DeleteDepartment(toDelete.id);
      showNotification("Department deleted successfully", "success");

      // Refresh the list
      await fetchDepartments();

      setIsDeleteModalOpen(false);
      setToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      showNotification("Failed to delete department", "error");
    } finally {
      setIsDeleting(false);
    }
  }, [toDelete, showNotification, fetchDepartments]);

  // Handlers - Modal Close
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditing(null);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setToDelete(null);
  }, []);

  // Pagination Handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPagination((prev) => ({
      ...prev,
      pageNumber: newPage,
    }));
  }, []);

  const goToPreviousPage = useCallback(() => {
    if (pagination.pageNumber > 1) {
      handlePageChange(pagination.pageNumber - 1);
    }
  }, [pagination.pageNumber, handlePageChange]);

  const goToNextPage = useCallback(() => {
    if (pagination.pageNumber < pagination.totalPages) {
      handlePageChange(pagination.pageNumber + 1);
    }
  }, [pagination.pageNumber, pagination.totalPages, handlePageChange]);

  // Calculate display indices
  const startIndex = (pagination.pageNumber - 1) * pagination.pageSize + 1;
  const endIndex = Math.min(
    pagination.pageNumber * pagination.pageSize,
    pagination.totalRecords
  );

  // Filter departments by search query (client-side filtering)
  const filteredDepartments = searchQuery
    ? departments.filter((dept) =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : departments;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4 items-center flex-1">
          <h2 className="text-lg font-semibold text-gray-800">
            Test Departments
          </h2>
          <div className="w-64">
            <TextInput
              placeholder="Search departments"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search departments"
            />
          </div>
        </div>
        {/* <Button onClick={handleAdd} variant="filled" color="blue">
          + Add new
        </Button> */}
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto border rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader size="md" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                  #
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                  Slug
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    {searchQuery
                      ? "No departments found matching your search"
                      : "No departments yet. Click 'Add new' to create one."}
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept, index) => (
                  <tr
                    key={dept.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="border-b px-4 py-3 text-gray-600">
                      {startIndex + index}
                    </td>
                    <td className="border-b px-4 py-3 font-medium text-gray-900">
                      {dept.name}
                    </td>
                    <td className="border-b px-4 py-3 text-gray-600">
                      {dept.slug}
                    </td>
                    <td className="border-b px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          dept.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {dept.status}
                      </span>
                    </td>
                    <td className="border-b px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          onClick={() => handleEdit(dept)}
                          aria-label={`Edit ${dept.name}`}
                        >
                          <IconPencil size={16} />
                        </button>

                        <Popover position="bottom-end" withArrow shadow="md">
                          <Popover.Target>
                            <button
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                              aria-label={`More options for ${dept.name}`}
                            >
                              <IconDots size={16} className="rotate-90" />
                            </button>
                          </Popover.Target>
                          <Popover.Dropdown>
                            <Button
                              variant="subtle"
                              color="red"
                              size="xs"
                              fullWidth
                              onClick={() => handleDelete(dept)}
                            >
                              Delete
                            </Button>
                          </Popover.Dropdown>
                        </Popover>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Section */}
      {!loading && pagination.totalRecords > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="text-gray-600">
            Showing {startIndex} to {endIndex} of {pagination.totalRecords}{" "}
            entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousPage}
              disabled={pagination.pageNumber === 1}
              className="px-3 py-1.5 border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((pageNum) => {
                const isCurrent = pagination.pageNumber === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded transition-colors ${
                      isCurrent
                        ? "bg-blue-600 text-white font-medium"
                        : "border text-gray-600 hover:bg-gray-50"
                    }`}
                    aria-current={isCurrent ? "page" : undefined}
                    aria-label={`Page ${pageNum}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={goToNextPage}
              disabled={pagination.pageNumber >= pagination.totalPages}
              className="px-3 py-1.5 border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <NameStatusModal
        opened={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initialName={editing?.name}
        initialStatus={editing?.status}
        saving={saving}
        title={editing ? "Edit Department" : "Add Department"}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirm
        opened={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDelete}
        itemName={toDelete?.name}
        loading={isDeleting}
      />
    </div>
  );
};

export default TestDepartment;
