import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Button, Popover, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import apis from "../../../APis/Api";
import useAuthStore from "../../../GlobalStore/store";
import type { TestCategory, TestCategoryPagination } from "../../../APis/Types";
import { IconDots, IconPencil } from "@tabler/icons-react";
import DeleteConfirm from "../../TestPackages/Components/DeleteConfirm";
import CategoryModal from "../../TestCategories/Components/CategoryModal";
import { useParams } from "react-router-dom";

const DEFAULT_PAGE_SIZE = 5;

interface RowProps {
  category: TestCategory;
  index: number;
  onEdit: (category: TestCategory) => void;
  onDelete: (category: TestCategory) => void;
}

const Row: React.FC<RowProps> = ({ category, index, onEdit, onDelete }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="border-b border-gray-200 px-4 py-3">
        <span className="text-sm text-gray-600">{index + 1}.</span>
      </td>

      <td className="border-b border-gray-200 px-4 py-3">
        <div className="font-medium text-gray-900">{category.name}</div>
      </td>

      <td className="border-b border-gray-200 px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
            onClick={() => onEdit(category)}
            aria-label="Edit category"
          >
            <IconPencil size={16} />
          </button>

          <Popover position="bottom" withArrow shadow="md">
            <Popover.Target>
              <button
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="More options"
              >
                <IconDots className="rotate-90" />
              </button>
            </Popover.Target>
            <Popover.Dropdown>
              <div className="flex flex-col gap-2 min-w-max">
                <Button
                  variant="subtle"
                  color="red"
                  size="xs"
                  onClick={() => onDelete(category)}
                >
                  Remove
                </Button>
              </div>
            </Popover.Dropdown>
          </Popover>
        </div>
      </td>
    </tr>
  );
};

