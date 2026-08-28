/**
 * narrative-theory.ts
 * Capa semántica: traduce arcanos / chakras / nodos de personalidad
 * a CONCEPTOS NARRATIVOS concretos (personaje, objeto, lugar, tema, fuerza),
 * define opuestos polares en distintos planos, transiciones posibles entre
 * nodos y el eco hacia atrás / siembra hacia adelante.
 *
 * Objetivo: producir flujos finitos dentro de la matriz infinita.
 */

import {
  ARCANA,
  CHAKRAS,
  hashSeed,
  mulberry32,
  type FractalNode,
  type FractalStory,
  type StoryParams,
} from "./story-fractal";

export type RoleKind = "personaje" | "objeto" | "lugar" | "tema" | "fuerza";

export interface ArcanaMeaning {
  idx: number;
  nombre: string;
  rol: RoleKind;
  concepto: string;
  funcion: string; // función narrativa (Propp / Campbell / McKee mezclados)
  valor: string; // eje de valor que se juega (positivo/negativo)
}

/** 22 arcanos con rol narrativo, concepto y eje de valor. */
export const ARCANA_MEANING: ArcanaMeaning[] = [
  ["personaje", "el que parte sin mapa", "Detonante / entrada al relato", "libertad ↔ inconsciencia"],
  ["personaje", "el operador de recursos", "Habilitador de la acción", "poder ↔ manipulación"],
  ["lugar", "el umbral del secreto", "Guardián de la información oculta", "saber ↔ silencio"],
  ["lugar", "el territorio fértil", "Espacio de gestación y cuidado", "abundancia ↔ asfixia"],
  ["personaje", "la autoridad que ordena", "Establece la ley del mundo", "estructura ↔ tiranía"],
  ["tema", "la tradición heredada", "Transmisión de las reglas", "sentido ↔ dogma"],
  ["tema", "la elección vinculante", "Dilema que define el carácter", "unión ↔ escisión"],
  ["objeto", "el vehículo del impulso", "Traslada al héroe al conflicto", "dirección ↔ atropello"],
  ["tema", "el dominio interior", "Prueba de temple", "coraje ↔ violencia"],
  ["lugar", "el retiro de la lámpara", "Aislamiento que revela", "lucidez ↔ aislamiento"],
  ["fuerza", "el giro del azar", "Reversión del destino", "oportunidad ↔ arbitrariedad"],
  ["tema", "la medida exacta", "Juicio y consecuencia", "verdad ↔ castigo"],
  ["fuerza", "la suspensión del acto", "Inversión del punto de vista", "entrega ↔ parálisis"],
  ["fuerza", "el corte irreversible", "Fin de una forma", "transformación ↔ pérdida"],
  ["objeto", "el recipiente que mezcla", "Síntesis de opuestos", "equilibrio ↔ tibieza"],
  ["personaje", "el pacto que ata", "Antagonista del deseo", "vitalidad ↔ adicción"],
  ["lugar", "la estructura que cae", "Crisis estructural", "revelación ↔ ruina"],
  ["objeto", "la señal lejana", "Esperanza operativa", "guía ↔ ilusión"],
  ["lugar", "el camino de la niebla", "Territorio del engaño", "intuición ↔ confusión"],
  ["objeto", "la fuente de luz", "Claridad y exposición", "verdad ↔ exceso"],
  ["fuerza", "el llamado a rendir cuentas", "Reconocimiento del pasado", "redención ↔ condena"],
  ["tema", "el círculo cerrado", "Integración final", "totalidad ↔ clausura"],
].map(([rol, concepto, funcion, valor], i) => ({
  idx: i,
  nombre: ARCANA[i]!,
  rol: rol as RoleKind,
  concepto: concepto!,
  funcion: funcion!,
  valor: valor!,
}));

/** El opuesto polar de un arcano en la rueda de 22. */
export function arcanaOpposite(idx: number): ArcanaMeaning {
  return ARCANA_MEANING[(idx + 11) % 22]!;
}

/* ------------------------------------------------------------ planos */

