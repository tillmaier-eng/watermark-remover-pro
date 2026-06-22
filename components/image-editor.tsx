"use client";

import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    cv: any;
    onOpenCvReady: () => void;
  }
}

interface ImageEditorProps {
  uploadId: string;
  imageUrl: string;
  onComplete: (creditsRemaining: number) => void;
}

type Mode = "auto" | "manual";

export function ImageEditor({ uploadId, imageUrl, onComplete }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [cvReady, setCvReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState(false);
  const [processedDataUrl, setProcessedDataUrl] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [loadingStep, setLoadingStep] = useState("");
  const [mode, setMode] = useState<Mode>("auto");
  const [brushSize, setBrushSize] = useState(40);
  const [isDrawing, setIsDrawing] = useState(false);
  const [autoFailed, setAutoFailed] = useState(false);

  // Load OpenCV.js from local
  useEffect(() => {
    if (window.cv && window.cv.Mat) {
      setCvReady(true);
      return;
    }
        setLoadingStep("Loading AI engine...");
    const script = document.createElement("script");
    // Use preconnect for faster load
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "script";
    link.href = "/opencv/opencv.js";
    document.head.appendChild(link);

    script.src = "/opencv/opencv.js";
    script.async = true;
    script.defer = true;

    script.async = true;
    script.onload = () => {
      const checkReady = setInterval(() => {
        if (window.cv && window.cv.Mat) {
          setCvReady(true);
          setLoadingStep("");
          clearInterval(checkReady);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkReady);
        if (!window.cv || !window.cv.Mat) {
          setError("AI engine took too long to load. Please refresh.");
        }
      }, 30000);
    };
    script.onerror = () => setError("Failed to load AI engine. Please refresh.");
    document.body.appendChild(script);
    return () => {};
  }, []);

  // Load image into canvas
  useEffect(() => {
    if (!cvReady || !canvasRef.current || !imgRef.current) return;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    img.onload = () => {
      // Cap at 800px to avoid memory issues
      const maxDim = 800;
      let { naturalWidth: w, naturalHeight: h } = img;
      if (w > maxDim || h > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.floor(w * scale);
        h = Math.floor(h * scale);
      }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      // Init mask canvas same size
      if (maskCanvasRef.current) {
        maskCanvasRef.current.width = w;
        maskCanvasRef.current.height = h;
        const mctx = maskCanvasRef.current.getContext("2d");
        if (mctx) mctx.clearRect(0, 0, w, h);
      }
    };
    if (img.complete) img.onload?.(new Event("load"));
  }, [cvReady, imageUrl]);

  // Auto detect watermark with better filtering
  const runAutoDetect = useCallback(async (canvas: HTMLCanvasElement): Promise<string | null> => {
    const cv = window.cv;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const src = cv.matFromImageData(imageData);

    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Higher Canny threshold for fewer edges
    const edges = new cv.Mat();
    cv.Canny(gray, edges, 100, 200);

    // Larger kernel to merge nearby edges aggressively
    const kernel = cv.Mat.ones(5, 5, cv.CV_8U);
    const dilated = new cv.Mat();
    cv.dilate(edges, dilated, kernel);

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(dilated, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    // Collect large contours only (filter out noise)
    const totalPixels = canvas.width * canvas.height;
    const minArea = Math.max(500, totalPixels * 0.001); // 0.1% of image or 500px
    const maxContours = 30;
    const validContours: { idx: number; area: number }[] = [];

    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour);
      if (area >= minArea && area < totalPixels * 0.4) {
        validContours.push({ idx: i, area });
      }
      if (validContours.length >= maxContours * 3) break; // sample enough
    }

    // Sort by area desc, keep top N
    validContours.sort((a, b) => b.area - a.area);
    const topContours = validContours.slice(0, maxContours);

    // Build mask
    const mask = new cv.Mat.zeros(canvas.height, canvas.width, cv.CV_8UC1);
    for (const { idx } of topContours) {
      cv.drawContours(mask, contours, idx, new cv.Scalar(255), -1);
    }

    // Check if mask has meaningful coverage (at least 0.5% of image)
    const maskCoverage = cv.countNonZero(mask) / totalPixels;
    let resultUrl: string | null = null;

    if (maskCoverage > 0.005 && topContours.length > 0) {
      const inpainted = new cv.Mat();
      cv.inpaint(src, mask, inpainted, 3, cv.INPAINT_TELEA);
      const outImageData = new ImageData(
        new Uint8ClampedArray(inpainted.data),
        inpainted.cols,
        inpainted.rows
      );
      ctx.putImageData(outImageData, 0, 0);
      resultUrl = canvas.toDataURL("image/png");
      inpainted.delete();
    }

    src.delete(); gray.delete(); edges.delete(); kernel.delete();
    dilated.delete(); mask.delete(); contours.delete(); hierarchy.delete();

    return resultUrl;
  }, []);

  // Apply user-drawn mask via multi-pass texture sampling (no OpenCV needed)
  const runManualProcess = useCallback(async (canvas: HTMLCanvasElement, maskCanvas: HTMLCanvasElement): Promise<string | null> => {
    const ctx = canvas.getContext("2d")!;
    const maskCtx = maskCanvas.getContext("2d")!;

    // Check if mask has any drawing
    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    let hasDrawing = false;
    for (let i = 3; i < maskData.data.length; i += 4) {
      if (maskData.data[i] > 0) { hasDrawing = true; break; }
    }
    if (!hasDrawing) return null;

    // Get image data (working copy)
    const workData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const imgPixels = workData.data;
    const maskPixels = maskData.data;

    const w = canvas.width;
    const h = canvas.height;

    // Multi-pass fill: outer pixels first, then inner
    // This gives better texture continuity
    for (let pass = 0; pass < 3; pass++) {
      const newMask = new Uint8Array(maskPixels.length / 4);

      // Find remaining masked pixels
      for (let i = 0; i < maskPixels.length; i += 4) {
        if (maskPixels[i + 3] > 50) {
          const px = i / 4;
          const x = px % w;
          const y = Math.floor(px / w);

          // Sample wider radius for better texture
          const radius = 8 + pass * 4;
          let r = 0, g = 0, b = 0, count = 0;
          let totalWeight = 0;

          // Sample with Gaussian-like weighting (closer pixels weighted more)
          for (let dy = -radius; dy <= radius; dy += 3) {
            for (let dx = -radius; dx <= radius; dx += 3) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              const ny = y + dy;
              if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
              const nIdx = (ny * w + nx) * 4;
              // Skip if neighbor is still masked
              if (maskPixels[nIdx + 3] > 50) continue;

              // Distance-based weight
              const dist = Math.sqrt(dx * dx + dy * dy);
              const weight = 1 / (1 + dist * 0.3);

              r += imgPixels[nIdx] * weight;
              g += imgPixels[nIdx + 1] * weight;
              b += imgPixels[nIdx + 2] * weight;
              totalWeight += weight;
              count++;
            }
          }

          if (count > 0 && totalWeight > 0) {
            imgPixels[i] = Math.round(r / totalWeight);
            imgPixels[i + 1] = Math.round(g / totalWeight);
            imgPixels[i + 2] = Math.round(b / totalWeight);
            imgPixels[i + 3] = 255;
            newMask[px] = 0; // Filled
          } else {
            newMask[px] = 1; // Still needs fill
          }
        }
      }

      // Update mask for next pass
      for (let i = 0; i < maskPixels.length; i += 4) {
        maskPixels[i + 3] = newMask[i / 4] ? 200 : 0;
      }
    }

    ctx.putImageData(workData, 0, 0);
    return canvas.toDataURL("image/png");
  }, []);

  const handleProcess = useCallback(async () => {
    if (!cvReady || !canvasRef.current) return;
    setProcessing(true);
    setError(null);

    try {
      let resultUrl: string | null = null;

      if (mode === "auto") {
        // Run auto detection
        try {
          resultUrl = await runAutoDetect(canvasRef.current);
        } catch (e) {
          console.warn("Auto detection failed:", e);
          setAutoFailed(true);
          setError("Auto detection failed on this complex image. Try Manual mode below.");
          setProcessing(false);
          return;
        }

        if (!resultUrl) {
          setAutoFailed(true);
          setError("No watermark detected automatically. Use Manual mode to select the watermark area.");
          setProcessing(false);
          return;
        }
      } else {
        // Manual mode
        if (!maskCanvasRef.current) {
          setError("Mask canvas not ready");
          setProcessing(false);
          return;
        }
        resultUrl = await runManualProcess(canvasRef.current, maskCanvasRef.current);
        if (!resultUrl) {
          setError("Please draw on the watermark area first using the brush tool.");
          setProcessing(false);
          return;
        }
      }

      setProcessedDataUrl(resultUrl);
      setProcessed(true);
      setProcessing(false);

      // Deduct credit
      try {
        const res = await fetch("/api/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uploadId, processingTimeMs: 0 }),
        });
        const data = await res.json();
        if (data.creditsRemaining !== undefined) onComplete(data.creditsRemaining);
      } catch {}
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Processing failed: ${msg.slice(0, 100)}`);
      setProcessing(false);
    }
  }, [cvReady, mode, runAutoDetect, runManualProcess, uploadId, onComplete]);

  function downloadResult() {
    if (!processedDataUrl) return;
    const a = document.createElement("a");
    a.href = processedDataUrl;
    a.download = `clean-${Date.now()}.png`;
    a.click();
  }

  // Manual drawing handlers
  function getCanvasCoords(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null {
    const canvas = maskCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else return null;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    if (mode !== "manual" || processed) return;
    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    if (coords && maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext("2d")!;
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing || mode !== "manual" || processed) return;
    const coords = getCanvasCoords(e);
    if (coords && maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext("2d")!;
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function endDraw() {
    setIsDrawing(false);
  }

  function resetMask() {
    if (!maskCanvasRef.current) return;
    const ctx = maskCanvasRef.current.getContext("2d")!;
    ctx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
  }

  function handleSliderDrag(e: React.MouseEvent | React.TouchEvent) {
    const container = e.currentTarget as HTMLDivElement;
    const rect = container.getBoundingClientRect();
    const update = (clientX: number) => {
      const x = ((clientX - rect.left) / rect.width) * 100;
      setSliderPos(Math.max(0, Math.min(100, x)));
    };
    if ("touches" in e && e.touches.length > 0) update(e.touches[0].clientX);
    else if ("clientX" in e) update(e.clientX);
  }

  if (!cvReady) {
    return (
      <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-12 text-center">
        <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white font-medium">{loadingStep || "Loading AI engine..."}</p>
        <p className="text-xs text-zinc-500 mt-2">First load ~10s. Cached after.</p>
        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      {!processed && (
        <div className="flex gap-2 bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-1">
          <button
            onClick={() => setMode("auto")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
              mode === "auto"
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            🤖 Auto detect
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
              mode === "manual"
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            ✏️ Manual select {autoFailed && "← try this"}
          </button>
        </div>
      )}

      {/* Image / Canvas area */}
      <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-4">
        {processed && processedDataUrl ? (
          <div
            className="relative w-full overflow-hidden rounded-xl select-none cursor-ew-resize"
            onMouseMove={(e) => e.buttons === 1 && handleSliderDrag(e)}
            onClick={handleSliderDrag}
            onTouchMove={handleSliderDrag}
          >
            <img src={imageUrl} alt="Original" className="block w-full" draggable={false} />
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={processedDataUrl}
                alt="Processed"
                className="block w-full h-full"
                style={{ width: `${100 / (sliderPos / 100)}%`, maxWidth: "none" }}
                draggable={false}
              />
            </div>
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center">
                <span className="text-zinc-900 text-xs font-bold">⇆</span>
              </div>
            </div>
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 rounded text-xs text-white">Before</div>
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 rounded text-xs text-white">After</div>
          </div>
        ) : (
          <div className="relative inline-block w-full">
            <img ref={imgRef} src={imageUrl} alt="Uploaded" className="block w-full rounded-xl" crossOrigin="anonymous" />
            {mode === "manual" && (
              <canvas
                ref={maskCanvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Manual mode brush controls */}
      {mode === "manual" && !processed && (
        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm text-zinc-300 flex-shrink-0">Brush:</label>
            <input
              type="range"
              min="10"
              max="120"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-white w-12 text-right">{brushSize}px</span>
            <button
              onClick={resetMask}
              className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
            >
              Clear
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            💡 Paint over the watermark area. Use the brush to cover it completely.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!processed ? (
          <button
            onClick={handleProcess}
            disabled={processing}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white font-medium rounded-xl transition-all"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </span>
            ) : mode === "auto" ? (
              "✨ Remove watermark (1 credit)"
            ) : (
              "✨ Process selected area (1 credit)"
            )}
          </button>
        ) : (
          <>
            <button
              onClick={downloadResult}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-xl transition-all"
            >
              ⬇ Download clean image
            </button>
            <button
              onClick={() => {
                setProcessed(false);
                setProcessedDataUrl(null);
                resetMask();
              }}
              className="px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition"
            >
              Try again
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm text-amber-300">
          ⚠️ {error}
        </div>
      )}

      {processed && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-sm text-green-300">
          ✅ Done! Drag the slider to compare. Click download to save.
        </div>
      )}
    </div>
  );
}
