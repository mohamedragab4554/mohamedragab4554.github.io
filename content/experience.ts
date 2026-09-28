export type Role = {
  role: string;
  org: string;
  orgGeneric: string; // used when profile.showEmployerNames is false
  place: string;
  period: string;
  kind: "AI & digital" | "Engineering" | "Industry project";
  summary: string;
  bullets: string[];
  tools: string[];
  projectSlugs?: string[];
  source: string;
};

export const experience: Role[] = [
  {
    role: "R&D AI-Construction Specialist",
    org: "AGECS",
    orgGeneric: "Construction-technology R&D firm",
    place: "Remote",
    period: "Apr 2026 – Present",
    kind: "AI & digital",
    summary: "Applied R&D turning structural drawings and laser scans into structured, BIM-ready data.",
    bullets: [
      "Column detector on plans: mAP50 0.941, precision 0.944, recall 0.935 (YOLOv8m-seg, tiled inference, 4-rotation TTA).",
      "8-class structural-element segmentation on ~21k tiles: validation mAP50 0.902 (box) / 0.893 (mask).",
      "Human-in-the-loop Scan-to-BIM: a ~264 M-point scan to a verified IFC of 2 slabs, 9 walls and 21 columns.",
      "Dataset engineering across six public sources and QA'd annotation of project sheets in CVAT.",
      "Evaluated multimodal LLM/VLM behaviour on engineering drawings and documented failure modes.",
    ],
    tools: ["PyTorch", "YOLOv8-seg", "OpenCV", "Open3D", "IfcOpenShell", "CVAT"],
    projectSlugs: ["structural-drawing-understanding", "scan-to-bim"],
    source: "AECAI\\AGECS\\*\\MD\\PROGRESS.MD; CV (Fogsphere, Aug 2026)",
  },
  {
    role: "Co-Founder & CTO",
    org: "AECAI Ltd",
    orgGeneric: "AECAI Ltd",
    place: "Belfast, UK",
    period: "Dec 2025 – Present",
    kind: "AI & digital",
    summary: "An AI-assisted structural inspection platform, from research models to a production web product.",
    bullets: [
      "Built the complete web console (Next.js): dashboards, assets, inspection forms and builder, photo review, reports.",
      "Designed the spalling and exposed-rebar pipeline (patching, Gaussian stitching, TTA, post-processing) and parallel serverless GPU inference.",
      "Evaluated models rigorously: corrected a misleading F1 of 0.14 to a true 0.901 for the rebar model, and ran a false-positive study across 23 test images.",
    ],
    tools: ["Next.js", "TypeScript", "Supabase", "RunPod", "PyTorch", "U-Net"],
    projectSlugs: ["aecai-inspection-platform"],
    source: "AECAI\\PROJECT_KNOWLEDGE.md; AECAI\\Spalling\\01_last_version\\MD\\PROGRESS.MD",
  },
  {
    role: "Digital Design Engineer: Industry Collaboration",
    org: "AECOM × Ulster University",
    orgGeneric: "AECOM × Ulster University",
    place: "Belfast, UK",
    period: "Feb 2025 – May 2025",
    kind: "Industry project",
    summary: "Industry project scoped with AECOM: crack detection linked to a Revit asset model and Power BI.",
    bullets: [
      "Converted AECOM's 2D drawings into a Revit model and linked crack data via Dynamo and IFC.",
      "Crack classifier at 89.69% accuracy (VGG16), with width classes against EN 1992-1-1.",
      "Power BI dashboard with an embedded 3D model, crack register, maintenance actions and a mobile view. Module mark 80%.",
    ],
    tools: ["Revit", "Dynamo", "Python", "Keras", "Power BI"],
    projectSlugs: ["water-tank-digital-twin"],
    source: "MSc\\BEN-715-IND\\REPORT\\*; MSc transcript",
  },
  {
    role: "Structural & Façade Design Engineer (Graduate)",
    org: "National Consulting Engineers Inc.",
    orgGeneric: "National Consulting Engineers Inc.",
    place: "Florida, USA (remote)",
    period: "Sep 2023 – Sep 2024",
    kind: "Engineering",
    summary: "Structural calculations and detailed drawings for façade and secondary-structure packages.",
    bullets: [
      "Delivered 115+ design packages: glass railings, curtain walls, canopies, stairs, walkways and connections in steel, aluminium and timber.",
      "Designed to AISC, ASCE 7, ACI and the Florida Building Code; coordinated with architects, contractors and fabricators.",
    ],
    tools: ["AutoCAD", "ETABS", "SAP2000", "SAFE", "IDEA StatiCa", "RAM Connection"],
    source: "CVs; CV\\Portfolio\\NC2x-*.pdf (client packages, not reproduced)",
  },
  {
    role: "Planning Engineer (Intern)",
    org: "DME Holding",
    orgGeneric: "DME Holding",
    place: "Cairo, Egypt",
    period: "Jul 2023",
    kind: "Engineering",
    summary: "Planning department internship on a residential development.",
    bullets: ["Supported scheduling, cost tracking and BOQ updates in Primavera P6, and prepared progress reports."],
    tools: ["Primavera P6", "Excel"],
    source: "CV\\CERTIFICATES\\DME.jpeg; CV\\01-TEMP-UNI\\DME – Cairo, Egypt (July 2023 – Aug.txt",
  },
  {
    role: "Site Engineer (Intern)",
    org: "Redcon Construction",
    orgGeneric: "Redcon Construction",
    place: "Cairo, Egypt",
    period: "Sep 2021",
    kind: "Engineering",
    summary: "Site internship (90+ hours) on the heritage-sensitive Sour Magra El-Oyoun project.",
    bullets: ["Supervised pile positioning and excavation checks, inspected reinforcement cages, ran slump tests, and took part in load testing of cast piles."],
    tools: ["Site QA/QC"],
    source: "CV\\CERTIFICATES\\Certificates.pdf p.1 (Redcon, 14 Sep 2021)",
  },
];