export interface Plane {
  id: string;
  nombre: string;
  polo: string;
  contrapolo: string;
  chakras: number[];
}

/** Planos donde se miden los opuestos: cada nodo vive en uno. */
export const PLANES: Plane[] = [
  { id: "materia", nombre: "Plano material", polo: "supervivencia", contrapolo: "desarraigo", chakras: [0] },
  { id: "deseo", nombre: "Plano del deseo", polo: "apetito", contrapolo: "renuncia", chakras: [1] },
  { id: "voluntad", nombre: "Plano de la voluntad", polo: "acción", contrapolo: "sometimiento", chakras: [2] },
  { id: "vinculo", nombre: "Plano del vínculo", polo: "entrega", contrapolo: "abandono", chakras: [3] },
  { id: "lenguaje", nombre: "Plano del lenguaje", polo: "verdad dicha", contrapolo: "mentira útil", chakras: [4] },
  { id: "vision", nombre: "Plano de la visión", polo: "comprensión", contrapolo: "delirio", chakras: [5] },
  { id: "sentido", nombre: "Plano del sentido", polo: "trascendencia", contrapolo: "vacío", chakras: [6] },
];

export function planeOf(node: FractalNode): Plane {
  return PLANES.find((p) => p.chakras.includes(node.chakra.idx)) ?? PLANES[0]!;
}

/* --------------------------------------------------- rol concreto del nodo */

export interface NodeRole {
  tipo: RoleKind;
  nombre: string; // el elemento concreto en la historia
  descripcion: string;
  arcano: ArcanaMeaning;
  opuesto: ArcanaMeaning;
  plano: Plane;
  valorEnJuego: string;
  cargaPolar: string; // cómo se expresa el opuesto en este plano
}

const NOUN_BY_ROLE: Record<RoleKind, string[]> = {
  personaje: ["una figura", "un testigo", "una voz", "un doble", "un heredero"],
  objeto: ["un objeto", "una prenda", "un registro", "una llave", "una herramienta"],
  lugar: ["un recinto", "un pasaje", "una sala", "un límite", "un archivo"],
  tema: ["una idea fija", "una deuda", "un pacto", "una pregunta", "una regla"],
  fuerza: ["una corriente", "una presión", "un derrumbe", "una atracción", "un corte"],
};

export function roleOf(node: FractalNode, p: StoryParams): NodeRole {
  const arcano = ARCANA_MEANING[node.arcanoIdx]!;
  const opuesto = arcanaOpposite(node.arcanoIdx);
  const plano = planeOf(node);
  const rnd = mulberry32(hashSeed(node.id + arcano.nombre + p.semilla));
  const nouns = NOUN_BY_ROLE[arcano.rol];
  const noun = nouns[Math.floor(rnd() * nouns.length)]!;
  const activo = node.persona.polaridad === "activa";

  const nombre = `${noun} que encarna ${arcano.concepto}`;
  const descripcion =
    `En ${node.station.nombre.toLowerCase()}, ${arcano.funcion.toLowerCase()} aparece como ${arcano.rol}: ` +
    `${nombre}. Se mide en el ${plano.nombre.toLowerCase()} entre ${plano.polo} y ${plano.contrapolo}, ` +
    `y ${activo ? "empuja el conflicto hacia afuera" : "absorbe el conflicto hacia adentro"} ` +
    `con el ritmo de ${node.chakra.ritmo.toLowerCase()} (${node.chakra.compas}).`;

  return {
    tipo: arcano.rol,
    nombre,
    descripcion,
    arcano,
    opuesto,
    plano,
    valorEnJuego: arcano.valor,
    cargaPolar: activo
      ? `${plano.polo} exigido / ${plano.contrapolo} negado`
      : `${plano.contrapolo} sufrido / ${plano.polo} deseado`,
  };
}

/* --------------------------------------------------- opuesto polar del nodo */

/** El nodo antípoda: estación opuesta, chakra espejado, polaridad invertida. */
export function polarNode(story: FractalStory, node: FractalNode): FractalNode | null {
  const n = story.root.length;
  if (!n) return null;
  const stIdx = node.station.idx;
  const oppStation = story.root[(stIdx + Math.floor(n / 2)) % n];
  if (!oppStation) return null;
  if (node.depth === 0) return oppStation;
  const mirror = 6 - node.chakra.idx;
  return oppStation.children[mirror] ?? oppStation;
}

