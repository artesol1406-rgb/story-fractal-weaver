import { jsPDF } from "jspdf";
import type { FractalStory } from "./story-fractal";
import { simplifiedFlow, roleOf, transitionsFrom, polarNode } from "./narrative-theory";

/** Exporta el flujo simplificado (partes → beats → roles) como PDF. */
export function exportFlowPdf(story: FractalStory) {
  const p = story.params;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const M = 56;
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  let y = M;

  const nl = (h: number) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const text = (
    s: string,
    size: number,
    style: "normal" | "bold" | "italic",
    color: [number, number, number],
    gap = 6,
  ) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(s, W - M * 2) as string[];
    for (const line of lines) {
      nl(size + 3);
      doc.text(line, M, y);
      y += size + 3;
    }
    y += gap;
  };

  text((p.titulo || "Historia sin título").toUpperCase(), 20, "bold", [20, 20, 30], 2);
  text(
    `Mapa narrativo fractal · género ${p.genero} · semilla "${p.semilla}" · firma ${story.seed.toString(16)}`,
    9,
    "italic",
    [120, 120, 130],
    10,
  );
  text(
    `Sistema: ${p.sistema}\nProtagonista: ${p.protagonista}\nCarencia: ${p.carencia}\nAntagonista interno: ${p.antagonistaInterno}\nParámetros: ${p.simetria} estaciones · profundidad ${p.profundidad} · tensión ${p.tension} · luz ${p.luz}`,
    10,
    "normal",
    [50, 50, 60],
    14,
  );

  doc.setDrawColor(200, 180, 120);
  nl(10);
  doc.line(M, y, W - M, y);
  y += 18;

  for (const part of simplifiedFlow(story, p)) {
    text(part.titulo, 14, "bold", [150, 110, 30], 2);
    text(part.sintesis, 9.5, "italic", [90, 90, 100], 8);
    for (const b of part.beats) {
      text(b.titulo, 11, "bold", [25, 25, 35], 1);
      text(b.rol, 9, "italic", [110, 80, 20], 2);
      text(b.linea, 9.5, "normal", [45, 45, 55], 8);
    }
    y += 6;
  }

  // Anexo: nodos clave, opuestos y transiciones
  doc.addPage();
  y = M;
  text("ANEXO · OPUESTOS Y TRANSICIONES", 14, "bold", [20, 20, 30], 8);
  const claves = story.root.map((st) => {
    const kids = st.children.length ? st.children : [st];
    return kids.reduce((a, b) => (b.intensidad > a.intensidad ? b : a), kids[0]!);
  });
  for (const n of claves) {
    const r = roleOf(n, p);
    const op = polarNode(story, n);
    const tr = transitionsFrom(story, n, p, 2);
    text(`${n.station.nombre} · ${n.chakra.nombre} — ${n.arcano}`, 10.5, "bold", [25, 25, 35], 1);
    text(
      `${r.tipo}: ${r.nombre}. Plano ${r.plano.nombre.toLowerCase()} (${r.cargaPolar}). Valor: ${r.valorEnJuego}. ` +
        `Opuesto polar: ${op ? `${op.station.nombre}·${op.chakra.nombre} (${op.arcano})` : "—"}.`,
      9,
      "normal",
      [50, 50, 60],
      2,
    );
    for (const t of tr) text(`→ ${t.operador}: ${t.texto}`, 8.5, "italic", [95, 95, 105], 1);
    y += 6;
  }

  doc.save(`flujo-${(p.titulo || "historia").toLowerCase().replace(/\s+/g, "-")}-${story.seed.toString(16)}.pdf`);
}
