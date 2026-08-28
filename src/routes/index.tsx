import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FractalCanvas } from "@/components/FractalCanvas";
import {
  ARCANA,
  BASE_PERSONAS,
  CHAKRAS,
  GENRES,
  STATIONS,
  beatSentence,
  buildFractalStory,
  exportFlow,
  type FractalNode,
  type Genre,
  type StoryParams,
} from "@/lib/story-fractal";
import {
  echoBack,
  polarNode,
  roleOf,
  seedForward,
  simplifiedFlow,
  transitionsFrom,
} from "@/lib/narrative-theory";
import { exportFlowPdf } from "@/lib/pdf-flow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visualizador Fractal de Historias · Círculo del Héroe" },
      {
        name: "description",
        content:
          "Genera mandalas fractales de estructura y ritmo narrativo: 12 estaciones del círculo del héroe, mini-círculos de 7 chakras, 22 arcanos y 32 nodos de personalidad.",
      },
      { property: "og:title", content: "Visualizador Fractal de Historias" },
      {
        property: "og:description",
        content:
          "Flujos fractales de historias terminadas: arcanos, chakras y 32 nodos de personalidad en un campo tipo Mandelbrot ajustado a la narrativa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const DEFAULTS: StoryParams = {
  titulo: "El umbral de la sala 7",
  sistema: "una corporación de sueños regulados",
  protagonista: "una archivista de memorias ajenas",
  carencia: "un vacío que ningún logro llena",
  antagonistaInterno: "el miedo a ser vista sin función",
  genero: "iniciacion",
  semilla: "aleph-7",
  profundidad: 2,
  tension: 58,
  luz: 42,
  simetria: 12,
};

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-sm border border-border bg-input/40 px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary"
      />
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label} <span className="text-primary">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[var(--primary)]"
      />
    </label>
  );
}