/* --------------------------------------------------------- transiciones */

export const OPERADORES = [
  { id: "escalada", texto: "sube la apuesta: lo mismo, pero con más costo" },
  { id: "inversión", texto: "invierte el valor: lo que servía ahora daña" },
  { id: "revelación", texto: "revela información que reordena lo anterior" },
  { id: "pago", texto: "cobra una deuda sembrada antes" },
  { id: "eco", texto: "repite una imagen previa con otra carga" },
  { id: "ruptura", texto: "quiebra el ritmo y deja un hueco" },
  { id: "fusión", texto: "une dos líneas que iban separadas" },
  { id: "sacrificio", texto: "exige entregar algo para poder seguir" },
] as const;

export interface Transition {
  target: FractalNode;
  operador: string;
  motivo: string;
  peso: number; // 0..1 probabilidad narrativa
  texto: string;
}

function pickOperador(a: FractalNode, b: FractalNode) {
  const dt = b.tempo - a.tempo;
  const dd = b.disonancia - a.disonancia;
  const di = b.intensidad - a.intensidad;
  if (dd > 0.25) return OPERADORES[5]!;
  if (di > 0.25) return OPERADORES[0]!;
  if (a.persona.polaridad !== b.persona.polaridad && di < 0) return OPERADORES[1]!;
  if (b.chakra.idx >= 5) return OPERADORES[2]!;
  if (b.station.idx < a.station.idx) return OPERADORES[3]!;
  if (Math.abs(dt) < 8) return OPERADORES[4]!;
  if (b.arcanoIdx === (a.arcanoIdx + 11) % 22) return OPERADORES[7]!;
  return OPERADORES[6]!;
}

/** Todo nodo puede conectar con todo nodo: se listan las conexiones más cargadas. */
export function transitionsFrom(
  story: FractalStory,
  node: FractalNode,
  p: StoryParams,
  limit = 5,
): Transition[] {
  const pool = story.flujo.length ? story.flujo : story.root;
  const scored = pool
    .filter((n) => n.id !== node.id)
    .map((n) => {
      const dArc = Math.min(
        Math.abs(n.arcanoIdx - node.arcanoIdx),
        22 - Math.abs(n.arcanoIdx - node.arcanoIdx),
      );
      const afinidad =
        1 -
        dArc / 11 * 0.35 -
        Math.abs(n.chakra.idx - node.chakra.idx) / 6 * 0.25 -
        Math.abs(n.station.idx - node.station.idx) / 12 * 0.2;
      const contraste =
        (n.persona.polaridad !== node.persona.polaridad ? 0.18 : 0) +
        Math.abs(n.disonancia - node.disonancia) * 0.15;
      return { n, peso: Math.max(0, Math.min(1, afinidad + contraste)) };
    })
    .sort((a, b) => b.peso - a.peso)
    .slice(0, limit);

  return scored.map(({ n, peso }) => {
    const op = pickOperador(node, n);
    const rolA = roleOf(node, p);
    const rolB = roleOf(n, p);
    return {
      target: n,
      operador: op.id,
      motivo: op.texto,
      peso,
      texto:
        `${node.station.nombre}·${node.chakra.nombre} → ${n.station.nombre}·${n.chakra.nombre}: ` +
        `${rolA.tipo} «${rolA.arcano.concepto}» ${op.texto}, y reaparece como ${rolB.tipo} ` +
        `«${rolB.arcano.concepto}» en el ${rolB.plano.nombre.toLowerCase()}.`,
    };
  });
}

/* -------------------------------------------------- eco atrás / siembra adelante */

