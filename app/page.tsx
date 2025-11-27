"use client";

import "./globals.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type RecorderState = "idle" | "recording" | "processing" | "done" | "error";

function drawCarpenter(
  ctx: CanvasRenderingContext2D,
  t: number,
  canvasW: number,
  canvasH: number
) {
  ctx.clearRect(0, 0, canvasW, canvasH);

  // Background ground plane
  ctx.save();
  const horizonY = canvasH * 0.65;
  const grad = ctx.createLinearGradient(0, 0, 0, canvasH);
  grad.addColorStop(0, "#0f172a");
  grad.addColorStop(1, "#0b1220");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Ground line
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(canvasW, horizonY);
  ctx.stroke();
  ctx.restore();

  // Walk cycle parameters
  const speed = 120; // pixels per second
  const cycle = Math.sin(t * 2 * Math.PI); // -1..1
  const step = Math.sin(t * 4 * Math.PI); // faster for legs
  const bob = Math.sin(t * 2 * Math.PI) * 4; // vertical bob

  // Carpenter position
  const startX = -200;
  const endX = canvasW + 200;
  const x = startX + (endX - startX) * (t % 1); // loops every 1s of t domain
  const scale = 1.2;
  const yBase = horizonY - 10;

  ctx.save();
  ctx.translate(x, yBase + bob);
  ctx.scale(scale, scale);

  // Shadow
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 16, 40, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Helper to draw rounded rect
  const roundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: string
  ) => {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };

  // Colors
  const skin = "#f2c197";
  const shirt = "#2563eb";
  const pants = "#1f2937";
  const belt = "#8b5a2b";
  const toolMetal = "#cbd5e1";
  const boot = "#7c3f00";
  const wood = "#c0823e";
  const woodDark = "#8a5628";
  const safetyYellow = "#f6ad55";

  // Upper body group slight tilt
  ctx.save();
  ctx.translate(-5, -20);
  ctx.rotate(-0.05 + Math.sin(t * 2 * Math.PI) * 0.02);

  // Wood plank on shoulder
  ctx.save();
  const sway = Math.sin(t * 2 * Math.PI) * 2;
  ctx.translate(0, -40 + sway);
  ctx.rotate(-0.15);
  roundRect(-90, -8, 220, 16, 4, wood);
  // wood texture lines
  ctx.strokeStyle = woodDark;
  ctx.lineWidth = 1;
  for (let i = -80; i <= 110; i += 24) {
    ctx.beginPath();
    ctx.moveTo(i, -5);
    ctx.lineTo(i + 14, 5);
    ctx.stroke();
  }
  // cut end
  ctx.fillStyle = woodDark;
  ctx.fillRect(120, -8, 6, 16);
  ctx.restore();

  // Torso
  roundRect(-15, -30, 30, 36, 6, shirt);

  // Head
  ctx.save();
  ctx.translate(0, -42);
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(0, 0, 9.5, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hard hat
  ctx.fillStyle = safetyYellow;
  ctx.beginPath();
  ctx.ellipse(0, -6, 12, 7, 0, Math.PI, 0, true);
  ctx.fill();
  roundRect(-12, -7, 24, 6, 3, safetyYellow);
  ctx.restore();

  // Left arm holding plank (rear)
  ctx.save();
  ctx.translate(-12, -16);
  ctx.rotate(-0.7 + Math.sin(t * 2 * Math.PI + 0.6) * 0.05);
  roundRect(-4, 0, 8, 18, 4, shirt);
  // hand
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(0, 18, 4.5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right arm swinging (front)
  ctx.save();
  ctx.translate(12, -16);
  ctx.rotate(0.6 * Math.sin(t * 4 * Math.PI));
  roundRect(-4, 0, 8, 18, 4, shirt);
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(0, 18, 4.5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Tool belt
  roundRect(-18, 2, 36, 6, 3, belt);
  // Pouches
  roundRect(-22, 8, 12, 12, 3, belt);
  roundRect(10, 8, 12, 12, 3, belt);
  // Tools: hammer and screwdriver
  // Hammer
  ctx.save();
  ctx.translate(-16, 9);
  // handle
  roundRect(-2, 0, 4, 12, 2, "#a16207");
  // head
  roundRect(-6, -2, 12, 5, 2, toolMetal);
  ctx.restore();
  // Screwdriver
  ctx.save();
  ctx.translate(16, 9);
  roundRect(-1.5, -2, 3, 10, 1.5, toolMetal);
  roundRect(-3.5, 6, 7, 5, 2, "#ea580c");
  ctx.restore();

  // Legs
  // Rear leg
  ctx.save();
  ctx.translate(-6, 12);
  ctx.rotate(0.6 * Math.sin(t * 4 * Math.PI + Math.PI));
  roundRect(-3.5, 0, 7, 18, 3, pants);
  // rear boot
  roundRect(-6, 16, 12, 6, 2, boot);
  ctx.restore();
  // Front leg
  ctx.save();
  ctx.translate(6, 12);
  ctx.rotate(0.6 * Math.sin(t * 4 * Math.PI));
  roundRect(-3.5, 0, 7, 18, 3, pants);
  // front boot
  roundRect(-6, 16, 12, 6, 2, boot);
  ctx.restore();

  ctx.restore(); // upper body group
  ctx.restore();
}

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [width, setWidth] = useState(960);
  const [height, setHeight] = useState(540);
  const [duration, setDuration] = useState(8); // seconds
  const [state, setState] = useState<RecorderState>("idle");
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [sizeMB, setSizeMB] = useState<number | null>(null);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let start = performance.now();
    const loop = () => {
      const now = performance.now();
      const elapsedMs = now - start;
      // Use a 6-second seamless loop for walking
      const loopDuration = 6000;
      const t = (elapsedMs % loopDuration) / loopDuration;
      drawCarpenter(ctx, t, canvas.width, canvas.height);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  const resetOutput = useCallback(() => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    setSizeMB(null);
  }, [blobUrl]);

  const record = useCallback(async () => {
    if (!canvasRef.current) return;
    resetOutput();
    setState("recording");

    const fps = 60;
    const stream = canvasRef.current.captureStream(fps);
    const chunks: BlobPart[] = [];

    let recorder: MediaRecorder;
    const mimeTypeCandidates = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm"
    ];
    const supported = mimeTypeCandidates.find(MediaRecorder.isTypeSupported);
    recorder = new MediaRecorder(stream, supported ? { mimeType: supported, videoBitsPerSecond: 5_000_000 } : undefined);

    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) chunks.push(ev.data);
    };
    const stopped = new Promise<void>((resolve) => (recorder.onstop = () => resolve()));

    recorder.start();
    await new Promise((r) => setTimeout(r, duration * 1000));
    recorder.stop();
    setState("processing");

    await stopped;
    const blob = new Blob(chunks, { type: supported ?? "video/webm" });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    setSizeMB(Number((blob.size / (1024 * 1024)).toFixed(2)));
    setState("done");
  }, [duration, resetOutput]);

  const stopRecordingEarly = useCallback(() => {
    // Not strictly needed since we auto-stop, but present for UX symmetry
    // Note: Stopping early is non-trivial without retaining recorder; for simplicity, disabled.
  }, []);

  const dimsLabel = useMemo(() => `${width}?${height}`, [width, height]);

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div>
            <div className="title">Carpenter Video Generator</div>
            <div className="subtitle">
              Animated vector carpenter carrying wood with a tool belt. Record to WebM directly in your browser.
            </div>
          </div>
          <div className="controls">
            <button
              className="btn"
              disabled={state === "recording" || state === "processing"}
              onClick={record}
              aria-label="Generate video"
            >
              {state === "recording" ? "Recording?" : state === "processing" ? "Processing?" : "Generate video"}
            </button>
            <button
              className="btn secondary"
              disabled
              onClick={stopRecordingEarly}
              aria-label="Stop recording"
              title="Stops automatically after duration"
            >
              Stop
            </button>
          </div>
        </div>

        <div className="row">
          <div className="left">
            <div className="canvasBox">
              <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: 540,
                  borderRadius: 8
                }}
              />
            </div>
            <div className="meta">
              <div><strong>Canvas</strong>: {dimsLabel}</div>
              <div><strong>Duration</strong>: {duration}s</div>
              <div><strong>Status</strong>: {state}</div>
              <div><strong>Output</strong>: {blobUrl ? `${sizeMB} MB` : "?"}</div>
            </div>
            <div className="footerNote">
              Tip: Most Chromium-based browsers support WebM recording. For Safari, you may need to convert the file to MP4 after download.
            </div>
          </div>

          <div className="right">
            <div style={{ marginBottom: 12, fontWeight: 700 }}>Settings</div>
            <div className="rangeRow">
              <label htmlFor="duration">Duration</label>
              <input
                id="duration"
                type="range"
                min={3}
                max={15}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              />
              <span>{duration}s</span>
            </div>
            <div className="rangeRow" style={{ marginTop: 8 }}>
              <label htmlFor="resolution">Resolution</label>
              <select
                id="resolution"
                value={`${width}x${height}`}
                onChange={(e) => {
                  const [w, h] = e.target.value.split("x").map((n) => parseInt(n, 10));
                  setWidth(w);
                  setHeight(h);
                }}
              >
                <option value="960x540">960?540 (qHD)</option>
                <option value="1280x720">1280?720 (HD)</option>
                <option value="1920x1080">1920?1080 (Full HD)</option>
              </select>
            </div>

            <div style={{ marginTop: 16 }}>
              {blobUrl ? (
                <>
                  <video
                    src={blobUrl}
                    controls
                    style={{ width: "100%", borderRadius: 8, background: "#000" }}
                  />
                  <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                    <a className="btn" href={blobUrl} download="carpenter.webm">Download WebM</a>
                    <button className="btn danger" onClick={resetOutput}>Discard</button>
                  </div>
                </>
              ) : (
                <div style={{ color: "var(--muted)" }}>
                  Click Generate video to record an animated carpenter walking with lumber and a tool belt.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
