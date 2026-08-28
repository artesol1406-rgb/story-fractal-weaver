/**
 * story-fractal.ts
 * Modelo fractal de una historia: Círculo del Héroe (12 estaciones),
 * cada estación es un mini-círculo de 7 partes (chakras / ritmo),
 * y cada parte porta un Arcano (22) y un Nodo de Personalidad (32 = 16 base x activo/receptivo).
 *
 * Todo es determinista a partir de la semilla + parámetros: infinitas
 * posibilidades dentro de las limitaciones dadas al inicio.
 */

export type Polarity = "activa" | "receptiva";

export interface StoryParams {
  titulo: string;
  sistema: string;
  protagonista: string;
  carencia: string;
  antagonistaInterno: string;
  genero: Genre;
  semilla: string;
  profundidad: number; // 1..4 niveles de recursión
  tension: number; // 0..100 -> disonancia rítmica
  luz: number; // 0..100 -> apertura / claridad del campo
  simetria: number; // 3..12 estaciones activas del círculo
}

export type Genre =
  | "mito"
  | "tragedia"
  | "iniciacion"
  | "ciencia ficcion"
  | "romance"
  | "terror";

export const GENRES: Genre[] = [
  "mito",
  "tragedia",
  "iniciacion",
  "ciencia ficcion",
  "romance",
  "terror",
];

/* ---------------------------------------------------------------- chakras */

export interface Chakra {
  idx: number;
  nombre: string;
  sanscrito: string;
  ritmo: string; // elemento arquetípico del ritmo
  compas: string;
  hue: number;
}

export const CHAKRAS: Chakra[] = [
  { idx: 0, nombre: "Raíz", sanscrito: "Muladhara", ritmo: "Pulso", compas: "4/4 grave", hue: 8 },
  { idx: 1, nombre: "Sacro", sanscrito: "Svadhisthana", ritmo: "Oleaje", compas: "6/8 ondulante", hue: 30 },
  { idx: 2, nombre: "Plexo", sanscrito: "Manipura", ritmo: "Impulso", compas: "5/4 tenso", hue: 52 },
  { idx: 3, nombre: "Corazón", sanscrito: "Anahata", ritmo: "Respiración", compas: "3/4 abierto", hue: 145 },
  { idx: 4, nombre: "Garganta", sanscrito: "Vishuddha", ritmo: "Enunciación", compas: "7/8 quebrado", hue: 196 },
  { idx: 5, nombre: "Frente", sanscrito: "Ajna", ritmo: "Visión", compas: "2/2 suspendido", hue: 240 },
  { idx: 6, nombre: "Corona", sanscrito: "Sahasrara", ritmo: "Silencio", compas: "libre", hue: 285 },
];

/* --------------------------------------------------- círculo del héroe x12 */

export interface Station {
  idx: number;
  nombre: string;
  funcion: string;
}

export const STATIONS: Station[] = [
  { idx: 0, nombre: "Mundo Ordinario", funcion: "Establece el sistema y su costo" },
  { idx: 1, nombre: "Llamada", funcion: "Irrumpe la grieta" },
  { idx: 2, nombre: "Rechazo", funcion: "El miedo nombra su precio" },
  { idx: 3, nombre: "Mentor", funcion: "Aparece la clave prestada" },
  { idx: 4, nombre: "Umbral", funcion: "Cruce irreversible" },
  { idx: 5, nombre: "Pruebas", funcion: "Aliados, enemigos, reglas nuevas" },
  { idx: 6, nombre: "Aproximación", funcion: "Descenso a la cueva" },
  { idx: 7, nombre: "Ordalía", funcion: "Muerte simbólica" },
  { idx: 8, nombre: "Recompensa", funcion: "El símbolo desbloqueado" },
  { idx: 9, nombre: "Regreso", funcion: "El mundo cobra la deuda" },
  { idx: 10, nombre: "Resurrección", funcion: "Prueba final de autenticidad" },
  { idx: 11, nombre: "Elixir", funcion: "Retorno con la forma nueva" },
];

/* ------------------------------------------------------------- 22 arcanos */

export const ARCANA: string[] = [
  "El Loco",
  "El Mago",
  "La Sacerdotisa",
  "La Emperatriz",
  "El Emperador",
  "El Hierofante",
  "Los Amantes",
  "El Carro",
  "La Fuerza",
  "El Ermitaño",
  "La Rueda",
  "La Justicia",
  "El Colgado",
  "La Muerte",
  "La Templanza",
  "El Diablo",
  "La Torre",
  "La Estrella",
  "La Luna",
  "El Sol",
  "El Juicio",
  "El Mundo",
];

