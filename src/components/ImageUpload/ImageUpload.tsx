import React, { useRef } from "react";
import { IconCamera, IconPlus } from "@tabler/icons-react";
import apis from "../../APis/Api";

interface ImageUploadProps {
  photo: File | null;
  onPhotoChange: (file: File | null) => void;
  onUploadPathChange?: (path: string) => void;
  title?: string;
  description?: string;
  subtitle?: string;
  accept?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  photo,
  onPhotoChange,
  onUploadPathChange,
  title = "Photo",
  description = "Upload a professional headshot",
  subtitle = "JPG, PNG up to 5MB",
  accept = "image/png, image/jpeg",
}) => {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      onPhotoChange(file);
      // Reset the input value to allow selecting the same file again
      e.target.value = "";

      // Call the image upload API
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await apis.ImageUpload(formData);
        console.log("Image upload response:", response.data.uploadPath);
        onUploadPathChange?.(response.data.uploadPath);
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileRef.current?.click();
  };

  return (
    <div className="mb-8">
      <div className="flex items-start gap-6">
        {/* === Image Circle === */}
        <div className="relative w-24 h-24 flex-shrink-0 cursor-pointer">
          <button
            type="button"
            onClick={handleClick}
            className="relative w-24 h-24 cursor-pointer border-0 bg-transparent p-0 hover:opacity-80 transition-opacity"
          >
            <div className="w-full h-full rounded-full border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
              {photo ? (
                <img
                  src={URL.createObjectURL(photo)}
                  className="w-full h-full rounded-full object-cover"
                  alt="Uploaded"
                />
              ) : (
                <IconCamera size={28} className="text-gray-400" />
              )}
            </div>
          </button>

          {/* === PLUS BUTTON === */}
          <button
            type="button"
            onClick={handleClick}
            className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white w-7 h-7 rounded-full flex items-center justify-center shadow transition-colors"
          >
            <IconPlus size={16} />
          </button>
        </div>

        {/* Hidden input */}
        <input
          type="file"
          className="hidden"
          ref={fileRef}
          accept={accept}
          onChange={handleFile}
        />

        {/* === TEXT SECTION === */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">
            {description} <br />
            <span className="text-xs text-gray-400">{subtitle}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
