import React from "react";
import { Modal } from "@mantine/core";

interface Props {
  opened: boolean;
  onClose: () => void;
  onSelect: (type: "single" | "multiple" | "nested" | "document") => void;
}

const Item: React.FC<{
  idx: number;
  title: string;
  subtitle?: string;
  onClick: () => void;
}> = ({ idx, title, subtitle, onClick }) => {
  return (
    <div
      role="button"
      onClick={onClick}
      className="cursor-pointer px-6 py-4 hover:bg-gray-50 border-b border-gray-100"
    >
      <div className="flex items-start gap-4">
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
          {idx}
        </div>
        <div>
          <div className="font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{subtitle}</div>
        </div>
      </div>
    </div>
  );
};

const AddTestTypeModal: React.FC<Props> = ({ opened, onClose, onSelect }) => {
  const handleClick = (type: "single" | "multiple" | "nested" | "document") => {
    onSelect(type);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add test manually"
      centered
      size="lg"
    >
      <div className="space-y-0">
        <Item
          idx={1}
          title="Single parameter"
          subtitle="Eg. HB, TLC"
          onClick={() => handleClick("single")}
        />

        <Item
          idx={2}
          title="Multiple parameters"
          subtitle="Eg. DLC, Blood group"
          onClick={() => handleClick("multiple")}
        />

        <Item
          idx={3}
          title="Multiple nested parameters"
          subtitle="Eg. Urine routine, Semen Examination"
          onClick={() => handleClick("nested")}
        />

        <Item
          idx={4}
          title="Document"
          subtitle="Eg. FNAC, histo-pathology reports, culture and sensitivity reports"
          onClick={() => handleClick("document")}
        />

        <div className="px-6 py-4 bg-gray-50 mt-2 rounded">
          <div className="text-sm text-gray-700">ProTip!</div>
          <div className="text-xs text-gray-500">
            You can also choose to create a similar test, by visiting the view
            test page and using "Create similar test" link.
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddTestTypeModal;
