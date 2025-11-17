import React from "react";
import { Modal, Button, Text } from "@mantine/core";

interface Props {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  loading?: boolean;
}

const DeleteConfirm: React.FC<Props> = ({
  opened,
  onClose,
  onConfirm,
  itemName,
  loading,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Delete ${itemName || "item"}`}
      centered
    >
      <Text size="sm" mb="lg">
        Are you sure you want to delete "{itemName}"? This action cannot be
        undone.
      </Text>
      <div className="flex gap-3 justify-end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="red"
          loading={loading}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Delete
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteConfirm;
