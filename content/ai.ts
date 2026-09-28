/**
 * AI lifecycle and digital-twin / BIM Level 3 content for the home page.
 * Every number traces to portfolio_evidence_inventory.md (High confidence rows).
 */

export const aiStats = [
  { value: "8", label: "Model architectures trained", detail: "YOLOv8x · YOLO11x · YOLO11n · YOLOv8m-seg · U-Net (ResNet-50) · FPN–EfficientNet-B4 · PointNet++ · VGG16" },
  { value: "3", label: "Data modalities", detail: "Site photos, structural drawings and laser-scan point clouds" },
  { value: "~264 M", label: "Points processed in one scan", detail: "7.7 GB PLY, single storey, to verified IFC" },
  { value: "21,009", label: "Training tiles engineered", detail: "Unified from six public plan datasets, 8 classes" },
];

export type Stage = { k: string; title: string; lead: string; facts: string[]; tools: string[]; href: string; hrefLabel: string };

export const lifecycle: Stage[] = [
  {
    k: "01",
    title: "Data engineering & processing",
    lead: "Most of the accuracy is decided here: sourcing, converting, tiling, cleaning and checking the data before a model sees it.",
    facts: [
      "209,504 wall and 1,734 beam instances unified from six public sources, with custom SVG→COCO and rect→COCO converters and MD5-verified copies",
      "A ~264 M-point, 7.7 GB site scan cleaned and classified into structural elements",
      "689 industry site photos through the full detection and reporting pipeline in 27 min",
      "Annotation QA in CVAT: 251 instances and 918 polygon vertices on a single sheet",
    ],
    tools: ["Python", "pandas · NumPy", "OpenCV", "Open3D", "CVAT", "COCO / YOLO"],
    href: "/projects/structural-drawing-understanding/",
    hrefLabel: "Dataset engineering in the drawing case study",
  },
  {
    k: "02",
    title: "Model training",
    lead: "Detection, segmentation and point-cloud models, trained on my own pipelines and compared like for like.",
    facts: [
      "Eight architectures trained across images, drawings and point clouds",
      "18-class defect segmentation with Dice + weighted BCE loss, warm-up and cosine schedules, mixed precision",
      "Tiled 640 px training and inference with 4-rotation test-time augmentation for thin drawing elements",
      "Trained on local GPUs (RTX 4060 8 GB, GTX 1650 Ti 4 GB) with reproducible notebooks",
    ],
    tools: ["PyTorch", "Ultralytics YOLO", "segmentation-models-pytorch", "TensorFlow / Keras", "PointNet++"],
    href: "/projects/concrete-defect-detection/",
    hrefLabel: "Training details in the dissertation case study",
  },
  {
    k: "03",
    title: "Evaluation & field validation",
    lead: "A model is only as good as its worst site photo, so I test on real data and read the errors one by one.",
    facts: [
      "Field recall 0.933 on 44 manually verified industry site photos",
      "Found a metric artefact: a reported F1 of 0.14 was a true 0.901 once computed correctly",
      "Scale-invariant false-positive rule: 58 → 19 spurious regions on the hardest photo",
      "Per-class IoU compared against the published DACL10k benchmark",
    ],
    tools: ["mAP · IoU · F1", "Confusion matrices", "Error analysis", "Specificity tests"],
    href: "/projects/aecai-inspection-platform/",
    hrefLabel: "Evaluation work in the AECAI case study",
  },
  {
    k: "04",
    title: "Cloud deployment & MLOps",
    lead: "Models become useful when they run on demand, scale to zero and redeploy on every change.",
    facts: [
      "Defect models served as RunPod serverless GPU workers that scale from zero",
      "Next.js console on Vercel with Supabase Postgres, storage and edge functions",
      "Weights versioned on Hugging Face; every push rebuilds the app and the worker images",
      "This portfolio: built and deployed by GitHub Actions to GitHub Pages",
    ],
    tools: ["RunPod", "Supabase", "Vercel", "Hugging Face", "Docker", "GitHub Actions"],
    href: "/projects/aecai-inspection-platform/",
    hrefLabel: "Production architecture in the AECAI case study",
  },
  {
    k: "05",
    title: "BIM & digital-twin integration",
    lead: "The output is not a heat map. It is an element in an open model or a line in an asset owner's dashboard.",
    facts: [
      "IFC slabs, walls and columns generated from point clouds and re-verified with IfcOpenShell",
      "Crack data linked to a Revit model with Dynamo and shown in Power BI beside the 3D model",
      "AI findings stored per asset, so condition can be compared across inspections",
    ],
    tools: ["IfcOpenShell", "Revit", "Dynamo", "Power BI", "Navisworks"],
    href: "/projects/water-tank-digital-twin/",
    hrefLabel: "Digital twin case study",
  },
];

export type Block = { k: string; title: string; body: string; proof: string; href: string; hrefLabel: string; accent: string };

export const level3: Block[] = [
  {
    k: "Open data",
    title: "IFC as the common language",
    body: "Scan-to-BIM writes IFC elements from the point cloud, and every element is re-checked with IfcOpenShell, independent of the authoring tool.",
    proof: "2 slabs · 9 walls · 21 columns from a ~264 M-point scan",
    href: "/projects/scan-to-bim/", hrefLabel: "Scan-to-BIM", accent: "#B9A6F6",
  },
  {
    k: "Live data in the model",
    title: "Condition data on the 3D asset",
    body: "In the AECOM tank twin, each classified crack is linked to the Revit model and shown in Power BI with its EN 1992 width class and a recommended action.",
    proof: "Crack register + 3D model + mobile view",
    href: "/projects/water-tank-digital-twin/", hrefLabel: "Water tank digital twin", accent: "#6CC0EC",
  },
  {
    k: "Cloud-connected",
    title: "One source of truth per asset",
    body: "AECAI keeps inspections, AI findings and annotated images per asset in one cloud database, so every engineer works from the same record.",
    proof: "Findings with geometry and confidence, reviewed by an engineer",
    href: "/projects/aecai-inspection-platform/", hrefLabel: "AECAI platform", accent: "#5FD3CD",
  },
  {
    k: "Standards & collaboration",
    title: "ISO 19650 information management",
    body: "Federated architecture, structure and MEP models under an ISO 19650-style naming convention, EIR and BEP templates, and clash detection in Navisworks.",
    proof: "BIM Level 2 delivery, Brinell Building (73%)",
    href: "/projects/brinell-building-bim/", hrefLabel: "Brinell Building", accent: "#E0C36A",
  },
];

export const twinLoop = ["Reality capture", "AI recognition", "Open BIM (IFC)", "Digital twin", "Engineer decision"];
