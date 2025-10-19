"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, X, AlertCircle } from 'lucide-react'

interface QRCodeScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

export function QRCodeScanner({ onScan, onClose }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState("")
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Decoder handles (no UI changes)
  const decoderRef = useRef<any>(null)
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setError("")
      setIsScanning(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      })

      streamRef.current = stream
      setHasPermission(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // QR decoding (keeps original UX)
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser")
        const reader = new BrowserMultiFormatReader()
        decoderRef.current = reader

        const promiseOrControls = reader.decodeFromVideoElement(
          videoRef.current!,
          (result: any) => {
            if (result) {
              const text =
                typeof (result as any) === "string"
                  ? (result as any as string)
                  : ((result as any)?.getText ? (result as any).getText() : "")

              // Stop decoder/camera then report
              stopCamera()
              if (text) onScan(text)
            }
            // ignore transient errors in callback
          }
        )

        // Handle both return shapes: IScannerControls or Promise<IScannerControls>
        if (typeof (promiseOrControls as any)?.then === "function") {
          controlsRef.current = await (promiseOrControls as Promise<any>)
        } else {
          controlsRef.current = promiseOrControls
        }
      } catch (e: any) {
        setError(e?.message || "Unable to start QR decoder.")
      }

    } catch {
      setError("Unable to access camera. Please check permissions.")
      setHasPermission(false)
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    // Stop ZXing controls first (handles both shapes)
    try { controlsRef.current?.stop?.() } catch {}
    controlsRef.current = null
    try { decoderRef.current?.reset?.() } catch {}
    decoderRef.current = null

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const handleManualInput = () => {
    const manualData = prompt("Enter QR code data manually:")
    if (manualData) onScan(manualData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>QR Code Scanner</span>
              </CardTitle>
              <CardDescription>Scan the QR code on the document</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {!isScanning && hasPermission !== false && (
            <div className="text-center space-y-4">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                <Camera className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">
                Position the QR code within the camera frame to scan
              </p>
              <Button onClick={startCamera} className="w-full">
                Start Camera
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-black rounded-lg object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white rounded-lg"></div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Scanning for QR code...</p>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={stopCamera} className="flex-1">
                    Stop Scanning
                  </Button>
                </div>
              </div>
            </div>
          )}

          {hasPermission === false && (
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Camera Access Denied</h3>
                <p className="text-sm text-red-800 mb-4">
                  Please allow camera access to scan QR codes, or enter the code manually.
                </p>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <Button variant="outline" onClick={handleManualInput} className="w-full">
              Enter Code Manually
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
