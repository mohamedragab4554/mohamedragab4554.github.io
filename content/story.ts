/**
 * Storytelling data for the interactive layer: project accents, input data,
 * before/after pairs, the inference viewer, the systems map and the programme timeline.
 * Every image referenced here is a real input or model output (see manifest-interactive.json).
 */

export type Accent = { onDark: string; onLight: string; tint: string; name: string };

export const accents: Record<string, Accent> = {
  "concrete-defect-detection": { name: "Crack", onDark: "#F0A35E", onLight: "#A5521B", tint: "#FBEBDD" },
  "aecai-inspection-platform": { name: "Product", onDark: "#5FD3CD", onLight: "#0B6E6B", tint: "#DDF1EF" },
  "structural-drawing-understanding": { name: "Blueprint", onDark: "#8EA6F5", onLight: "#3050B4", tint: "#E3E9FB" },
  "scan-to-bim": { name: "Point cloud", onDark: "#B9A6F6", onLight: "#5B43C0", tint: "#ECE7FC" },
  "water-tank-digital-twin": { name: "Asset", onDark: "#6CC0EC", onLight: "#1A6798", tint: "#DFF0FA" },
  "brinell-building-bim": { name: "BIM", onDark: "#E0C36A", onLight: "#7A5C0A", tint: "#F6EFD6" },
};

export type InputItem = { label: string; detail: string };
export type ComparePair = {
  before: { src: string; label: string };
  after: { src: string; label: string };
  width: number;
  height: number;
  caption: string;
  industry?: boolean;
};

export const inputs: Record<string, InputItem[]> = {
  "concrete-defect-detection": [
    { label: "Crack-Seg benchmark", detail: "3,717 train · 112 val · 200 test images, 416 × 416" },
    { label: "DACL10k", detail: "9,920 bridge-inspection images, 18 defect classes, polygon masks" },
    { label: "Industry site photos", detail: "689 images from live projects in Belfast: pipes, coatings, shadows" },
    { label: "Practitioner survey", detail: "21 professionals across the UK, KSA, UAE and Egypt" },
  ],
  "aecai-inspection-platform": [
    { label: "Inspection photos", detail: "Uploaded per location and element by inspectors" },
    { label: "Structured forms", detail: "Floors, elements and condition fields from the form builder" },
    { label: "Model weights", detail: "Crack, spalling and exposed-rebar U-Nets on a model hub" },
  ],
  "structural-drawing-understanding": [
    { label: "Public plan datasets", detail: "Structural and architectural plans in COCO, YOLO and SVG formats" },
    { label: "Unified training set", detail: "21,009 / 2,516 / 2,569 tiles, 8 element classes" },
    { label: "Annotated project sheets", detail: "QA'd in CVAT: labels bound to their elements" },
  ],
  "scan-to-bim": [
    { label: "Site laser scan", detail: "~264 M points, 7.7 GB PLY, single storey (anonymised)" },
    { label: "Public benchmark", detail: "Kladno station point cloud" },
    { label: "Synthetic interior", detail: "207k labelled points for semantic segmentation tests" },
  ],
  "water-tank-digital-twin": [
    { label: "AECOM drawings", detail: "2D drawings of the tank, modelled in Revit" },
    { label: "Crack images", detail: "Public RC-wall crack datasets (Mendeley, Utah State), 80/10/10 split" },
    { label: "Design standard", detail: "EN 1992-1-1 Table 7.1N crack-width limits" },
  ],
  "brinell-building-bim": [
    { label: "PDF drawings", detail: "General arrangements, basement to level 7, and elevations" },
    { label: "Information requirements", detail: "EIR and BEP templates (CIC BIM Protocol, CPIx)" },
    { label: "Discipline models", detail: "Architecture, structure and MEP in Revit" },
  ],
};

export const compares: Record<string, ComparePair[]> = {
  "structural-drawing-understanding": [
    {
      before: { src: "/images/compare/drawings-labels.webp", label: "Ground truth" },
      after: { src: "/images/compare/drawings-pred.webp", label: "Model prediction" },
      width: 1100, height: 1100,
      caption: "Validation tiles from public floor-plan datasets: annotated elements vs the 8-class model's masks. Drag to compare.",
    },
  ],
  "scan-to-bim": [
    {
      before: { src: "/images/compare/scan-raw.webp", label: "Raw scan" },
      after: { src: "/images/compare/scan-labelled.webp", label: "Class-labelled (ground truth)" },
      width: 1300, height: 1196,
      caption: "Synthetic building interior: the unlabelled scan against its class-labelled version (walls, floor, ceiling, doors, columns).",
    },
  ],
  "water-tank-digital-twin": [
    {
      before: { src: "/images/compare/tank-crack-image.webp", label: "Crack photo" },
      after: { src: "/images/compare/tank-crack-mask.webp", label: "Pixel mask" },
      width: 319, height: 315,
      caption: "Training pair from a public RC crack dataset: the photograph and the binary mask used to estimate crack width.",
    },
  ],
};

/** Inference viewer: the same site photo through three models (MSc external validation set). */
export const inferenceLayers = [
  { key: "yolo11x", name: "YOLO11x-seg", note: "Best field recall (14 of 15 cracked images). Also flags some pipes and frames." },
  { key: "unet", name: "U-Net · ResNet-50", note: "Cleanest crack morphology (mIoU 0.630). Suited to width and area measurement." },
  { key: "multi", name: "FPN · EfficientNet-B4", note: "18 defect classes at once. Each colour is a class from the DACL10k scheme." },
  { key: "mask", name: "U-Net binary mask", note: "The pixel map that downstream measurement works from." },
] as const;

