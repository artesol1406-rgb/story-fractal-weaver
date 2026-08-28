import { useEffect, useRef } from "react";
import type { FractalNode, FractalStory } from "@/lib/story-fractal";
import { mulberry32 } from "@/lib/story-fractal";

interface Props {
  story: FractalStory;
  focus: FractalNode | null;
  selected: FractalNode | null;
  onPick: (n: FractalNode | null) => void;
  showField: boolean;
  animate: boolean;
}

/** Campo de escape tipo Mandelbrot/Julia ajustado a la historia. */
function drawField(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  c: { re: number; im: number },
  seed: number,
  luz: number,
  t: number,
) {
  const step = 3;
  const maxIter = 96;
  const rnd = mulberry32(seed);
  const hueBase = Math.floor(rnd() * 360);
  const span = 3.0;
  const img = ctx.createImageData(W, H);
  const data = img.data;

  for (let py = 0; py < H; py += step) {
    for (let px = 0; px < W; px += step) {
      let zre = ((px / W) - 0.5) * span * (W / H) * 0.55;
      let zim = ((py / H) - 0.5) * span * 0.55;
      let i = 0;
      for (; i < maxIter; i++) {
        const nre = zre * zre - zim * zim + c.re + Math.sin(t) * 0.012;
        const nim = 2 * zre * zim + c.im + Math.cos(t) * 0.012;
        if (nre * nre + nim * nim > 4) break;
        zre = nre;
        zim = nim;
      }
      let r = 4,
        g = 5,
        b = 12;
      if (i < maxIter) {
        const tt = i / maxIter;
        const hue = (hueBase + tt * 300) % 360;
        const l = 0.06 + tt * (0.22 + luz / 500);
        const s = 0.75;
        const cc = (1 - Math.abs(2 * l - 1)) * s;
        const x = cc * (1 - Math.abs(((hue / 60) % 2) - 1));
        const m = l - cc / 2;
        let rr = 0,
          gg = 0,
          bb = 0;
        if (hue < 60) {
          rr = cc;
          gg = x;
        } else if (hue < 120) {
          rr = x;
          gg = cc;
        } else if (hue < 180) {
          gg = cc;
          bb = x;
        } else if (hue < 240) {
          gg = x;
          bb = cc;
        } else if (hue < 300) {
          rr = x;
          bb = cc;
        } else {
          rr = cc;
          bb = x;
        }
        r = (rr + m) * 255;
        g = (gg + m) * 255;
        b = (bb + m) * 255;
      }
      for (let dy = 0; dy < step; dy++) {
        const y = py + dy;
        if (y >= H) break;
        for (let dx = 0; dx < step; dx++) {
          const x2 = px + dx;
          if (x2 >= W) break;
          const idx = (y * W + x2) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

interface Hit {
  node: FractalNode;
  x: number;
  y: number;
  r: number;
}

export function FractalCanvas({
  story,
  focus,
  selected,
  onPick,
  showField,
  animate,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hitsRef = useRef<Hit[]>([]);
  const fieldRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    let t = 0;
    let disposed = false;

    const render = () => {
      if (disposed) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = parent.clientWidth;
      const H = parent.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // fondo
      ctx.fillStyle = "#05060d";
      ctx.fillRect(0, 0, W, H);

      if (showField) {
        let field = fieldRef.current;
        if (!field) {
          field = document.createElement("canvas");
          fieldRef.current = field;
        }
        const fw = Math.max(160, Math.floor(W / 2));
        const fh = Math.max(160, Math.floor(H / 2));
        field.width = fw;
        field.height = fh;
        const fctx = field.getContext("2d");
        if (fctx) {
          const cc = focus ? focus.c : story.c;
          drawField(fctx, fw, fh, cc, story.seed, story.params.luz, t);
          ctx.globalAlpha = 0.85;
          ctx.drawImage(field, 0, 0, W, H);
          ctx.globalAlpha = 1;
        }
      }

      const hits: Hit[] = [];
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) * 0.36;

      const drawRing = (
        nodes: FractalNode[],
        ox: number,
        oy: number,
        radius: number,
        level: number,
        rot: number,
      ) => {
        if (nodes.length === 0 || radius < 5) return;
        // anillo guía
        ctx.beginPath();
        ctx.arc(ox, oy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(226,199,120,${0.28 / (level + 1)})`;
        ctx.lineWidth = Math.max(0.4, 1.6 / (level + 1));
        ctx.stroke();

        const n = nodes.length;
        nodes.forEach((node, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2 + rot;
          const x = ox + Math.cos(a) * radius;
          const y = oy + Math.sin(a) * radius;
          const size = Math.max(
            1.6,
            radius * (level === 0 ? 0.17 : 0.2) * (0.6 + node.intensidad * 0.7),
          );
          node.x = x;
          node.y = y;
          node.r = size;

          // conector
          ctx.beginPath();
          ctx.moveTo(ox, oy);
          ctx.lineTo(x, y);
          ctx.strokeStyle = `hsla(${node.chakra.hue}, 70%, 60%, ${0.14 / (level + 1)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();

          // hijos: mini-círculo de 7 (chakras)
          if (node.children.length) {
            drawRing(
              node.children,
              x,
              y,
              radius * (level === 0 ? 0.34 : 0.42),
              level + 1,
              rot + node.station.idx * 0.21 + node.chakra.idx * 0.13,
            );
          }

          const alpha = 0.55 + node.intensidad * 0.45;
          const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 2.4);
          glow.addColorStop(
            0,
            `hsla(${node.chakra.hue},95%,68%,${alpha})`,
          );
          glow.addColorStop(1, `hsla(${node.chakra.hue},95%,55%,0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, size * 2.4, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle =
            node.persona.polaridad === "activa"
              ? `hsla(${node.chakra.hue},92%,66%,0.95)`
              : "rgba(8,10,20,0.92)";
          ctx.fill();
          ctx.lineWidth = Math.max(0.6, size * 0.22);
          ctx.strokeStyle = `hsla(${node.chakra.hue},90%,${node.persona.polaridad === "activa" ? 82 : 62}%,0.95)`;
          ctx.stroke();

          // marca de disonancia (ritmo quebrado)
          if (node.disonancia > 0.55 && size > 3) {
            ctx.beginPath();
            ctx.arc(x, y, size * 1.7, 0, Math.PI * 2);
            ctx.setLineDash([1.5, 3]);
            ctx.strokeStyle = "rgba(255,120,90,0.55)";
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.setLineDash([]);
          }

          if (selected && selected.id === node.id) {
            ctx.beginPath();
            ctx.arc(x, y, size * 3.1, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(240,225,180,0.95)";
            ctx.lineWidth = 1.4;
            ctx.stroke();
          }

          if (level === 0) {
            ctx.font = "600 11px 'Space Grotesk', system-ui, sans-serif";
            ctx.fillStyle = "rgba(232,226,208,0.82)";
            ctx.textAlign = "center";
            const lx = ox + Math.cos(a) * (radius + size + 26);
            const ly = oy + Math.sin(a) * (radius + size + 26);
            ctx.fillText(node.station.nombre.toUpperCase(), lx, ly);
            ctx.font = "9px 'Space Grotesk', system-ui, sans-serif";
            ctx.fillStyle = "rgba(226,199,120,0.7)";
            ctx.fillText(node.arcano, lx, ly + 11);
          }

          hits.push({ node, x, y, r: Math.max(size * 1.6, 5) });
        });
      };

      const roots = focus ? [focus] : story.root;
      if (focus) {
        drawRing(focus.children, cx, cy, R * 0.75, 0, t * 0.05);
        // núcleo focalizado
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${focus.chakra.hue},92%,66%,0.95)`;
        ctx.fill();
        hits.push({ node: focus, x: cx, y: cy, r: 14 });
      } else {
        drawRing(roots, cx, cy, R, 0, t * 0.05);
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(226,199,120,0.9)";
        ctx.fill();
      }

      hitsRef.current = hits;

      if (animate) {
        t += 0.02;
        rafRef.current = requestAnimationFrame(render);
      }
    };

    render();
    const ro = new ResizeObserver(() => {
      if (!animate) render();
    });
    ro.observe(parent);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [story, focus, selected, showField, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full cursor-crosshair"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        let best: Hit | null = null;
        let bestD = Infinity;
        for (const h of hitsRef.current) {
          const d = Math.hypot(h.x - mx, h.y - my);
          if (d < h.r + 4 && d < bestD) {
            bestD = d;
            best = h;
          }
        }
        onPick(best ? best.node : null);
      }}
    />
  );
}