const OtherTestCategory: React.FC = () => {
  const { department } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [pagination, setPagination] = useState<TestCategoryPagination | null>(
    null
  );

  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const [categoryToDelete, setCategoryToDelete] = useState<TestCategory | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [categoryToEdit, setCategoryToEdit] = useState<TestCategory | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const totalCategories = pagination?.totalRecords || 0;
  const totalPages = Math.max(
    1,
    Math.ceil(totalCategories / DEFAULT_PAGE_SIZE)
  );

  const displayCategories = useMemo(() => {
    if (!searchQuery) return categories;

    const normalizedQuery = searchQuery.toLowerCase();
    return categories.filter((category) =>
      category.name.toLowerCase().includes(normalizedQuery)
    );
  }, [searchQuery, categories]);

  const showNotification = useCallback(
    (message: string, type: "success" | "error" | "warning") => {
      const colorMap = {
        success: "blue",
        error: "red",
        warning: "yellow",
      } as const;
      notifications.show({ title: message, message, color: colorMap[type] });
    },
    []
  );

  const showSuccessNotification = useCallback(
    (message: string) => showNotification(message, "success"),
    [showNotification]
  );
  const showErrorNotification = useCallback(
    (message: string) => showNotification(message, "error"),
    [showNotification]
  );
  const showWarningNotification = useCallback(
    (message: string) => showNotification(message, "warning"),
    [showNotification]
  );

  const organizationId = useAuthStore(
    (s) => s.organizationDetails?.organization_id ?? ""
  );
  const centerId = useAuthStore((s) => s.organizationDetails?.center_id ?? "");

  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const response = await apis.GetOtherTestCategories(
        department,
        organizationId,
        centerId,
        currentPage,
        DEFAULT_PAGE_SIZE,
        searchQuery || undefined
      );
      if (response.success) {
        setCategories(response.data.categorys);
        setPagination(response.data.pagination);
      } else {
        showErrorNotification(response.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      showErrorNotification("Failed to fetch categories");
    } finally {
      setIsLoadingCategories(false);
    }
  }, [
    currentPage,
    searchQuery,
    showErrorNotification,
    organizationId,
    centerId,
  ]);

  const deleteCategory = async (categoryId: string) => {
    setIsDeleting(true);
    try {
      const response = await apis.DeleteTestCategory(
        organizationId,
        centerId,
        categoryId
      );
      if (response.success) {
        showSuccessNotification(response.message || "Category deleted");
        await loadCategories();
      } else {
        showWarningNotification(response.message || "Category deleted locally");
        removeCategoryLocally(categoryId);
      }
      closeDeleteModal();
    } catch (error) {
      console.error("Failed to delete category:", error);
      showWarningNotification("Category removed locally");
      removeCategoryLocally(categoryId);
      closeDeleteModal();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddCategory = async (name: string) => {
    if (!name || !name.trim()) {
      showErrorNotification("Category name is required");
      return;
    }
    setIsSaving(true);
    try {
      const response = categoryToEdit
        ? await apis.UpdateTestCategory(
            organizationId,
            centerId,
            categoryToEdit.uid,
            { name }
          )
        : await apis.AddTestCategory(organizationId, centerId, { name });

      if (response?.success) {
        showSuccessNotification(response.message);
        await loadCategories();
        closeEditModal();
      } else {
        showErrorNotification(response?.message || "Failed to save category");
      }
    } catch (error) {
      console.error("Failed to save category:", error);
      showErrorNotification("Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCategory = (category: TestCategory) => {
    setCategoryToEdit(category);
    setIsEditModalOpen(true);
  };

  const handleDeleteCategory = (category: TestCategory) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleAddNewCategory = () => {
    setCategoryToEdit(null);
    setIsEditModalOpen(true);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const removeCategoryLocally = (categoryId: string) => {
    setCategories((prevCategories) =>
      prevCategories.filter((cat) => cat.id !== categoryId)
    );
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCategoryToEdit(null);
  };

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const renderPaginationInfo = () => {
    const startIndex = (currentPage - 1) * DEFAULT_PAGE_SIZE + 1;
    const endIndex = Math.min(currentPage * DEFAULT_PAGE_SIZE, totalCategories);
    return (
      <div className="text-sm text-gray-500">
        Showing {startIndex} to {endIndex} of {totalCategories} entries
      </div>
    );
  };

  const renderPageButton = (pageNumber: number) => {
    const isCurrentPage = currentPage === pageNumber;
    const buttonClass = isCurrentPage
      ? "bg-blue-600 text-white"
      : "border text-gray-600 hover:bg-gray-50";
    return (
      <button
        key={pageNumber}
        onClick={() => handlePageChange(pageNumber)}
        className={`w-8 h-8 rounded transition-colors ${buttonClass}`}
        aria-label={`Go to page ${pageNumber}`}
        aria-current={isCurrentPage ? "page" : undefined}
      >
        {pageNumber}
      </button>
    );
  };

  const renderPaginationButtons = () => {
    return Array.from({ length: totalPages }, (_, i) => i + 1).map(
      renderPageButton
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 ring-1 ring-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 items-center flex-1">
          <h2 className="text-lg font-semibold text-gray-800">
            Other Test categories
          </h2>
          <div className="w-64">
            <TextInput
              placeholder="Search in page"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search categories"
            />
          </div>
        </div>
        <Button
          onClick={handleAddNewCategory}
          variant="filled"
          color="blue"
          disabled={isLoadingCategories}
        >
          + Add new
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                S.No
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Name
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {displayCategories.map((category, index) => (
              <Row
                key={category.id}
                category={category}
                index={index}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            ))}
          </tbody>
        </table>
      </div>

      <CategoryModal
        opened={isEditModalOpen}
        onClose={closeEditModal}
        onSave={handleAddCategory}
        initialName={categoryToEdit?.name}
        saving={isSaving}
        title={categoryToEdit ? "Edit Category" : "Add Category"}
      />

      <DeleteConfirm
        opened={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() =>
          categoryToDelete && deleteCategory(categoryToDelete.uid)
        }
        itemName={categoryToDelete?.name}
        loading={isDeleting}
      />

      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
        {renderPaginationInfo()}
        <div className="inline-flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            Previous
          </button>
          <div className="inline-flex items-center gap-1">
            {renderPaginationButtons()}
          </div>
          <button
            className="px-3 py-1 border rounded text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtherTestCategory;