/* ------------------------------- 32 nodos de personalidad (16 x polaridad) */

export interface BasePersona {
  idx: number;
  nombre: string;
  eje: string;
}

export const BASE_PERSONAS: BasePersona[] = [
  { idx: 0, nombre: "Guardián", eje: "Orden / Miedo" },
  { idx: 1, nombre: "Explorador", eje: "Deseo / Fuga" },
  { idx: 2, nombre: "Artífice", eje: "Forma / Control" },
  { idx: 3, nombre: "Vidente", eje: "Visión / Delirio" },
  { idx: 4, nombre: "Sombra", eje: "Negación / Verdad" },
  { idx: 5, nombre: "Custodio", eje: "Memoria / Peso" },
  { idx: 6, nombre: "Heraldo", eje: "Voz / Ruido" },
  { idx: 7, nombre: "Alquimista", eje: "Cambio / Disolución" },
  { idx: 8, nombre: "Soberano", eje: "Poder / Rigidez" },
  { idx: 9, nombre: "Sanador", eje: "Vínculo / Sacrificio" },
  { idx: 10, nombre: "Trickster", eje: "Juego / Caos" },
  { idx: 11, nombre: "Testigo", eje: "Presencia / Parálisis" },
  { idx: 12, nombre: "Nómada", eje: "Umbral / Desarraigo" },
  { idx: 13, nombre: "Tejedor", eje: "Red / Dependencia" },
  { idx: 14, nombre: "Asceta", eje: "Vacío / Fuga" },
  { idx: 15, nombre: "Semilla", eje: "Potencial / Latencia" },
];

export interface PersonaNode {
  id: number; // 0..31
  base: BasePersona;
  polaridad: Polarity;
  etiqueta: string;
}

export const PERSONA_NODES: PersonaNode[] = BASE_PERSONAS.flatMap((b) => [
  {
    id: b.idx * 2,
    base: b,
    polaridad: "activa" as Polarity,
    etiqueta: `${b.nombre} activo`,
  },
  {
    id: b.idx * 2 + 1,
    base: b,
    polaridad: "receptiva" as Polarity,
    etiqueta: `${b.nombre} receptivo`,
  },
]);

/* ------------------------------------------------------------------- prng */

export function hashSeed(str: string): number {
  let h = 5381;
  const s = String(str ?? "");
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return h >>> 0;
}

export function mulberry32(a: number) {
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) | 0;
    t = t ^ (t >>> 14);
    const u = (t >>> 0) / 4294967296;
    return u;
  };
}

const GENRE_SHIFT: Record<Genre, number> = {
  mito: 0,
  tragedia: 7,
  iniciacion: 13,
  "ciencia ficcion": 19,
  romance: 3,
  terror: 11,
};

/* -------------------------------------------------------------- nodo árbol */

export interface FractalNode {
  id: string;
  path: number[]; // ruta en el árbol
  depth: number; // 0 = estación, 1..n = beats
  label: string;
  station: Station;
  chakra: Chakra;
  arcano: string;
  arcanoIdx: number;
  persona: PersonaNode;
  /** ritmo */
  tempo: number; // 40..190 bpm simbólicos
  intensidad: number; // 0..1
  disonancia: number; // 0..1
  /** parámetro julia local: da la firma fractal del nodo */
  c: { re: number; im: number };
  /** geometría (rellenada por el render) */
  x: number;
  y: number;
  r: number;
  children: FractalNode[];
}

export interface FractalStory {
  params: StoryParams;
  seed: number;
  root: FractalNode[];
  flujo: FractalNode[]; // recorrido lineal (secuencia narrativa)
  c: { re: number; im: number }; // firma global del campo
}

