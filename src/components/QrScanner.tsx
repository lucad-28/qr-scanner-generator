"use client";

import { useState, useEffect } from "react";
import { CameraDevice, Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Copy, ExternalLink, X } from "lucide-react";

export function QrScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string>();
  const [error, setError] = useState("");
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<CameraDevice>();
  const [openCamSelector, setOpenCamSelector] = useState(false);

  useEffect(() => {
    // Initialize the scanner
    const qrCodeScanner = new Html5Qrcode("qr-reader");
    setHtml5QrCode(qrCodeScanner);

    // Cleanup on unmount
    return () => {
      if (qrCodeScanner.isScanning) {
        qrCodeScanner
          .stop()
          .catch((error) => console.error("Error stopping scanner:", error));
      }
    };
  }, []);

  const startScanner = async (_cameraSelected?: CameraDevice) => {
    setError("");
    setResult(undefined);
    setScanning(true);

    try {
      if (!html5QrCode) {
        console.error("QR code scanner not initialized");
        throw new Error("QR code scanner not initialized");
      }
      const _cameras = await Html5Qrcode.getCameras();

      console.log("Selecting camera:", _cameras);

      if (!_cameraSelected) {
        if (_cameras.length > 0) {
          _cameraSelected = _cameras[0];
        }
      }

      setCameras(_cameras);
      setSelectedCamera(_cameraSelected);

      await html5QrCode.start(
        _cameraSelected !== undefined
          ? { deviceId: { exact: _cameraSelected.id } }
          : { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Success callback
          setResult(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          // Error callback - we don't need to show these to the user
          console.log(errorMessage);
        }
      );
    } catch (err) {
      setScanning(false);
      setError(
        "Camera access denied or not available. Please check your camera permissions."
      );
      console.error("Error starting scanner:", err);
    }
  };

  const stopScanner = async () => {
    if (html5QrCode && html5QrCode.isScanning) {
      try {
        await html5QrCode.stop();
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
    setScanning(false);
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard
      .writeText(result)
      .then(() => {
        alert("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-lg">
        <div
          id="qr-reader"
          className="w-full max-w-md mx-auto overflow-hidden rounded-lg"
          style={{ height: scanning ? "300px" : "0" }}
        ></div>
        {scanning && (
          <div className="absolute top-0 left-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Button
              onClick={() => setOpenCamSelector(!openCamSelector)}
              variant="outline"
            >
              {selectedCamera ? selectedCamera.label : "Select Camera"}
            </Button>
          </div>
        )}
        {openCamSelector && (
          <div className="absolute top-0 left-0 bg-white p-2 rounded-lg">
            {cameras.map((camera) => (
              <Button
                key={camera.id}
                onClick={async () => {
                  if (!html5QrCode) return;
                  setSelectedCamera(camera);
                  setOpenCamSelector(false);
                  await stopScanner();
                  await startScanner(camera);
                }}
                variant="outline"
                className="w-full"
              >
                {camera.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {!scanning && !result && (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
          <Camera className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground mb-4">
            Click the button below to start scanning a QR code with your camera
          </p>
          <Button
            onClick={async () => {
              await startScanner();
            }}
          >
            Start Scanner
          </Button>
        </div>
      )}

      {scanning && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={stopScanner}>
            <X className="mr-2 h-4 w-4" />
            Cancel Scanning
          </Button>
        </div>
      )}

      {result && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg break-all">
                <p className="font-mono">{result}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>

                {isValidUrl(result) && (
                  <Button asChild className="flex-1">
                    <a href={result} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open URL
                    </a>
                  </Button>
                )}

                <Button
                  onClick={() => {
                    startScanner();
                  }}
                  className="flex-1"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Scan Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