function Page() {
  const [params, setParams] = useState<StoryParams>(DEFAULTS);
  const [selected, setSelected] = useState<FractalNode | null>(null);
  const [focus, setFocus] = useState<FractalNode | null>(null);
  const [showField, setShowField] = useState(true);
  const [animate, setAnimate] = useState(false);
  const [tab, setTab] = useState<"nodo" | "mapa" | "flujo" | "leyenda">("nodo");

  const story = useMemo(() => buildFractalStory(params), [params]);
  const set = <K extends keyof StoryParams>(k: K, v: StoryParams[K]) => {
    setParams((p) => ({ ...p, [k]: v }));
    setSelected(null);
    setFocus(null);
  };

  const mutar = () =>
    set(
      "semilla",
      Math.random().toString(36).slice(2, 9) + "-" + Date.now().toString(36).slice(-3),
    );

  const descargar = () => {
    const blob = new Blob([JSON.stringify(exportFlow(story), null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `flujo-fractal-${story.seed.toString(16)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <main className="min-h-screen text-foreground">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-lg tracking-[0.3em] text-primary">
          MANDALA FRACTAL NARRATIVO
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Estructura y ritmo · 12 estaciones · mini-círculos de 7 chakras · 22
          arcanos · 32 nodos de personalidad · firma {story.seed.toString(16)}
        </p>
      </header>

      <div className="grid gap-4 p-4 lg:grid-cols-[300px_1fr_330px]">
        {/* Parámetros */}
        <section className="panel space-y-3 rounded-md p-4">
          <h2 className="text-xs uppercase tracking-[0.25em] text-primary">
            Parámetros iniciales
          </h2>
          <Field label="Título" value={params.titulo} onChange={(v) => set("titulo", v)} />
          <Field label="Sistema" value={params.sistema} onChange={(v) => set("sistema", v)} />
          <Field
            label="Protagonista"
            value={params.protagonista}
            onChange={(v) => set("protagonista", v)}
          />
          <Field label="Carencia" value={params.carencia} onChange={(v) => set("carencia", v)} />
          <Field
            label="Antagonista interno"
            value={params.antagonistaInterno}
            onChange={(v) => set("antagonistaInterno", v)}
          />
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Género
            </span>
            <select
              value={params.genero}
              onChange={(e) => set("genero", e.target.value as Genre)}
              className="mt-1 w-full rounded-sm border border-border bg-input/40 px-2 py-1.5 text-sm outline-none focus:border-primary"
            >
              {GENRES.map((g) => (
                <option key={g} value={g} className="bg-card">
                  {g}
                </option>
              ))}
            </select>
          </label>
          <Field label="Semilla" value={params.semilla} onChange={(v) => set("semilla", v)} />

          <div className="space-y-2 pt-2">
            <Slider
              label="Profundidad fractal"
              min={1}
              max={4}
              value={params.profundidad}
              onChange={(v) => set("profundidad", v)}
            />
            <Slider
              label="Estaciones"
              min={3}
              max={12}
              value={params.simetria}
              onChange={(v) => set("simetria", v)}
            />
            <Slider
              label="Tensión"
              min={0}
              max={100}
              value={params.tension}
              onChange={(v) => set("tension", v)}
            />
            <Slider
              label="Luz"
              min={0}
              max={100}
              value={params.luz}
              onChange={(v) => set("luz", v)}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={mutar}
              className="rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition hover:opacity-90"
            >
              Mutar semilla
            </button>
            <button
              onClick={descargar}
              className="rounded-sm border border-border px-3 py-1.5 text-xs uppercase tracking-widest text-foreground transition hover:border-primary"
            >
              Exportar JSON
            </button>
            <button
              onClick={() => exportFlowPdf(story)}
              className="rounded-sm border border-primary/70 px-3 py-1.5 text-xs uppercase tracking-widest text-primary transition hover:bg-primary/10"
            >
              Exportar PDF
            </button>
          </div>
          <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-muted-foreground">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={showField}
                onChange={(e) => setShowField(e.target.checked)}
              />
              campo de escape
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={animate}
                onChange={(e) => setAnimate(e.target.checked)}
              />
              pulso
            </label>
          </div>
        </section>

        {/* Canvas */}
        <section className="panel relative min-h-[560px] overflow-hidden rounded-md">
          <FractalCanvas
            story={story}
            focus={focus}
            selected={selected}
            onPick={(n) => setSelected(n)}
            showField={showField}
            animate={animate}
          />
          <div className="pointer-events-none absolute left-3 top-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {focus ? `zoom · ${focus.label}` : "círculo completo"}
          </div>
          <div className="absolute bottom-3 left-3 flex gap-2">
            <button
              disabled={!selected || selected.children.length === 0}
              onClick={() => selected && setFocus(selected)}
              className="rounded-sm border border-border bg-card/70 px-2 py-1 text-[11px] uppercase tracking-widest disabled:opacity-30"
            >
              Entrar al nodo
            </button>
            <button
              disabled={!focus}
              onClick={() => setFocus(null)}
              className="rounded-sm border border-border bg-card/70 px-2 py-1 text-[11px] uppercase tracking-widest disabled:opacity-30"
            >
              Salir
            </button>
          </div>
        </section>

        {/* Inspector */}
        <section className="panel flex max-h-[80vh] flex-col rounded-md">
          <div className="flex border-b border-border">
            {(["nodo", "mapa", "flujo", "leyenda"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 px-2 py-2 text-[10px] uppercase tracking-[0.2em] ${
                  tab === t ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto p-4 text-sm">
            {tab === "nodo" &&
              (selected ? (
                <div className="space-y-3">
                  <h3 className="text-base text-primary">{selected.label}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selected.station.funcion}
                  </p>
                  <dl className="grid grid-cols-2 gap-2 text-xs">
                    <Info k="Arcano" v={selected.arcano} />
                    <Info
                      k="Chakra"
                      v={`${selected.chakra.nombre} · ${selected.chakra.sanscrito}`}
                    />
                    <Info k="Ritmo" v={selected.chakra.ritmo} />
                    <Info k="Compás" v={selected.chakra.compas} />
                    <Info k="Tempo" v={`${selected.tempo} bpm`} />
                    <Info
                      k="Intensidad"
                      v={`${Math.round(selected.intensidad * 100)}%`}
                    />
                    <Info
                      k="Disonancia"
                      v={`${Math.round(selected.disonancia * 100)}%`}
                    />
                    <Info k="Nivel" v={`profundidad ${selected.depth}`} />
                    <Info k="Nodo 32" v={selected.persona.etiqueta} />
                    <Info k="Eje" v={selected.persona.base.eje} />
                    <Info k="Polaridad" v={selected.persona.polaridad} />
                    <Info
                      k="Firma c"
                      v={`${selected.c.re.toFixed(3)}, ${selected.c.im.toFixed(3)}i`}
                    />
                  </dl>
                  <p className="rounded-sm border border-border bg-background/40 p-3 text-xs leading-relaxed">
                    {beatSentence(selected, params)}
                  </p>

                  <NodeSemantics
                    story={story}
                    node={selected}
                    params={params}
                    onGo={(n) => setSelected(n)}
                  />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Toca un nodo del mandala para leer su arcano, su chakra y su
                  nodo de personalidad.
                </p>
              ))}

            {tab === "mapa" && (
              <div className="space-y-4 text-xs">
                <p className="text-muted-foreground">
                  Flujo finito extraído de la matriz infinita: cuatro partes con
                  su rol dominante. Exportable a PDF.
                </p>
                {simplifiedFlow(story, params).map((part) => (
                  <div key={part.titulo} className="space-y-2">
                    <h4 className="uppercase tracking-[0.2em] text-primary">
                      {part.titulo}
                    </h4>
                    <p className="italic text-muted-foreground">{part.sintesis}</p>
                    {part.beats.map((b) => (
                      <div
                        key={b.titulo}
                        className="rounded-sm border border-border/60 p-2"
                      >
                        <div className="text-foreground">{b.titulo}</div>
                        <div className="text-[10px] uppercase tracking-widest text-primary/80">
                          {b.rol}
                        </div>
                        <p className="mt-1 leading-relaxed text-muted-foreground">
                          {b.linea}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
                <button
                  onClick={() => exportFlowPdf(story)}
                  className="w-full rounded-sm bg-primary px-3 py-2 text-[11px] uppercase tracking-widest text-primary-foreground"
                >
                  Descargar PDF del flujo
                </button>
              </div>
            )}

            {tab === "flujo" && (
              <ol className="space-y-2">
                {story.flujo.slice(0, 400).map((n, i) => (
                  <li key={n.id}>
                    <button
                      onClick={() => {
                        setSelected(n);
                        setTab("nodo");
                      }}
                      className="w-full rounded-sm border border-border/60 p-2 text-left text-[11px] transition hover:border-primary"
                    >
                      <span className="text-primary">
                        {String(i + 1).padStart(3, "0")}
                      </span>{" "}
                      {n.station.nombre} · {n.chakra.nombre} —{" "}
                      <span className="text-muted-foreground">
                        {n.arcano} / {n.persona.etiqueta} / {n.tempo}bpm
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            )}

            {tab === "leyenda" && (
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="mb-1 uppercase tracking-[0.2em] text-primary">
                    7 chakras / ritmo
                  </h4>
                  <ul className="space-y-1">
                    {CHAKRAS.map((c) => (
                      <li key={c.idx} className="flex items-center gap-2">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ background: `hsl(${c.hue} 90% 62%)` }}
                        />
                        {c.nombre} · {c.sanscrito} — {c.ritmo} ({c.compas})
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-1 uppercase tracking-[0.2em] text-primary">
                    12 estaciones
                  </h4>
                  <p className="text-muted-foreground">
                    {STATIONS.map((s) => s.nombre).join(" · ")}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 uppercase tracking-[0.2em] text-primary">
                    16 nodos base × 2 polaridades = 32
                  </h4>
                  <p className="text-muted-foreground">
                    {BASE_PERSONAS.map((b) => b.nombre).join(" · ")}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Relleno = expresión activa; hueco = expresión receptiva.
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 uppercase tracking-[0.2em] text-primary">
                    22 arcanos
                  </h4>
                  <p className="text-muted-foreground">{ARCANA.join(" · ")}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        {k}
      </dt>
      <dd className="text-foreground">{v}</dd>
    </div>
  );
}

function NodeSemantics({
  story,
  node,
  params,
  onGo,
}: {
  story: ReturnType<typeof buildFractalStory>;
  node: FractalNode;
  params: StoryParams;
  onGo: (n: FractalNode) => void;
}) {
  const rol = roleOf(node, params);
  const opuesto = polarNode(story, node);
  const trans = transitionsFrom(story, node, params, 5);

  return (
    <div className="space-y-3 text-xs">
      <div className="rounded-sm border border-primary/40 bg-primary/5 p-3">
        <div className="text-[9px] uppercase tracking-[0.2em] text-primary">
          Papel en la historia · {rol.tipo}
        </div>
        <p className="mt-1 text-foreground">{rol.nombre}</p>
        <p className="mt-1 leading-relaxed text-muted-foreground">
          {rol.descripcion}
        </p>
        <dl className="mt-2 grid grid-cols-2 gap-2">
          <Info k="Función" v={rol.arcano.funcion} />
          <Info k="Valor en juego" v={rol.valorEnJuego} />
          <Info k="Plano" v={rol.plano.nombre} />
          <Info k="Carga polar" v={rol.cargaPolar} />
          <Info k="Arcano opuesto" v={`${rol.opuesto.nombre} — ${rol.opuesto.concepto}`} />
        </dl>
      </div>

      {opuesto && (
        <button
          onClick={() => onGo(opuesto)}
          className="w-full rounded-sm border border-border p-2 text-left transition hover:border-primary"
        >
          <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Opuesto polar (otro plano)
          </div>
          <div className="text-foreground">
            {opuesto.station.nombre} · {opuesto.chakra.nombre} — {opuesto.arcano}
          </div>
          <div className="text-muted-foreground">
            {opuesto.persona.etiqueta} · {planeOf(opuesto).nombre.toLowerCase()}
          </div>
        </button>
      )}

      <div>
        <div className="mb-1 text-[9px] uppercase tracking-[0.2em] text-primary">
          Transiciones posibles
        </div>
        <ul className="space-y-1">
          {trans.map((t) => (
            <li key={t.target.id}>
              <button
                onClick={() => onGo(t.target)}
                className="w-full rounded-sm border border-border/60 p-2 text-left transition hover:border-primary"
              >
                <span className="text-primary">{t.operador}</span>{" "}
                <span className="text-muted-foreground">
                  ({Math.round(t.peso * 100)}%)
                </span>
                <p className="mt-1 leading-relaxed text-muted-foreground">
                  {t.texto}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-sm border border-border/60 p-2">
        <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Efecto hacia atrás
        </div>
        <p className="mt-1 leading-relaxed">{echoBack(story, node, params)}</p>
      </div>
      <div className="rounded-sm border border-border/60 p-2">
        <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Siembra hacia adelante
        </div>
        <p className="mt-1 leading-relaxed">{seedForward(story, node, params)}</p>
      </div>
    </div>
  );
}
