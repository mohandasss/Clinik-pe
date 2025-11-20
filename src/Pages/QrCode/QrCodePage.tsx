import React, { useState, useRef } from "react";
import { Button } from "@mantine/core";

const QrCodePage: React.FC = () => {
  // Mock center data (replace with backend data later)
  const mockCenter = {
    id: "center-123",
    name: "V-Xplore Clinic",
    address: "123 Main St, Cityville, Country",
    phone: "+1 (555) 123-4567",
    // Simple visual placeholder SVG as a data URL representing a QR code
    qrImage: (() => {
      const svg = `
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='600' height='600'>
          <rect width='300' height='300' fill='white'/>
          <rect x='10' y='10' width='70' height='70' fill='black' />
          <rect x='220' y='10' width='70' height='70' fill='black' />
          <rect x='10' y='220' width='70' height='70' fill='black' />
          <rect x='90' y='90' width='30' height='30' fill='black' />
          <rect x='140' y='90' width='40' height='40' fill='black' />
          <rect x='200' y='90' width='10' height='10' fill='black' />
          <rect x='90' y='140' width='20' height='20' fill='black' />
          <rect x='140' y='160' width='20' height='20' fill='black' />
          <rect x='190' y='140' width='20' height='20' fill='black' />
          <rect x='50' y='200' width='15' height='15' fill='black' />
        </svg>
      `;
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    })(),
  };

  const [isFullScreen, setIsFullScreen] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleShare = async () => {
    const shareText = `${mockCenter.name}\n${mockCenter.address}\n${mockCenter.phone}`;
    const shareUrl = `${window.location.origin}/centers/${mockCenter.id}`;
    type NavigatorShareable = {
      share?: (data?: {
        title?: string;
        text?: string;
        url?: string;
        files?: File[];
      }) => Promise<void>;
      canShare?: (data?: { files?: File[] }) => boolean;
      clipboard?: { writeText?: (text: string) => Promise<void> };
    };
    const nav = navigator as unknown as NavigatorShareable;

    if (nav.share) {
      try {
        // Try to attach the QR image as a file (works in supported browsers)
        try {
          const res = await fetch(mockCenter.qrImage);
          const blob = await res.blob();
          const file = new File([blob], `${mockCenter.name}-qr.png`, {
            type: blob.type || "image/png",
          });
          if (nav.canShare?.({ files: [file] })) {
            await nav.share?.({
              title: `Visit ${mockCenter.name}`,
              text: shareText,
              url: shareUrl,
              files: [file],
            });
            return;
          }
        } catch (e: unknown) {
          console.warn("Could not attach image to share:", e);
        }

        await nav.share?.({
          title: `Visit ${mockCenter.name}`,
          text: shareText,
          url: shareUrl,
        });
        // Optionally show a toast here
      } catch (e: unknown) {
        console.warn("Share canceled or failed", e);
      }
    } else if (nav.clipboard?.writeText) {
      // Fallback: copy the share text and url to clipboard
      try {
        await nav.clipboard!.writeText(`${shareText}\n${shareUrl}`);
        alert("Share text copied to clipboard");
      } catch (e: unknown) {
        console.warn("Failed to copy to clipboard.", e);
        alert(
          "Failed to copy to clipboard. Please manually share the details."
        );
      }
    } else {
      alert(
        "Sharing not supported on this device. Please manually copy the details."
      );
    }
  };

  const handleDownload = () => {
    // Trigger a download of the QR image
    const link = document.createElement("a");
    link.href = mockCenter.qrImage;
    link.download = `${mockCenter.name}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-8xl mx-auto py-2 px-1">
      {/* Center mock details */}
      <div className="bg-white rounded-lg shadow px-6 py-4 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{mockCenter.name}</h2>
          <p className="text-sm text-gray-600">{mockCenter.address}</p>
          <p className="text-sm text-gray-600">{mockCenter.phone}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleShare} variant="outline">
            Share
          </Button>
          <Button onClick={handleDownload}>Download</Button>
        </div>
      </div>

      {/* QR image area */}
      <div className="flex flex-col items-center justify-center">
        <div className="w-full flex justify-center">
          <img
            ref={imgRef}
            src={mockCenter.qrImage}
            alt="QR Code"
            className="max-w-full h-auto cursor-pointer shadow-lg rounded-lg"
            style={{
              width: isFullScreen ? "90vw" : 320,
              height: isFullScreen ? "90vh" : 320,
            }}
            onClick={() => setIsFullScreen((s) => !s)}
          />
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Click QR to toggle full screen
        </p>
      </div>

      {/* Fullscreen overlay (also supports image download & share buttons) */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative">
            <img
              src={mockCenter.qrImage}
              alt="Full-screen QR"
              className="rounded-md shadow-lg"
              style={{ width: "90vw", height: "90vh", objectFit: "contain" }}
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button size="sm" variant="outline" onClick={handleShare}>
                Share
              </Button>
              <Button size="sm" onClick={handleDownload}>
                Download
              </Button>
              <Button
                size="sm"
                color="red"
                onClick={() => setIsFullScreen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QrCodePage;
