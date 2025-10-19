"use client"

import { useEffect, useRef } from "react"

interface QRCodeGeneratorProps {
  value: string
  size?: number
  level?: "L" | "M" | "Q" | "H"
}

export function QRCodeGenerator({ value, size = 200, level = "M" }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Simple QR code generation using a pattern
    // In a real application, you would use a proper QR code library like 'qrcode'
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    // Set canvas size
    canvas.width = size
    canvas.height = size

    // Clear canvas
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, size, size)

    // Generate a simple pattern based on the value
    const moduleSize = size / 25 // 25x25 grid
    ctx.fillStyle = "black"

    // Create a deterministic pattern based on the value
    const hash = value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)

    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        // Create finder patterns (corners)
        if (
          (row < 7 && col < 7) || // Top-left
          (row < 7 && col >= 18) || // Top-right
          (row >= 18 && col < 7) // Bottom-left
        ) {
          if (row === 0 || row === 6 || col === 0 || col === 6 || (row >= 2 && row <= 4 && col >= 2 && col <= 4)) {
            ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
          }
        } else {
          // Data pattern based on hash
          const shouldFill = (row * 25 + col + hash) % 3 === 0
          if (shouldFill) {
            ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
          }
        }
      }
    }
  }, [value, size])

  return <canvas ref={canvasRef} className="border border-gray-200 rounded" style={{ width: size, height: size }} />
}
