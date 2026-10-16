// Álgebra de Planos Relacionales (APR v2) + Psicógrafo Δ + Analizador v12
import type { FractalNode, FractalStory } from "./story-fractal";

export const AXES = [
  ["Orden", "Caos"],
  ["Energía", "Quietud"],
  ["Escala íntima", "Escala cósmica"],
  ["Luz", "Sombra"],
  ["Realidad", "Sueño"],
  ["Individuo", "Colectivo"],
  ["Pasado", "Futuro"],
  ["Mente", "Cuerpo"],
] as const;

/** Vector psicográfico de 8 ejes en [-1,1] para un nodo. */
export function nodeVector(n: FractalNode): number[] {
  const a = n.arcanoIdx / 21;
  const c = n.chakra.idx / 6;
  const s = n.station.idx / 11;
  const p = n.persona.polaridad === "activa" ? 1 : -1;
  return [
    1 - 2 * n.disonancia,
    2 * n.intensidad - 1,
    2 * c - 1,
    Math.cos(a * Math.PI),
    Math.sin(a * Math.PI * 2) * (1 - c),
    p * (1 - 2 * Math.abs(s - 0.5)),
    2 * s - 1,
    mindBody(n) === "mente" ? 1 : -1,
  ];
}

/** v12: Mente influye sin moverse; Cuerpo se mueve al recibir influencia. */
export function mindBody(n: FractalNode): "mente" | "cuerpo" {
  const upper = n.chakra.idx >= 4;
  const act = n.persona.polaridad === "activa";
  return upper !== act ? "mente" : "cuerpo";
}

/** Matriz de Gram normalizada (traza 1) de un conjunto de vectores. */
export function gram(vs: number[][]): number[][] {
  const d = vs[0]?.length ?? 0;
  const G = Array.from({ length: d }, () => Array(d).fill(0) as number[]);
  for (const v of vs) for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) G[i]![j]! += v[i]! * v[j]!;
  const tr = G.reduce((s, r, i) => s + r[i]!, 0) || 1;
  return G.map((r) => r.map((x) => x / tr));
}
const frob = (G: number[][]) => Math.sqrt(G.flat().reduce((s, x) => s + x * x, 0));
/** Resonancia ρ = ‖G1−G2‖F / ‖G1‖F (0 = idénticos). */
export function rho(G1: number[][], G2: number[][]) {
  const diff = G1.map((r, i) => r.map((x, j) => x - G2[i]![j]!));
  return frob(diff) / (frob(G1) || 1);
}
/** Rango de participación (tr G)² / ‖G‖F². */
export function participation(G: number[][]) {
  const tr = G.reduce((s, r, i) => s + r[i]!, 0);
  return (tr * tr) / (frob(G) ** 2 || 1);
}
/** Tensión entre planos τ = sin²θ. */
export function tension(u: number[], v: number[]) {
  const dot = u.reduce((s, x, i) => s + x * v[i]!, 0);
  const nu = Math.hypot(...u) || 1, nv = Math.hypot(...v) || 1;
  const cos = dot / (nu * nv);
  return 1 - cos * cos;
}

export interface StationDelta {
  station: string;
  pulse: number; // T(τ)
  phiE: number;
  phiC: number;
  dP: number;
  rhoPrev: number;
  silencio: "resolución" | "cancelación" | null;
}

/** Pulso dramático v12 + respiración de red por estación. */
export function deltaAnalysis(story: FractalStory, anchor = 0) {
  const groups: FractalNode[][] = story.root.map((st) => {
    const out: FractalNode[] = [];
    const walk = (n: FractalNode) => { out.push(n); n.children.forEach(walk); };
    walk(st);
    return out;
  });
  const sign = anchor % 2 === 0 ? 1 : -1;
  const grams = groups.map((g) => gram(g.map((n) => nodeVector(n).map((x, i) => (i === anchor % 8 ? x * sign : x)))));
  let prevP = participation(grams[0]!);
  const rows: StationDelta[] = groups.map((g, i) => {
    const d = g.reduce((s, n) => s + n.disonancia, 0) / g.length;
    const io = g.reduce((s, n) => s + n.intensidad, 0) / g.length;
    const m = g.filter((n) => mindBody(n) === "mente").length / g.length;
    const fric = 1 - Math.abs(2 * m - 1);
    const P = participation(grams[i]!);
    const dP = P - prevP;
    prevP = P;
    const r = i === 0 ? 0 : rho(grams[i - 1]!, grams[i]!);
    const pulse = 0.5 * d + 0.3 * io + 0.2 * fric;
    return {
      station: g[0]!.station.nombre,
      pulse,
      phiE: Math.max(0, dP),
      phiC: Math.max(0, -dP),
      dP,
      rhoPrev: r,
      silencio: pulse < 0.35 ? (r < 0.25 ? "resolución" : "cancelación") : null,
    };
  });
  const rhoMatrix = grams.map((a) => grams.map((b) => rho(a, b)));
  const all = groups.flat();
  const mean = AXES.map((_, i) => all.reduce((s, n) => s + nodeVector(n)[i]!, 0) / all.length);
  return { rows, rhoMatrix, mean, participationTotal: participation(gram(all.map(nodeVector))) };
}

/** Manual Δ: 7 nodos diagnósticos de coherencia. */
export function manualDiagnostic(story: FractalStory) {
  const { rows, mean } = deltaAnalysis(story);
  const peak = rows.reduce((a, b, i) => (b.pulse > rows[a]!.pulse ? i : a), 0);
  const cancels = rows.filter((r) => r.silencio === "cancelación").length;
  const balance = 1 - mean.reduce((s, x) => s + Math.abs(x), 0) / mean.length;
  const resp = rows.filter((r) => r.dP > 0).length / rows.length;
  const check = (ok: boolean, txt: string, fix: string) => ({ ok, txt, fix });
  return [
    check(peak >= 5 && peak <= 10, `Clímax en estación ${peak + 1}`, "Desplaza la máxima tensión al tercer acto."),
    check(cancels <= 2, `${cancels} silencios por cancelación`, "Convierte silencios muertos en resoluciones."),
    check(balance > 0.6, `Equilibrio polar ${(balance * 100).toFixed(0)}%`, "Un eje domina: introduce su contrapolo."),
    check(resp > 0.3 && resp < 0.7, `Respiración ${(resp * 100).toFixed(0)}% expansiva`, "Alterna expansión y contracción."),
    check(rows[0]!.pulse < rows[peak]!.pulse, "Arranque menor que clímax", "Baja la tensión del inicio."),
    check(rows[11]!.pulse < rows[peak]!.pulse, "Retorno resuelve", "El final debe descargar tensión."),
    check(Math.abs(mean[7]!) < 0.5, "Fricción mente/cuerpo viva", "Equilibra quién influye y quién actúa."),
  ];
}