export function echoBack(story: FractalStory, node: FractalNode, p: StoryParams): string {
  const idx = story.flujo.findIndex((n) => n.id === node.id);
  const prev = idx > 0 ? story.flujo[Math.max(0, idx - 7)] : story.root[0];
  if (!prev) return "Sin antecedente: este nodo funda la serie.";
  const r = roleOf(prev, p);
  const rn = roleOf(node, p);
  return (
    `Resignifica ${prev.station.nombre}·${prev.chakra.nombre}: lo que allí era ${r.tipo} ` +
    `(«${r.arcano.concepto}», ${r.valorEnJuego}) queda leído de nuevo como ${rn.tipo}. ` +
    `El costo que parecía menor se vuelve la causa de ${node.station.funcion.toLowerCase()}.`
  );
}

export function seedForward(story: FractalStory, node: FractalNode, p: StoryParams): string {
  const idx = story.flujo.findIndex((n) => n.id === node.id);
  const next = story.flujo[Math.min(story.flujo.length - 1, Math.max(0, idx) + 11)];
  const pol = polarNode(story, node);
  const rn = roleOf(node, p);
  const rf = next ? roleOf(next, p) : rn;
  return (
    `Siembra: ${rn.tipo} «${rn.arcano.concepto}» debe volver en ` +
    `${next ? `${next.station.nombre}·${next.chakra.nombre}` : "el cierre"} como ${rf.tipo} ` +
    `«${rf.arcano.concepto}». Su opuesto polar ${pol ? `(${pol.station.nombre}·${pol.chakra.nombre})` : ""} ` +
    `sostiene la tensión: sin él este nodo no significa nada.`
  );
}

/* ------------------------------------------------ flujo simplificado por partes */

export interface FlowPart {
  titulo: string;
  sintesis: string;
  beats: { titulo: string; rol: string; linea: string }[];
}

const PART_NAMES = ["I · Planteo", "II · Ruptura", "III · Descenso", "IV · Retorno"];

export function simplifiedFlow(story: FractalStory, p: StoryParams): FlowPart[] {
  const stations = story.root;
  const per = Math.max(1, Math.ceil(stations.length / 4));
  const parts: FlowPart[] = [];
  for (let i = 0; i < Math.min(4, Math.ceil(stations.length / per)); i++) {
    const group = stations.slice(i * per, (i + 1) * per);
    if (!group.length) continue;
    const beats = group.map((st) => {
      const kids = st.children.length ? st.children : [st];
      const clave = kids.reduce((a, b) => (b.intensidad > a.intensidad ? b : a), kids[0]!);
      const r = roleOf(clave, p);
      return {
        titulo: `${st.station.nombre} — ${st.station.funcion}`,
        rol: `${r.tipo.toUpperCase()}: ${r.nombre} (${clave.arcano})`,
        linea:
          `${p.protagonista || "El protagonista"} atraviesa ${st.station.nombre.toLowerCase()} en el ` +
          `${r.plano.nombre.toLowerCase()}: ${r.cargaPolar}. Ritmo ${clave.chakra.ritmo.toLowerCase()} ` +
          `(${clave.chakra.compas}, ${clave.tempo} bpm), tensión ${Math.round(clave.disonancia * 100)}%. ` +
          `Valor en juego: ${r.valorEnJuego}.`,
      };
    });
    const dom = group[0]!;
    parts.push({
      titulo: PART_NAMES[i] ?? `Parte ${i + 1}`,
      sintesis:
        `Del ${group[0]!.station.nombre.toLowerCase()} al ${group[group.length - 1]!.station.nombre.toLowerCase()}. ` +
        `Eje: ${planeOf(dom).nombre.toLowerCase()} — ${planeOf(dom).polo} contra ${planeOf(dom).contrapolo}. ` +
        `${p.antagonistaInterno || "La negación interna"} marca el compás.`,
      beats,
    });
  }
  return parts;
}

/** Matriz de conexión: densidad de relación entre chakras (planos) del flujo. */
export function planeMatrix(story: FractalStory): number[][] {
  const m = CHAKRAS.map(() => CHAKRAS.map(() => 0));
  const f = story.flujo;
  for (let i = 0; i < f.length - 1; i++) {
    const a = f[i]!.chakra.idx;
    const b = f[i + 1]!.chakra.idx;
    m[a]![b]! += 1;
  }
  return m;
}