export const inferenceImages = [
  { id: "20250220_092206", title: "Beam soffit by a window", look: "YOLO11x-seg marks the window mullions; U-Net keeps to the crack on the beam." },
  { id: "20250220_083026", title: "Wall behind a service pipe", look: "The main crack runs behind the pipe. Compare how each model handles the occlusion." },
  { id: "IMG_3442", title: "Wide branching crack", look: "A wide crack with branches through painted plaster. Compare how much of each branch the models recover." },
  { id: "20250220_100459", title: "Soffit with flaking paint", look: "Fine hairline cracks among peeling coating: the case that exposes false positives." },
];

/* ---------------- systems map ---------------- */
export type MapNode = { id: string; col: 0 | 1 | 2; label: string; detail: string };
export const mapNodes: MapNode[] = [
  { id: "photos", col: 0, label: "Site & inspection photos", detail: "Concrete surfaces, often cluttered with pipes, cables and coatings" },
  { id: "drawings", col: 0, label: "Structural drawings", detail: "Large plan sheets with thin, repetitive elements" },
  { id: "scans", col: 0, label: "Laser scans", detail: "Hundreds of millions of points, with temporary works" },
  { id: "pdfs", col: 0, label: "2D drawings & requirements", detail: "PDF/CAD sets, EIR and BEP" },
  { id: "seg", col: 1, label: "Detection & segmentation", detail: "YOLO-seg · U-Net · FPN, tiled inference, TTA" },
  { id: "tiles", col: 1, label: "Tiled instance segmentation", detail: "640 px tiles, rotation TTA, geometry rules" },
  { id: "geom", col: 1, label: "Geometry classification", detail: "Density contours, PCA, connected components" },
  { id: "bim", col: 1, label: "Modelling & automation", detail: "Revit, Dynamo, pyRevit, Navisworks" },
  { id: "findings", col: 2, label: "Engineer-reviewed findings", detail: "Defects with geometry and confidence, signed off by an engineer" },
  { id: "elements", col: 2, label: "Structured element data", detail: "Columns, beams, walls and openings as data" },
  { id: "ifc", col: 2, label: "Verified IFC models", detail: "IfcSlab · IfcWall · IfcColumn traced to real points" },
  { id: "twin", col: 2, label: "Dashboards & digital twins", detail: "Power BI with 3D models and condition data" },
];

export const mapRoutes: { project: string; path: string[] }[] = [
  { project: "concrete-defect-detection", path: ["photos", "seg", "findings"] },
  { project: "aecai-inspection-platform", path: ["photos", "seg", "findings"] },
  { project: "water-tank-digital-twin", path: ["photos", "seg", "twin"] },
  { project: "water-tank-digital-twin", path: ["pdfs", "bim", "twin"] },
  { project: "structural-drawing-understanding", path: ["drawings", "tiles", "elements"] },
  { project: "scan-to-bim", path: ["scans", "geom", "ifc"] },
  { project: "brinell-building-bim", path: ["pdfs", "bim", "twin"] },
];

/* ---------------- programme timeline (construction-programme style) ---------------- */
export type Bar = { lane: "Education" | "Engineering" | "AI & digital"; label: string; from: number; to: number; detail: string; href?: string; row?: number; side?: "in" | "left" | "right"; short?: string };
// dates as decimal years; "to" of an ongoing role is the build date
const NOW = 2026.75;
export const programme: { start: number; end: number; bars: Bar[] } = {
  start: 2018,
  end: 2027,
  bars: [
    { lane: "Education", label: "BSc Civil Engineering", from: 2018.75, to: 2023.5, detail: "Higher Technological Institute · GPA 3.24 · graduation project A+" },
    { lane: "Education", label: "MSc Digital Construction & BIM", from: 2024.7, to: 2025.7, detail: "Ulster University · Distinction", href: "/research/" },
    { lane: "Engineering", label: "Redcon", side: "right", from: 2021.7, to: 2021.8, detail: "Site internship: piles, slump tests, load tests" },
    { lane: "Engineering", label: "DME", side: "left", from: 2023.5, to: 2023.6, detail: "Planning internship: Primavera P6, BOQ" },
    { lane: "Engineering", label: "National Consulting Engineers", short: "NCE", side: "in", from: 2023.7, to: 2024.7, detail: "115+ structural & façade design packages" },
    { lane: "AI & digital", label: "Brinell BIM", side: "left", row: 0, from: 2024.7, to: 2025.05, detail: "Federated Revit models, clash detection, Power BI", href: "/projects/brinell-building-bim/" },
    { lane: "AI & digital", label: "AECOM × Ulster", side: "left", row: 1, from: 2025.1, to: 2025.4, detail: "Crack detection → Revit → Power BI · 80%", href: "/projects/water-tank-digital-twin/" },
    { lane: "AI & digital", label: "Dissertation", side: "left", row: 2, from: 2025.4, to: 2025.7, detail: "YOLO vs U-Net multi-defect detection, field validated", href: "/projects/concrete-defect-detection/" },
    { lane: "AI & digital", label: "AECAI · CTO", side: "left", row: 0, from: 2025.92, to: NOW, detail: "Inspection AI platform, model to product", href: "/projects/aecai-inspection-platform/" },
    { lane: "AI & digital", label: "AGECS R&D", from: 2026.25, to: NOW, detail: "Drawing understanding and Scan-to-BIM", href: "/projects/structural-drawing-understanding/", row: 1, side: "left" },
  ],
};