export const skillGroups: { title: string; items: string[]; evidence: string }[] = [
  {
    title: "AI & Computer Vision",
    items: ["Instance & semantic segmentation", "Object detection (YOLOv8 / YOLO11)", "U-Net · FPN · DeepLabV3+", "Point-cloud segmentation (PointNet++)", "Tiled inference & TTA", "Error analysis & field validation"],
    evidence: "Dissertation · AGECS · AECAI",
  },
  {
    title: "Machine Learning & Data Processing",
    items: ["PyTorch · segmentation-models-pytorch", "TensorFlow / Keras", "Dataset engineering (COCO / YOLO / SVG, hash-verified)", "Point-cloud processing (Open3D, ~264 M points)", "Annotation QA (CVAT)", "pandas · NumPy · scikit-learn · R", "Metric design (IoU, mAP, F1, specificity)"],
    evidence: "MSc COM779 (81%), COM736 (75%) · AGECS",
  },
  {
    title: "Cloud & MLOps",
    items: ["Serverless GPU inference (RunPod)", "Supabase (Postgres, storage, edge functions)", "Hugging Face model hosting", "Docker worker images", "Vercel · GitHub Actions CI/CD", "Git & GitHub"],
    evidence: "AECAI production stack · this site",
  },
  {
    title: "BIM, Digital Twins & BIM Level 3",
    items: ["Revit · Navisworks · AutoCAD", "Federated models & clash detection", "ISO 19650 · BEP / EIR · CDE", "BIM Level 2 delivery; Level 3 principles (open IFC, cloud-connected data)", "IFC · IfcOpenShell · Scan-to-BIM", "Power BI digital-twin dashboards"],
    evidence: "MSc BEN714 (73%), BEN715 (80%) · AGECS",
  },
  {
    title: "Generative AI & Agents",
    items: ["Multimodal LLM / VLM evaluation on drawings", "LLM features in products (Claude, Gemini)", "AI coding agents: Claude Code, Codex, Kimi", "Evaluation design & failure-mode reports", "AI Fluency (Anthropic)"],
    evidence: "AGECS LLM tests · AECAI console · certificate",
  },
  {
    title: "Structural Engineering",
    items: ["RC, steel, aluminium & timber design", "AISC · ASCE 7 · ACI · Eurocodes", "ETABS · SAP2000 · SAFE", "IDEA StatiCa · RAM Connection", "Connection & façade detailing", "Tekla shop drawings"],
    evidence: "NCE 2023–24 · BSc graduation project (A+)",
  },
  {
    title: "Programming & Automation",
    items: ["Python", "TypeScript / Next.js", "Dynamo · pyRevit", "OpenCV · NumPy · SciPy", "SQL", "Jupyter · reproducible notebooks"],
    evidence: "AECAI console · BIM automation",
  },
];
