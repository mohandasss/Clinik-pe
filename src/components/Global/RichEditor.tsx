import React, { useRef, useState, useMemo, useCallback } from "react";
import JoditEditor from "jodit-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const RichEditor: React.FC<Props> = ({ value, onChange }) => {
  const editor = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "",
      height: 350,
      uploader: {
        insertImageAsBase64URI: true,
      },
      buttons: [
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "font",
        "fontsize",
        "brush",
        "|",
        "image",
        "link",
        "|",
        "align",
        "undo",
        "redo",
      ],
    }),
    []
  );

  const handleBlur = useCallback(
    (newContent: string) => {
      onChange(newContent);
    },
    [onChange]
  );

  return (
    <JoditEditor
      ref={editor}
      value={value}
      config={config}
      onBlur={handleBlur}
      onChange={() => {}}
    />
  );
};

export default RichEditor;
