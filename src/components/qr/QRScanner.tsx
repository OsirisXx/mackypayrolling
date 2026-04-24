import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Camera, CameraOff } from 'lucide-react';
import { shouldFireOnScan } from '../../lib/attendanceHelpers';

interface QRScannerProps {
  onScan: (result: string) => void;
  isProcessing?: boolean;
  autoStart?: boolean;
  debounceMs?: number;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, isProcessing, autoStart = false, debounceMs = 3000 }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cleanupFnRef = useRef<(() => void) | null>(null);
  const lastDecodeRef = useRef<{ value: string; time: number } | null>(null);

  // Store cleanup function in ref so it can be called from unmount effect
  cleanupFnRef.current = () => {
    // 1. Stop ZXing scanner controls
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch (e) {
        // ignore
      }
      controlsRef.current = null;
    }

    // 2. Stop the MediaStream tracks directly (this is what turns off the camera light)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    // 3. Clear video element srcObject as fallback
    if (videoRef.current) {
      if (videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      videoRef.current.pause();
    }

    setIsScanning(false);
  };

  const cleanupCamera = useCallback(() => {
    if (cleanupFnRef.current) {
      cleanupFnRef.current();
    }
  }, []);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Get the camera stream ourselves so we have a direct reference
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playError: any) {
          if (playError.name !== 'AbortError') {
            throw playError;
          }
        }
      }

      // Use ZXing to decode from the already-playing video element
      const reader = new BrowserMultiFormatReader();
      const controls = reader.decodeFromStream(
        stream,
        videoRef.current!,
        (result) => {
          if (result) {
            const current = { value: result.getText(), time: Date.now() };
            if (shouldFireOnScan(current, lastDecodeRef.current, debounceMs, isProcessing ?? false)) {
              lastDecodeRef.current = current;
              onScan(current.value);
            }
          }
        }
      );

      controlsRef.current = await controls;
    } catch (err: any) {
      setError(err.message || 'Failed to start camera');
      setIsScanning(false);
      // Clean up on error too
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [isProcessing, onScan, debounceMs]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart) {
      startScanning();
    }
  }, [autoStart, startScanning]);

  // Listen for page visibility changes and stop camera when page is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isScanning) {
        cleanupCamera();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isScanning, cleanupCamera]);

  // Cleanup effect - runs on unmount - uses ref to access latest cleanup function
  useEffect(() => {
    return () => {
      if (cleanupFnRef.current) {
        cleanupFnRef.current();
      }
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">QR Code Scanner</h2>
          <Button
            variant={isScanning ? 'danger' : 'primary'}
            onClick={isScanning ? cleanupCamera : startScanning}
            disabled={isProcessing}
          >
            {isScanning ? (
              <>
                <CameraOff className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Start Scanning
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ display: isScanning ? 'block' : 'none' }}
            playsInline
            muted
          />
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Click "Start Scanning" to begin</p>
              </div>
            </div>
          )}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
        )}
      </CardContent>
    </Card>
  );
};
