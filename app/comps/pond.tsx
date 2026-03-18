"use client";
import { useEffect, useRef } from "react";
type Duck = {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  angle: number;
  progress: number;
  speed: number;
  phase: number; // 👈 NEW
  img: HTMLImageElement; // 👈 NEW
};

export default function Pond() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const messages = [
      "Keep going, even if it's slow.",
      "You don’t need to rush your story.",
      "Small steps still move you forward.",
    ];
    let currentSpeaker = 0;
    let messageTimer = 0;
    const messageDuration = 5000; // 5 sec per duck
    let globalTime = 0;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    let noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = canvas.width;
    noiseCanvas.height = canvas.height;
    const noiseCtx = noiseCanvas.getContext("2d")!;

    const duckImg1 = new Image();
    duckImg1.src = "/duck1.png";

    const duckImg2 = new Image();
    duckImg2.src = "/duck2.png";

    const duckImg3 = new Image();
    duckImg3.src = "/duck3.png";

    canvas.width = 800;
    canvas.height = 400;
    const ducks: Duck[] = [
      {
        x: 400,
        y: 200,
        prevX: 400,
        prevY: 200,
        angle: 0,
        progress: 0,
        speed: 0.5,
        phase: 0,
        img: duckImg1,
      },
      {
        x: 420,
        y: 220,
        prevX: 420,
        prevY: 220,
        angle: 0,
        progress: 0.04,
        speed: 0.7,
        phase: 2,
        img: duckImg2,
      },
      {
        x: 380,
        y: 210,
        prevX: 380,
        prevY: 210,
        angle: 0,
        progress: 0.02,
        speed: 0.6,
        phase: 4,
        img: duckImg3,
      },
    ];

    const pondImg = new Image();
    pondImg.src = "/pond.jpg";

    function drawPond() {
      ctx.drawImage(pondImg, 0, 0, canvas.width, canvas.height);
    }
    function drawGradient() {
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);

      grad.addColorStop(0, "#ffffff"); // top
      grad.addColorStop(0.4, "#cccccc");
      grad.addColorStop(1, "#0a0f1f"); // dark bottom

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    function generateNoise() {
      const imageData = noiseCtx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 30;

        data[i] = noise;
        data[i + 1] = noise;
        data[i + 2] = noise;
        data[i + 3] = 25;
      }

      noiseCtx.putImageData(imageData, 0, 0);
    }

    function drawShaderLikeBackground() {
      ctx.filter = "blur(30px)";
      drawGradient();
      ctx.filter = "none";

      ctx.globalAlpha = 0.3;
      ctx.drawImage(noiseCanvas, 0, 0);
      ctx.globalAlpha = 1;
    }
    function drawDucks() {
      const duckWidth = 100;
      const duckHeight = 70;

      ducks.forEach((duck, i) => {
        ctx.save();

        // 🪶 bobbing (each duck different)
        const bob = Math.sin(globalTime * 0.005 + duck.phase) * 4;

        ctx.translate(duck.x, duck.y + bob);

        // 🌀 wiggle (different per duck)
        const wiggle = Math.sin(globalTime * 0.01 + duck.phase) * 0.15;

        ctx.rotate(duck.angle + Math.PI / 2 + wiggle);

        // 🎯 stretch variation
        const stretch = 1 + Math.sin(globalTime * 0.01 + duck.phase) * 0.05;
        ctx.scale(stretch, 1);

        ctx.drawImage(
          duck.img,
          -duckWidth * 0.6,
          -duckHeight / 2,
          duckWidth,
          duckHeight,
        );

        ctx.restore();
      });
    }
    function getPositionOnRectangle(
      progress: number,
      centerX: number,
      centerY: number,
      width: number,
      height: number,
      cornerRadius: number,
    ) {
      progress = progress % 1;

      const left = centerX - width / 2;
      const right = centerX + width / 2;
      const top = centerY - height / 2;
      const bottom = centerY + height / 2;

      const segments = [
        {
          type: "line",
          x1: left + cornerRadius,
          y1: top,
          x2: right - cornerRadius,
          y2: top,
        },
        {
          type: "arc",
          cx: right - cornerRadius,
          cy: top + cornerRadius,
          r: cornerRadius,
          start: -Math.PI / 2,
          end: 0,
        },
        {
          type: "line",
          x1: right,
          y1: top + cornerRadius,
          x2: right,
          y2: bottom - cornerRadius,
        },
        {
          type: "arc",
          cx: right - cornerRadius,
          cy: bottom - cornerRadius,
          r: cornerRadius,
          start: 0,
          end: Math.PI / 2,
        },
        {
          type: "line",
          x1: right - cornerRadius,
          y1: bottom,
          x2: left + cornerRadius,
          y2: bottom,
        },
        {
          type: "arc",
          cx: left + cornerRadius,
          cy: bottom - cornerRadius,
          r: cornerRadius,
          start: Math.PI / 2,
          end: Math.PI,
        },
        {
          type: "line",
          x1: left,
          y1: bottom - cornerRadius,
          x2: left,
          y2: top + cornerRadius,
        },
        {
          type: "arc",
          cx: left + cornerRadius,
          cy: top + cornerRadius,
          r: cornerRadius,
          start: Math.PI,
          end: (3 * Math.PI) / 2,
        },
      ];

      let totalLength = 0;
      const segmentLengths = segments.map((seg) => {
        let length = 0;
        if (seg.type === "line") {
          const lineSeg = seg as typeof seg & { x1: number; y1: number; x2: number; y2: number };
          length = Math.hypot(lineSeg.x2 - lineSeg.x1, lineSeg.y2 - lineSeg.y1);
        } else {
          const arcSeg = seg as typeof seg & { cx: number; cy: number; r: number; start: number; end: number };
          length = arcSeg.r * Math.abs(arcSeg.end - arcSeg.start);
        }
        totalLength += length;
        return length;
      });

      let currentDist = progress * totalLength;

      for (let i = 0; i < segments.length; i++) {
        if (currentDist < segmentLengths[i]) {
          const seg = segments[i];
          const t = currentDist / segmentLengths[i];

          if (seg.type === "line") {
            const lineSeg = seg as typeof seg & { x1: number; y1: number; x2: number; y2: number };
            const x = lineSeg.x1 + t * (lineSeg.x2 - lineSeg.x1);
            const y = lineSeg.y1 + t * (lineSeg.y2 - lineSeg.y1);
            const angle = Math.atan2(lineSeg.y2 - lineSeg.y1, lineSeg.x2 - lineSeg.x1);
            return { x, y, angle };
          } else {
            const arcSeg = seg as typeof seg & { cx: number; cy: number; r: number; start: number; end: number };
            const a = arcSeg.start + t * (arcSeg.end - arcSeg.start);
            const x = arcSeg.cx + arcSeg.r * Math.cos(a);
            const y = arcSeg.cy + arcSeg.r * Math.sin(a);
            const angle = a + Math.PI / 2;
            return { x, y, angle };
          }
        }
        currentDist -= segmentLengths[i];
      }

      return { x: centerX, y: centerY, angle: 0 };
    }

    // ✅ smooth angle interpolation (fix snapping)
    function lerpAngle(a: number, b: number, t: number) {
      let diff = b - a;

      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;

      return a + diff * t;
    }

    function updateDucks(deltaTime: number) {
      ducks.forEach((duck) => {
        // store previous position
        duck.prevX = duck.x;
        duck.prevY = duck.y;

        // move along path
        duck.progress += (duck.speed * deltaTime) / 5000;

        const pos = getPositionOnRectangle(
          duck.progress,
          canvas.width / 2,
          canvas.height - 180,
          470,
          155,
          55,
        );

        duck.x = pos.x;
        duck.y = pos.y;

        // 🔥 compute direction from movement (REAL FIX)
        const dx = duck.x - duck.prevX;
        const dy = duck.y - duck.prevY;

        const targetAngle = Math.atan2(dy, dx);

        // smooth but synced
        duck.angle = lerpAngle(duck.angle, targetAngle, 0.25);
      });
    }

    let lastTime = 0;
    function applyPondMask() {
      ctx.save();

      ctx.beginPath();

      const margin = 1;

      // 👇 irregular organic shape (not rectangle)
      ctx.moveTo(margin, margin);

      for (let x = margin; x <= canvas.width - margin; x += 20) {
        const y = margin + Math.sin(x * 0.05) * 3;
        ctx.lineTo(x, y);
      }

      for (let y = margin; y <= canvas.height - margin; y += 20) {
        const x = canvas.width - margin + Math.sin(y * 0.05) * 3;
        ctx.lineTo(x, y);
      }

      for (let x = canvas.width - margin; x >= margin; x -= 20) {
        const y = canvas.height - margin + Math.sin(x * 0.05) * 3;
        ctx.lineTo(x, y);
      }

      for (let y = canvas.height - margin; y >= margin; y -= 20) {
        const x = margin + Math.sin(y * 0.05) * 3;
        ctx.lineTo(x, y);
      }

      ctx.closePath();

      ctx.clip(); // 🔥 THIS is the key

      // redraw pond INSIDE mask
      ctx.drawImage(pondImg, 0, 0, canvas.width, canvas.height);

      ctx.restore();
    }
    function drawTransparentEdges() {
      const fade = 80; // 👈 narrow fade zone

      ctx.save();
      ctx.globalCompositeOperation = "destination-out";

      // LEFT
      let grad = ctx.createLinearGradient(0, 0, fade, 0);
      grad.addColorStop(0, "rgba(0,0,0,1)");
      grad.addColorStop(0.5, "rgba(0,0,0,0.3)");
      grad.addColorStop(1, "rgba(0,0,0,0)"); // 100% transparent
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, fade, canvas.height);

      // RIGHT
      grad = ctx.createLinearGradient(canvas.width, 0, canvas.width - fade, 0);
      grad.addColorStop(0, "rgba(0,0,0,1)");
      grad.addColorStop(0.5, "rgba(0,0,0,0.3)");
      grad.addColorStop(1, "rgba(0,0,0,0)"); // 100% transparent
      ctx.fillStyle = grad;
      ctx.fillRect(canvas.width - fade, 0, fade, canvas.height);

      // TOP
      grad = ctx.createLinearGradient(0, 0, 0, fade);
      grad.addColorStop(0, "rgba(0,0,0,1)");
      grad.addColorStop(0.5, "rgba(0,0,0,0.3)");
      grad.addColorStop(1, "rgba(0,0,0,0)"); // 100% transparent
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, fade);

      // BOTTOM
      grad = ctx.createLinearGradient(
        0,
        canvas.height,
        0,
        canvas.height - fade,
      );
      grad.addColorStop(0, "rgba(0,0,0,1)");
      grad.addColorStop(0.5, "rgba(0,0,0,0.3)");
      grad.addColorStop(1, "rgba(0,0,0,0)"); // 100% transparent
      ctx.fillStyle = grad;
      ctx.fillRect(0, canvas.height - fade, canvas.width, fade);

      ctx.restore();
    }

    function drawMessage() {
      const duck = ducks[currentSpeaker];
      const text = messages[currentSpeaker];

      const t = messageTimer / messageDuration;
      const alpha = Math.sin(t * Math.PI); // smooth fade

      const padding = 15;
      const maxWidth = 200;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font =
        "200 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

      // 🧠 measure text
      const words = text.split(" ");
      let lines: string[] = [];
      let line = "";

      words.forEach((word) => {
        const test = line + word + " ";
        const width = ctx.measureText(test).width;
        if (width > maxWidth) {
          lines.push(line);
          line = word + " ";
        } else {
          line = test;
        }
      });
      lines.push(line);

      const lineHeight = 12;
      const boxWidth = maxWidth + padding * 2;
      const boxHeight = lines.length * lineHeight + padding * 2;

      const stableX = duck.x;
      const stableY = duck.y;

      const x = stableX - boxWidth / 2;
      const y = stableY - 90 + Math.sin(globalTime * 0.002) * 2;

      // 💬 Premium bubble background with gradient
      const gradient = ctx.createLinearGradient(x, y, x, y + boxHeight);
      gradient.addColorStop(0, "rgba(255,255,255,0.98)");
      gradient.addColorStop(1, "rgba(248,248,255,0.95)");

      ctx.fillStyle = gradient;
      ctx.strokeStyle = "rgba(200,200,220,0.4)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(0,0,0,0.15)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;

      ctx.beginPath();
      ctx.roundRect(x, y, boxWidth, boxHeight, 12);
      ctx.fill();
      ctx.stroke();

      // ✨ Inner highlight effect
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x + 1.5, y + 1.5, boxWidth - 3, boxHeight - 3, 11);
      ctx.stroke();

      // 🔻 Premium tail (points to duck)
      ctx.shadowColor = "rgba(0,0,0,0.1)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = "rgba(255,255,255,0.98)";
      ctx.beginPath();
      ctx.moveTo(duck.x - 8, y + boxHeight);
      ctx.lineTo(duck.x + 8, y + boxHeight);
      ctx.lineTo(duck.x, y + boxHeight + 12);
      ctx.closePath();
      ctx.fill();

      // Tail border
      ctx.strokeStyle = "rgba(200,200,220,0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(duck.x - 8, y + boxHeight);
      ctx.lineTo(duck.x, y + boxHeight + 12);
      ctx.stroke();

      // 📝 Premium text styling
      ctx.fillStyle = "#2c3e50";
      ctx.textAlign = "left";
      ctx.shadowColor = "rgba(0,0,0,0.05)";
      ctx.shadowBlur = 2;
      ctx.shadowOffsetY = 1;

      lines.forEach((l, i) => {
        ctx.fillText(
          l.trim(),
          x + padding,
          y + padding + (i + 1) * lineHeight - 2,
        );
      });

      ctx.restore();
    }
    function animate(time: number) {
      const deltaTime = time - lastTime;
      lastTime = time;
      globalTime += deltaTime; // 👈 ADD THIS
      messageTimer += deltaTime;

      if (messageTimer > messageDuration) {
        messageTimer = 0;
        currentSpeaker = (currentSpeaker + 1) % ducks.length;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 🌫️ background shader FIRST
      drawShaderLikeBackground();

      // 🌊 pond (clipped shape)
      applyPondMask();

      // 🦆 ducks
      updateDucks(deltaTime);
      drawDucks();

      // 💬 message
      drawMessage();

      requestAnimationFrame(animate);
    }
    let loaded = 0;
    const totalImages = 4; // pond + 3 ducks

    function checkLoaded() {
      loaded++;
      if (loaded === totalImages) {
        requestAnimationFrame(animate);
      }
    }

    pondImg.onload = checkLoaded;
    duckImg1.onload = checkLoaded;
    duckImg2.onload = checkLoaded;
    duckImg3.onload = checkLoaded;
  }, []);

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef} />
    </div>
  );
}
