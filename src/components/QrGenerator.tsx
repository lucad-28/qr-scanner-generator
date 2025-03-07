"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Input } from "./ui/input";

export function QrGenerator() {
  const [text, setText] = useState("");

  const handleDownload = () => {
    const svg = document.querySelector("#qr-code svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = "qr-code.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Generate QR Code
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Enter text or URL to generate a QR code
        </p>
      </div>

      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Enter text or URL"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full"
        />

        <div className="flex justify-center">
          <div id="qr-code" className="flex justify-center">
            <QRCodeSVG
              value={text || "https://stackblitz.com"}
              size={200}
              level="H"
              includeMargin
              className="dark:bg-white rounded-lg"
            />
          </div>
        </div>

        <Button onClick={handleDownload} className="w-full" disabled={!text}>
          <Download className="w-4 h-4 mr-2" />
          Download QR Code
        </Button>
      </div>
    </div>
  );
}
