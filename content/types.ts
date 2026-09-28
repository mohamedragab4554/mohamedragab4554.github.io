export type Metric = {
  value: string;
  label: string;
  /** Short qualifier shown under the label, e.g. dataset or split. */
  context?: string;
  /** Local evidence path (kept for traceability; shown in the Evidence panel). */
  source: string;
};

export type Figure = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  /** Wide figures span the full gallery width. */
  wide?: boolean;
};

export type ChartSeries = { name: string; values: number[] };

export type Chart =
  | {
      kind: "grouped-bar";
      title: string;
      subtitle?: string;
      categories: string[];
      series: ChartSeries[];
      max?: number;
      format?: "fixed2" | "fixed3" | "percent" | "int";
      unit?: string;
      source: string;
      note?: string;
    }
  | {
      kind: "hbar";
      title: string;
      subtitle?: string;
      categories: string[];
      series: ChartSeries[];
      max?: number;
      format?: "fixed2" | "fixed3" | "percent" | "int";
      source: string;
      note?: string;
      /** Draw a vertical reference line (e.g. a mean). */
      reference?: { value: number; label: string };
    }
  | {
      kind: "line";
      title: string;
      subtitle?: string;
      x: number[];
      xLabel: string;
      series: ChartSeries[];
      min?: number;
      max?: number;
      format?: "fixed2" | "fixed3";
      source: string;
      note?: string;
      highlight?: { x: number; label: string };
    };

export type PipelineStep = { title: string; detail: string };

export type Project = {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  context: string; // organisation / setting
  period: string;
  role: string;
  summary: string;
  hero: Figure;
  challenge: string[];
  whatIDid: string[];
  approach: PipelineStep[];
  tools: string[];
  metrics: Metric[];
  charts: Chart[];
  results: string[];
  relevance: string[];
  gallery: Figure[];
  honestNotes?: string[];
  links?: { label: string; href: string }[];
  sources: string[];
  /** Displayed confidentiality note. */
  disclosure?: string;
};