function buildNode(
  params: StoryParams,
  path: number[],
  depth: number,
  station: Station,
  seedBase: number,
): FractalNode {
  const chakraIdx = (path[path.length - 1] ?? 0) % 7;
  const chakra = CHAKRAS[depth === 0 ? station.idx % 7 : chakraIdx]!;
  const key = seedBase ^ hashSeed(path.join(".") + "|" + params.genero);
  const rnd = mulberry32(key);

  const arcanoIdx =
    (station.idx * 7 +
      chakra.idx * 3 +
      Math.floor(rnd() * 22) +
      GENRE_SHIFT[params.genero]) %
    22;

  const baseIdx = (station.idx * 5 + chakra.idx * 2 + Math.floor(rnd() * 16)) % 16;
  const polarBias = (params.tension / 100) * 0.5 + rnd() * 0.7;
  const polaridad: Polarity =
    (chakra.idx + station.idx + (polarBias > 0.6 ? 1 : 0)) % 2 === 0
      ? "activa"
      : "receptiva";
  const persona =
    PERSONA_NODES[baseIdx * 2 + (polaridad === "activa" ? 0 : 1)]!;

  const curva = Math.sin(((station.idx + 1) / 12) * Math.PI);
  const intensidad = Math.min(
    1,
    0.18 + curva * 0.65 + (chakra.idx / 6) * 0.2 + rnd() * 0.15,
  );
  const disonancia = Math.min(
    1,
    (params.tension / 100) * 0.7 + rnd() * 0.3 - (params.luz / 100) * 0.25,
  );
  const tempo = Math.round(
    46 + intensidad * 120 + (chakra.idx - 3) * 6 + rnd() * 14,
  );

  const ang = ((station.idx + chakra.idx / 7) / 12) * Math.PI * 2;
  const rad = 0.62 + (params.tension / 100) * 0.18 - (params.luz / 100) * 0.12;
  const c = {
    re: Math.cos(ang) * rad - 0.32 + (rnd() - 0.5) * 0.05,
    im: Math.sin(ang) * rad * 0.72 + (rnd() - 0.5) * 0.05,
  };

  return {
    id: path.join("-"),
    path,
    depth,
    label:
      depth === 0
        ? station.nombre
        : `${station.nombre} · ${chakra.nombre}`,
    station,
    chakra,
    arcano: ARCANA[arcanoIdx]!,
    arcanoIdx,
    persona,
    tempo,
    intensidad,
    disonancia: Math.max(0, disonancia),
    c,
    x: 0,
    y: 0,
    r: 0,
    children: [],
  };
}

export function buildFractalStory(params: StoryParams): FractalStory {
  const seed = hashSeed(
    [
      params.semilla,
      params.titulo,
      params.sistema,
      params.protagonista,
      params.carencia,
      params.antagonistaInterno,
      params.genero,
    ].join("|"),
  );

  const stations = STATIONS.slice(0, Math.max(3, Math.min(12, params.simetria)));

  const expand = (node: FractalNode, maxDepth: number) => {
    if (node.depth >= maxDepth) return;
    for (let k = 0; k < 7; k++) {
      const child = buildNode(
        params,
        [...node.path, k],
        node.depth + 1,
        node.station,
        seed,
      );
      node.children.push(child);
      expand(child, maxDepth);
    }
  };

  const root = stations.map((st) => {
    const n = buildNode(params, [st.idx], 0, st, seed);
    expand(n, Math.max(1, Math.min(4, params.profundidad)));
    return n;
  });

  const flujo: FractalNode[] = [];
  const walk = (n: FractalNode) => {
    if (n.depth > 0) flujo.push(n);
    n.children.forEach(walk);
  };
  root.forEach(walk);

  const rnd = mulberry32(seed);
  const c = {
    re: -0.79 + (rnd() - 0.5) * 0.22 + (params.tension / 100) * 0.06,
    im: 0.14 + rnd() * 0.14 + (params.luz / 100) * 0.05,
  };

  return { params, seed, root, flujo, c };
}

/* ----------------------------------------------------------------- textos */

export function beatSentence(n: FractalNode, p: StoryParams): string {
  const suj = p.protagonista || "el protagonista";
  const sis = p.sistema || "el sistema";
  const car = p.carencia || "una falta sin nombre";
  const ant = p.antagonistaInterno || "su propia negación";
  const modo =
    n.persona.polaridad === "activa"
      ? "empuja hacia afuera"
      : "se deja atravesar";
  return (
    `${n.station.nombre} · ${n.chakra.nombre} (${n.chakra.ritmo}): ` +
    `${suj} ${modo} bajo el signo de ${n.arcano}. ` +
    `${n.persona.etiqueta} opera sobre ${n.chakra.idx <= 2 ? sis : car}, ` +
    `mientras ${ant} marca el compás ${n.chakra.compas} a ${n.tempo} bpm.`
  );
}

export function exportFlow(story: FractalStory) {
  return {
    titulo: story.params.titulo,
    semilla: story.params.semilla,
    firma: story.seed.toString(16),
    parametros: story.params,
    flujo: story.flujo.map((n) => ({
      id: n.id,
      estacion: n.station.nombre,
      chakra: n.chakra.nombre,
      ritmo: n.chakra.ritmo,
      compas: n.chakra.compas,
      tempo: n.tempo,
      intensidad: Number(n.intensidad.toFixed(3)),
      disonancia: Number(n.disonancia.toFixed(3)),
      arcano: n.arcano,
      nodo_personalidad: n.persona.etiqueta,
      polaridad: n.persona.polaridad,
      eje: n.persona.base.eje,
      frase: beatSentence(n, story.params),
    })),
  };
}
