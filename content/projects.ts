import type { Project, Figure } from "./types";
import { profile } from "./profile";

function dissertationHero(): Figure {
  return profile.useIndustryPhotos
    ? { src: "/images/dissertation/unet-outputs.webp", alt: "Five inspection photographs with U-Net crack masks drawn in red along the cracks", caption: "U-Net (ResNet-50) crack segmentation on inspection images (dissertation Fig. 18).", width: 1322, height: 338 }
    : { src: "/images/dissertation/yolo11x-val-batch.webp", alt: "Grid of concrete crack tiles with predicted crack masks", caption: "YOLO11x-seg predictions on the public Crack-Seg validation set.", width: 1100, height: 1100 };
}

const DISS = "MSc\\Dissertation\\02-pub\\Diss\\Mohamed Ragab-B00968029.pdf";

export const projects: Project[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: "concrete-defect-detection",
    title: "Multi-defect concrete inspection with deep learning",
    shortTitle: "Concrete defect detection",
    category: "Computer vision · Structural health monitoring",
    context: "MSc dissertation, Ulster University · industry partner Amphora Consulting (Belfast)",
    period: "2025",
    role: "Sole researcher: data preparation, model training, field validation, practitioner survey",
    summary:
      "I benchmarked YOLO-seg, U-Net and FPN models for crack and multi-defect segmentation, then tested them on real inspection photos from an industry partner. The field test showed where benchmark accuracy fails on site.",
    hero: dissertationHero(),
    challenge: [
      "Visual inspection of reinforced concrete is slow, subjective and often done at height. In a survey I ran, the 21 professionals who responded said a medium-sized building typically takes 4–7 days to inspect.",
      "Published crack detectors report high benchmark scores. Site photos, however, are full of pipes, cables, coatings and shadows that look like cracks, so benchmark accuracy says little about field reliability.",
    ],
    whatIDid: [
      "Trained and compared three YOLO-seg variants (YOLOv8x, YOLO11x, YOLO11n) on the Crack-Seg dataset (3,717 / 112 / 200 images).",
      "Trained a U-Net with a ResNet-50 encoder for pixel-accurate crack masks suitable for width and area measurement.",
      "Extended to 18-class multi-defect segmentation on DACL10k with an FPN–EfficientNet-B4, using a Dice + weighted BCE loss, warm-up and cosine schedules, and mixed precision.",
      "Ran an external validation on real site images from Amphora and classified every prediction by hand as TP/FP/TN/FN.",
      "Designed and analysed a practitioner survey (UK, KSA, UAE, Egypt) to anchor the work in inspection practice.",
    ],
    approach: [
      { title: "Data", detail: "Crack-Seg · DACL10k (9,920 images, 18 classes) · 689 industry site photos" },
      { title: "Detect", detail: "YOLO-seg family for fast localisation (640 px input)" },
      { title: "Segment", detail: "U-Net ResNet-50 for crack morphology; FPN–EffNet-B4 for 18 classes" },
      { title: "Validate", detail: "Benchmark validation splits plus a manually verified field set (specificity focus)" },
      { title: "Report", detail: "Throughput benchmark and a BIM / digital-twin reporting workflow" },
    ],
    tools: ["Python", "PyTorch 2.5", "Ultralytics YOLO", "segmentation-models-pytorch", "Albumentations", "OpenCV", "RTX 4060 (8 GB)"],
    metrics: [
      { value: "0.807", label: "Box mAP50", context: "YOLOv8x-seg · Crack-Seg test", source: `${DISS} Table 6` },
      { value: "0.630", label: "mIoU (F1 0.775)", context: "U-Net ResNet-50 · validation split", source: `${DISS} §4.4` },
      { value: "0.933", label: "Field recall", context: "YOLO11x-seg · 14 of 15 cracked images", source: `${DISS} Table 7` },
      { value: "27 min", label: "689 images, full pipeline + report", context: "≈2.38 s per image", source: `${DISS} Table 8` },
    ],
    charts: [
      {
        kind: "grouped-bar",
        title: "YOLO-seg on the Crack-Seg test split",
        subtitle: "Box vs mask mAP50. Box localisation is strong; pixel masks are harder.",
        categories: ["YOLOv8x-seg", "YOLO11x-seg", "YOLO11n-seg"],
        series: [
          { name: "Box mAP50", values: [0.807, 0.804, 0.792] },
          { name: "Mask mAP50", values: [0.674, 0.639, 0.658] },
        ],
        max: 1,
        format: "fixed3",
        source: `${DISS}, Table 6`,
      },
      {
        kind: "grouped-bar",
        title: "Field validation on 44 real site photos",
        subtitle: "Image-level results after manual verification (15 cracked, 29 crack-free).",
        categories: ["YOLO11x-seg", "YOLO11n-seg", "YOLOv8x-seg"],
        series: [
          { name: "Recall", values: [0.933, 0.667, 0.933] },
          { name: "Precision", values: [0.467, 0.333, 0.333] },
          { name: "Accuracy", values: [0.6136, 0.4318, 0.3409] },
        ],
        max: 1,
        format: "fixed2",
        source: `${DISS}, Table 7`,
        note: "YOLOv8x-seg matched YOLO11x-seg on recall but flagged 28 of 29 crack-free images, mostly pipes, shadows and coatings.",
      },
      {
        kind: "hbar",
        title: "DACL10k per-class IoU: this study vs published benchmark",
        subtitle: "FPN–EfficientNet-B4 at 384 px, no auxiliary head (mIoU 0.317 vs 0.414 benchmark best).",
        categories: ["PEquipment", "Graffiti", "Hollowareas", "Bearing", "Drainage", "EJoint", "Rust", "Weathering", "ACrack", "Spalling", "Efflorescence", "JTape", "Wetspot", "Restformwork", "ExposedRebars", "Rockpocket", "Crack"],
        series: [
          { name: "This study", values: [0.592, 0.572, 0.546, 0.47, 0.465, 0.458, 0.365, 0.36, 0.351, 0.288, 0.249, 0.238, 0.207, 0.204, 0.175, 0.098, 0.066] },
          { name: "Flotzinger et al. (2023)", values: [0.675, 0.586, 0.536, 0.676, 0.521, 0.474, 0.414, 0.423, 0.473, 0.374, 0.338, 0.362, 0.232, 0.336, 0.393, 0.267, 0.288] },
        ],
        max: 0.8,
        format: "fixed2",
        source: "MSc\\Dissertation\\Final\\31-08-2025\\results_metrics.csv; combined_defect_metrics.csv",
        note: "Thin, low-pixel classes (crack is ~0.3% of pixels) suffered most at reduced resolution. The dissertation reports this gap openly.",
      },
      {
        kind: "hbar",
        title: "Throughput per configuration",
        subtitle: "Seconds per image on an RTX 4060 (lower is faster).",
        categories: ["Crack U-Net", "Crack-only YOLO", "Multi-class segmentation", "Full classification + report"],
        series: [{ name: "s / image", values: [0.527, 0.767, 2.045, 2.383] }],
        max: 2.6,
        format: "fixed2",
        source: `${DISS}, Table 8`,
      },
    ],
    results: [
      "U-Net gave the cleanest crack boundaries (mIoU 0.630, precision 0.762, recall 0.787). It is the right choice when crack width and area must be measured.",
      "On site imagery YOLO11x-seg was the most robust detector: it caught 14 of 15 cracked images and correctly cleared 13 crack-free images, where YOLOv8x-seg cleared only 1.",
      "The 18-class model extended coverage to rust, spalling, drainage and equipment, which reduces false crack alarms. Thin classes remained weak, and I documented the reasons.",
      "The integrated pipeline processed 689 industry images in 27 min 22 s. The same survey put a medium-sized building's manual inspection at 4–7 days.",
    ],
    relevance: [
      "Shows how to choose a model by where it will be deployed. Benchmark mAP alone would have picked the wrong detector for site use.",
      "Pairs a fast detector with a precise segmenter and a broad multi-class model. This is the architecture later taken forward in the AECAI product.",
    ],
    gallery: [
      { src: "/images/dissertation/external-validation.webp", alt: "Three site photos with crack masks from three YOLO models side by side", caption: "External validation: the same site images through YOLO11x-seg, YOLO11n-seg and YOLOv8x-seg.", width: 1700, height: 333, wide: true },
      { src: "/images/dissertation/yolo-false-positives.webp", alt: "Site images where shadows and pipes were wrongly flagged as cracks", caption: "Failure analysis: shadows from steel members and hanging cables flagged as cracks.", width: 1074, height: 373 },
      { src: "/images/dissertation/multidefect-site.webp", alt: "Industry site photos with multi-class defect masks in several colours", caption: "Multi-defect predictions on industry inspection images (Fig. 19).", width: 1116, height: 350, wide: true },
      { src: "/images/dissertation/fpn-multidefect.webp", alt: "Multi-colour defect masks over site images", caption: "FPN–EfficientNet-B4 multi-defect predictions on industry imagery.", width: 853, height: 395 },
      { src: "/images/dissertation/yolo11x-val-batch.webp", alt: "Grid of concrete crack tiles with blue predicted boxes and masks", caption: "YOLO11x-seg validation batch on Crack-Seg.", width: 1100, height: 1100 },
      { src: "/images/dissertation/unet-loss.webp", alt: "U-Net training and validation loss curves over 50 epochs", caption: "U-Net training and validation loss: fast convergence with a small generalisation gap.", width: 848, height: 470 },
    ],
    honestNotes: [
      "The multi-class model underperformed the published benchmark (0.317 vs 0.414 mIoU). Likely causes: 384 px inputs on an 8 GB GPU, no auxiliary classification head, and limited tuning.",
      "The field set is small (44 images). It is a robustness check, not a statistically powered benchmark.",
    ],
    links: [
      { label: "Code, model card & results: concrete-defect-detection-shm", href: "https://github.com/mohamedragab4554/concrete-defect-detection-shm" },
    ],
    sources: [DISS, "MSc\\Dissertation\\Final\\31-08-2025\\results_metrics.csv", "MSc\\Dissertation\\Final\\Final\\*.png", "CV\\CERTIFICATES\\MSC\\MSc_Transcript.pdf (BLD811: 74)"],
    disclosure: "Site photographs were supplied by Amphora Consulting for this research and appear in the submitted dissertation.",
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "aecai-inspection-platform",
    title: "AECAI: from inspection models to a working product",
    shortTitle: "AECAI inspection platform",
    category: "AI product · MLOps · Full-stack",
    context: "AECAI Ltd (Belfast): CTO",
    period: "Dec 2025 – present",
    role: "CTO: CV pipeline design, model evaluation, and the full web console (Next.js)",
    summary:
      "An AI-assisted structural inspection platform. Inspectors upload photos; crack, spalling and exposed-rebar models run in parallel; engineers review annotated findings and issue reports.",
    hero: {
      src: "/images/aecai/photos-cv.webp",
      alt: "AECAI web app showing a grid of inspection photos, each tagged with a count of detected defects",
      caption: "Inspection view: each photo is analysed and tagged with detected defects. Identifiers blurred.",
      width: 1600,
      height: 774,
    },
    challenge: [
      "Research models only become useful when they sit inside the inspector's workflow: capture, detection, engineer review, report.",
      "Models trained on close-up benchmark photos behave differently on real uploads, which vary in scale, surface finish and lighting.",
    ],
    whatIDid: [
      "Built the entire web console (`apps/console`, Next.js): dashboards, structures and assets, inspection forms with a form builder, photo review and reports.",
      "Designed the spalling and exposed-rebar pipeline: 224 px patches at 50% overlap, Gaussian-weighted stitching, flip test-time augmentation, thresholding and morphological clean-up.",
      "Dispatched crack and spalling detection in parallel from the app to serverless GPU workers. Each finding is stored with geometry and confidence for engineer review.",
      "Audited model quality myself. The rebar model looked broken on user photos, but I traced the cause to a training-metric artefact and a scale gap, not the weights.",
    ],
    approach: [
      { title: "Capture", detail: "Inspector creates an inspection and uploads photos per location" },
      { title: "Dispatch", detail: "App triggers crack and spalling/rebar detection in parallel" },
      { title: "Infer", detail: "Serverless GPU workers: U-Net ResNet-34 (crack), ResNet-18 (spalling), VGG-19 (rebar)" },
      { title: "Store", detail: "Findings with polygon geometry and confidence; annotated overlays" },
      { title: "Review", detail: "Engineer reviews, adjusts and signs off in the console" },
    ],
    tools: ["Next.js", "TypeScript", "Supabase (Postgres, edge functions, storage)", "RunPod serverless GPU", "Hugging Face Hub", "PyTorch", "segmentation-models-pytorch", "OpenCV", "Vercel"],
    metrics: [
      { value: "3", label: "Production defect models", context: "crack · spalling · exposed rebar", source: "AECAI\\PROJECT_KNOWLEDGE.md §1" },
      { value: "0.901", label: "Rebar U-Net F1 (IoU 0.820)", context: "1,500 validation patches · P 0.903 · R 0.899", source: "AECAI\\Spalling\\01_last_version\\MD\\PROGRESS.MD v0.6" },
      { value: "58 → 19", label: "Spurious regions removed", context: "hardest test photo · rule validated on 23 images", source: "AECAI\\Spalling\\01_last_version\\MD\\PROGRESS.MD v0.4" },
      { value: "2", label: "Models run in parallel per photo", context: "non-fatal: one failing never blocks the inspection", source: "AECAI\\PROJECT_KNOWLEDGE.md §6" },
    ],
    charts: [
      {
        kind: "grouped-bar",
        title: "Exposed-rebar U-Net on its validation split",
        subtitle: "Computed with pixel-aggregated metrics after I found that the notebook's per-image averaging had reported F1 = 0.14.",
        categories: ["Precision", "Recall", "F1", "IoU"],
        series: [{ name: "Rebar U-Net (VGG-19)", values: [0.903, 0.899, 0.901, 0.82] }],
        max: 1,
        format: "fixed3",
        source: "AECAI\\Spalling\\01_last_version\\MD\\PROGRESS.MD (v0.6, 2026-09-18)",
      },
    ],
    results: [
      "Delivered a working product loop: capture, AI detection, human review and reporting.",
      "Replaced a hard-coded confidence with the mean predicted probability, and fixed stitching so probabilities are accumulated before thresholding.",
      "Swept thresholds across 23 test images and 260 candidate regions. This produced a scale-invariant false-positive rule that removed speckle noise without losing any real spalling.",
      "Diagnosed the remaining failures (peeling paint and whitewash) as a gap in the training data, not something to tune away. That points to the next data-collection priority.",
    ],
    relevance: [
      "Takes computer vision from notebook to production: serverless GPU inference, cold starts, schema design and an engineer-in-the-loop review step.",
      "Shows disciplined evaluation. I disproved my own overfitted rule, and fixed a misleading metric before it drove a decision.",
    ],
    gallery: [
      { src: "/images/aecai/dashboard.webp", alt: "AECAI dashboard with structures, inspections, reports and open defects", caption: "Operations dashboard.", width: 1600, height: 759 },
      { src: "/images/aecai/asset.webp", alt: "Asset page showing condition change over time and inspection history", caption: "Asset view: condition change across inspections. Location blurred.", width: 1600, height: 769 },
      { src: "/images/aecai/inspection-form.webp", alt: "Inspection form organised by floor and element", caption: "Structured inspection form by location and element. Identifiers blurred.", width: 1600, height: 768 },
      { src: "/images/aecai/form-builder.webp", alt: "Form builder for a façade and RAAC inspection template", caption: "Form builder for custom inspection templates.", width: 1600, height: 769 },
      { src: "/images/aecai/ai-scan.webp", alt: "Dropdown to run CV detection or an AI scan with a chosen model", caption: "Run CV detection, or an optional multimodal AI scan, per photo set.", width: 571, height: 452 },
    ],
    honestNotes: [
      "Spalling over-detection on painted brickwork is only partly mitigated. The fix is new negative training data, which is planned.",
      "Edge functions, migrations and infrastructure secrets are owned by another team member. My ownership is the console and the CV pipeline design.",
    ],
    sources: ["AECAI\\PROJECT_KNOWLEDGE.md", "AECAI\\Spalling\\01_last_version\\MD\\PROGRESS.MD", "AECAI\\04-campaign\\AECAI APP\\1–6.png"],
    disclosure: "Commercial details, credentials and customer data are excluded. The screenshots come from the company's own workspace, with addresses and coordinates blurred.",
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "structural-drawing-understanding",
    title: "CAD-to-BIM AI: structural drawing understanding",
    shortTitle: "CAD-to-BIM AI",
    category: "Document AI · CAD-to-BIM · Instance segmentation",
    context: "AGECS (R&D, remote)",
    period: "Apr 2026 – present",
    role: "R&D engineer: dataset engineering, training, error analysis, post-processing",
    summary:
      "Detecting and segmenting columns, beams, walls, openings and piles on structural plans, so that 2D drawings become structured element data for CAD-to-BIM modelling.",
    hero: {
      src: "/images/drawings/pred-batch-1.webp",
      alt: "Grid of floor-plan tiles with predicted structural element masks in yellow, blue and cyan",
      caption: "8-class model predictions on validation tiles from public floor-plan datasets.",
      width: 1200,
      height: 1200,
    },
    challenge: [
      "Structural sheets are huge (up to 15,000 × 12,000 px). Elements are thin and repetitive, and they are easily confused with text, hatching and dimension lines.",
      "Public labelled data is scattered across formats (COCO JSON, YOLO, SVG, custom schemas), and some of it has corrupt or inconsistent annotations.",
    ],
    whatIDid: [
      "Audited five structural and floor-plan data sources (~22k files). I wrote SVG→COCO and rect→COCO converters and MD5-verified every copy against source.",
      "Built a building-level train/val/test split to prevent leakage, plus copy-paste augmentation for rare circular columns.",
      "Trained a YOLOv8m-seg column model on 640 px tiles within a 4 GB GPU budget. I diagnosed EMA NaNs caused by VRAM overflow and moved from the L model to the M model.",
      "Engineered inference: 30% tile overlap, 4-rotation test-time augmentation with verified inverse transforms, global NMS, and pixel-evidence checks that reject text blobs and linework.",
      "Scaled to an 8-class structural-element model (~21k training tiles) and a CV-to-CAD mapping so detections carry drawing coordinates.",
      "Annotated and QA'd real project sheets in CVAT. On one steel sheet I added 251 verified instances and 918 polygon vertices, binding each beam label to its beam.",
    ],
    approach: [
      { title: "Unify data", detail: "COCO / YOLO / SVG → one schema, audited and hash-verified" },
      { title: "Tile", detail: "640 px tiles with overlap; object-centred crops plus capped negatives" },
      { title: "Segment", detail: "YOLOv8-seg instance masks per element class" },
      { title: "Merge", detail: "Rotation TTA, global NMS, long-element stitching across tiles" },
      { title: "Validate", detail: "Pixel-evidence filters, instance matching, error taxonomy" },
    ],
    tools: ["Ultralytics YOLOv8-seg", "PyTorch", "OpenCV", "CVAT", "COCO / YOLO formats", "Python"],
    metrics: [
      { value: "0.941", label: "Column mAP50 (box & mask)", context: "YOLOv8m-seg · P 0.944 · R 0.935", source: "AGECS\\04_column_detection\\MD\\PROGRESS.MD v0.7" },
      { value: "0.902", label: "8-class val box mAP50", context: "mask mAP50 0.893 · best epoch 13", source: "…\\beam_wall_seg_v1\\results.csv" },
      { value: "21,009", label: "Training tiles", context: "2,516 val · 2,569 test", source: "…\\final_training_dataset\\README_DATASET.md" },
      { value: "209,504", label: "Wall instances unified", context: "plus 1,734 beams, 6 sources", source: "AGECS\\05_beam_walls_detection\\MD\\PROGRESS.MD v0.3" },
    ],
    charts: [
      {
        kind: "line",
        title: "8-class model: validation mAP50 by epoch",
        subtitle: "Box and mask curves track closely: masks are as reliable as boxes.",
        x: Array.from({ length: 20 }, (_, i) => i + 1),
        xLabel: "Epoch",
        series: [
          { name: "Box mAP50", values: [0.691, 0.781, 0.797, 0.822, 0.834, 0.855, 0.857, 0.874, 0.87, 0.862, 0.884, 0.872, 0.902, 0.889, 0.883, 0.886, 0.877, 0.873, 0.88, 0.879] },
          { name: "Mask mAP50", values: [0.403, 0.697, 0.786, 0.822, 0.832, 0.853, 0.854, 0.861, 0.864, 0.856, 0.882, 0.862, 0.893, 0.884, 0.877, 0.881, 0.87, 0.868, 0.872, 0.868] },
        ],
        min: 0.4,
        max: 1,
        format: "fixed3",
        source: "AGECS\\06-structural elements detection\\…\\beam_wall_seg_v1\\results.csv",
        highlight: { x: 13, label: "best" },
      },
      {
        kind: "hbar",
        title: "Held-out test mask mAP50 by element",
        subtitle: "Where the model is reliable, and where more data is needed.",
        categories: ["Opening", "Beam", "Column", "Pile"],
        series: [
          { name: "Mask mAP50", values: [0.977, 0.943, 0.625, 0.624] },
          { name: "Box mAP50", values: [0.977, 0.904, 0.625, 0.611] },
        ],
        max: 1,
        format: "fixed3",
        source: "AGECS\\06-structural elements detection\\…\\outputs\\metrics\\beam_wall_seg_v1_test_metrics.csv",
        note: "Column recall on the test split (0.51) is the weak point. Steel members and walls had no scorable test instances in this run.",
      },
    ],
    results: [
      "The column detector exceeded its mAP50 > 0.80 target by a wide margin (0.941 box and mask, precision 0.944, recall 0.935).",
      "The 8-class model reached 0.902 box / 0.893 mask mAP50 on validation, with high test reliability for openings and beams.",
      "Error analysis showed column recall and piles are the gap. The fix is more labelled real sheets, which I am producing through a QA'd annotation stream.",
    ],
    relevance: [
      "Turns drawings into data, the step that 2D-to-3D, quantity take-off and BIM automation all depend on.",
      "Shows production habits: leakage-safe splits, verified data provenance, reproducible notebooks and documented failure modes.",
    ],
    gallery: [
      { src: "/images/drawings/pred-batch-0.webp", alt: "Architectural floor plan tiles with wall and column masks", caption: "Predictions on architectural plans (public datasets).", width: 1200, height: 1200 },
      { src: "/images/drawings/pred-batch-2.webp", alt: "Close-up tiles with column and wall masks next to dimension text", caption: "Close tiles: columns and walls separated from dimension text.", width: 1200, height: 1200 },
      { src: "/images/drawings/confusion.webp", alt: "Normalised confusion matrix for eight structural classes", caption: "Normalised confusion matrix (validation).", width: 1300, height: 975 },
    ],
    honestNotes: [
      "Client project sheets were used for training and annotation. They are not shown here. All tiles shown come from public floor-plan datasets.",
    ],
    sources: [
      "AECAI\\AGECS\\04_column_detection\\MD\\PROGRESS.MD",
      "AECAI\\AGECS\\04_column_detection\\01-important notes\\01-Final\\PIPELINE_THAT_PRODUCED_BEST_RESULTS.md",
      "AECAI\\AGECS\\05_beam_walls_detection\\MD\\PROGRESS.MD",
      "AECAI\\AGECS\\06-structural elements detection\\AGECS\\AGECS\\outputs\\*",
      "AECAI\\AGECS\\00_Daily tasks\\07-Jul\\work_progress_23072026\\daily-report-2026-07-23.md",
    ],
    disclosure: "Shown at the level of aggregate metrics and public-dataset imagery. No client drawings are reproduced.",
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "scan-to-bim",
    title: "Scan-to-BIM: point cloud to verified IFC",
    shortTitle: "Scan-to-BIM",
    category: "3D vision · BIM automation",
    context: "AGECS (R&D) · contractor site scan and public benchmarks",
    period: "Jun 2026 – present",
    role: "R&D engineer: pipeline design, geometry classification, IFC generation, verification",
    summary:
      "A human-in-the-loop pipeline that turns a laser scan into an IFC model of slabs, walls and columns. Every element must be backed by real point support and a reviewer checks it before sign-off.",
    hero: {
      src: "/images/scan/shoring-rejection.webp",
      alt: "Plan-view point-density map of a real site scan showing a lattice of thin members",
      caption: "Real contractor scan, plan-view point density: thin lattice members read as temporary shoring, so the pipeline keeps them out of the IFC.",
      width: 1200,
      height: 854,
    },
    challenge: [
      "Real scans are enormous: the site scan here was about 264 million points (7.7 GB). They also contain scaffolding, shoring and clutter that automatic pipelines mistake for structure.",
      "An open-source baseline (Cloud2BIM) produced walls with the wrong orientation and forced-rectangle columns, which a reviewer rejected in ReCap.",
    ],
    whatIDid: [
      "Adapted the open-source Cloud2BIM pipeline and kept its slab detection and IFC writer, while replacing wall and column classification with my own geometry classifier.",
      "Fixed a ~90° wall-orientation bug (the `minAreaRect` angle convention) and checked it against independent PCA on 9 of 9 walls.",
      "Built a multi-blob connected-component test that rejects temporary steel props and shoring without hard-coding to the dataset (23 → 21 columns, with all confirmed elements kept).",
      "Wired the whole flow into a phased notebook with approval gates. It regenerates the IFC end-to-end in ~18.5 minutes, and I re-verified the output from a fresh IfcOpenShell process.",
      "Benchmarked PointNet++ semantic segmentation on a synthetic building interior and ran the pipeline on the public Kladno station dataset.",
    ],
    approach: [
      { title: "Ingest", detail: "E57 / PLY → subsample (memory-mapped, chunked)" },
      { title: "Slice", detail: "Storey levels and slabs via height histograms" },
      { title: "Classify", detail: "2D density contours → wall · rectangular or circular column · reject" },
      { title: "Verify", detail: "Raw-point ROI checks, PCA orientation, temporary-works rejection" },
      { title: "Export", detail: "IFC (IfcSlab / IfcWall / IfcColumn); human review in ReCap" },
    ],
    tools: ["Python", "Open3D", "NumPy / SciPy", "OpenCV", "IfcOpenShell", "PointNet++", "Autodesk ReCap", "Revit / Dynamo"],
    metrics: [
      { value: "~264 M", label: "Points in the site scan", context: "7.7 GB PLY · single storey", source: "…\\2026-09-01_<site>\\PROJECT_CONTEXT.md §2" },
      { value: "2 · 9 · 21", label: "Slabs · walls · columns in IFC", context: "re-verified with IfcOpenShell", source: "02-Scan_to_BIM\\01-structural elements\\MD\\PROGRESS.MD (2026-09-06)" },
      { value: "18.5 min", label: "End-to-end regeneration", context: "phased notebook, 0 blocking errors", source: "same" },
      { value: "0.92", label: "Column IoU (synthetic)", context: "PointNet++ · walls 0.89, floor 0.87", source: "…\\hospital-synthetic-bimstruct3d\\results\\figures\\evaluation.png" },
    ],
    charts: [
      {
        kind: "hbar",
        title: "PointNet++ per-class IoU on a synthetic interior",
        subtitle: "Mean over the five classes present: 0.823.",
        categories: ["Column", "Wall", "Floor", "Ceiling", "Door"],
        series: [{ name: "IoU", values: [0.922, 0.888, 0.874, 0.873, 0.56] }],
        max: 1,
        format: "fixed3",
        source: "AGECS\\02-Scan_to_BIM\\01-structural elements\\2026-06-08_hospital-synthetic-bimstruct3d\\results\\figures\\evaluation.png",
        note: "The notebook's reported mIoU of 0.686 includes an empty background class scored as 0. Doors are most often confused with walls (16%).",
        reference: { value: 0.823, label: "mean 0.823" },
      },
    ],
    results: [
      "Produced an interim IFC with 2 slabs, 9 walls and 21 columns. Each element traces to raw point support, and a fresh re-run reproduced the model exactly.",
      "Removed temporary shoring and a lattice fragment automatically, keeping all 12 previously confirmed permanent elements.",
      "Documented reusable methods: visual-first column-shape verification, and a temporary-works detection pipeline for future scans.",
    ],
    relevance: [
      "Scan-to-BIM is costly manual modelling. This work automates the repetitive parts and keeps an engineer in control of what counts as structure.",
      "Shows 3D geometry skills (PCA, contouring, connected components) alongside BIM data standards (IFC).",
    ],
    gallery: [
      { src: "/images/scan/pointnet-seg.webp", alt: "3D scatter of a segmented room point cloud", caption: "PointNet++ semantic segmentation output (synthetic interior).", width: 1400, height: 862 },
      { src: "/images/scan/per-class.webp", alt: "Five small renders isolating wall, floor, ceiling, door and column points", caption: "Per-class isolation used for QA.", width: 1900, height: 415, wide: true },
      { src: "/images/scan/site-structural-plan.webp", alt: "Plan of a building footprint with labelled wall and column candidates", caption: "Contractor site scan: classified walls and columns over the slab footprint (coordinates removed).", width: 1300, height: 1357 },
      { src: "/images/scan/kladno-slab-classification.webp", alt: "Plot of slab candidate classification on a railway station scan", caption: "Public Kladno station benchmark: slab-candidate classification.", width: 732, height: 759 },
    ],
    honestNotes: [
      "The site IFC is labelled interim. Openings (doors and windows) and one disputed element remain under review.",
    ],
    sources: [
      "AECAI\\AGECS\\02-Scan_to_BIM\\01-structural elements\\MD\\PROGRESS.MD, PLAN.MD",
      "AECAI\\AGECS\\02-Scan_to_BIM\\01-structural elements\\2026-09-01_<site>\\PROJECT_CONTEXT.md, PIPELINE_ARCHITECTURE.html",
      "AECAI\\AGECS\\02-Scan_to_BIM\\01-structural elements\\2026-06-08_hospital-synthetic-bimstruct3d\\results\\figures\\*",
      "AECAI\\AGECS\\02-Scan_to_BIM\\01-structural elements\\2026-08-06_kladno-station\\*",
    ],
    disclosure: "The contractor and site are anonymised. Survey coordinates are cropped from all figures.",
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "water-tank-digital-twin",
    title: "Crack detection to digital twin: concrete water tank",
    shortTitle: "Water tank digital twin",
    category: "Digital twin · BIM + ML · Industry project",
    context: "AECOM × Ulster University industry project (BEN715)",
    period: "Feb – May 2025",
    role: "Project lead (individual): scoping with AECOM, Revit modelling, ML, dashboards",
    summary:
      "A concept workflow linking crack detection, Eurocode-based width classification and a Revit model inside Power BI, so engineers can triage tank condition remotely.",
    hero: {
      src: "/images/aecom/powerbi-3d.webp",
      alt: "Power BI report with a 3D tank view and a crack table with maintenance recommendations",
      caption: "Power BI: the 3D Revit model beside the live crack register and recommended actions.",
      width: 1485,
      height: 702,
    },
    challenge: [
      "Cracks in concrete water tanks cause leakage and deterioration. Tanks are often remote or difficult to access, which makes manual inspection slow and hazardous.",
      "AECOM framed the problem at the kick-off meeting: connect inspection evidence to the asset model and to maintenance decisions.",
    ],
    whatIDid: [
      "Built a Revit model from AECOM's 2D drawings, exported it to IFC, and linked crack data back into Revit with Dynamo.",
      "Trained a crack classifier. A first custom CNN over-fitted (36.67% test accuracy); a pretrained VGG16 reached 70.0% on the saved 30-image test run (89.69% reported in the submitted report).",
      "Estimated crack width from masks and classified it against EN 1992-1-1 Table 7.1N (w_max 0.3 mm, XC2) to assign a maintenance action.",
      "Moved visualisation from a browser IFC viewer, which failed on complex BIM files, to Power BI with an embedded 3D Revit visual, a crack table and a mobile layout.",
    ],
    approach: [
      { title: "Model", detail: "2D drawings → Revit → IFC" },
      { title: "Detect", detail: "OpenCV preprocessing + mask-based segmentation" },
      { title: "Classify", detail: "Width vs EN 1992 limits → fine / medium / severe" },
      { title: "Visualise", detail: "Power BI + 3D Revit visual + mobile view" },
      { title: "Scale-out", detail: "Proposed: RTSP camera → cloud storage → serverless inference" },
    ],
    tools: ["Autodesk Revit", "Dynamo", "IFC", "Python", "TensorFlow / Keras (VGG16)", "OpenCV", "Power BI", "Speckle"],
    metrics: [
      { value: "70.0%", label: "VGG16 crack classifier", context: "saved run, 30 test images · 89.69% in the submitted report", source: "MSc\\BEN-715-IND\\crack_project\\01-Submit\\ML\\ML2.ipynb; report §VI" },
      { value: "36.67%", label: "Baseline custom CNN", context: "first attempt: over-fitted", source: "same" },
      { value: "0.3 mm", label: "EN 1992 w_max threshold used", context: "Table 7.1N, exposure XC2", source: "same §III.B" },
      { value: "80%", label: "Module mark", context: "BEN715 Industry Project", source: "CV\\CERTIFICATES\\MSC\\MSc_Transcript.pdf" },
    ],
    charts: [],
    results: [
      "Delivered a working prototype. Detected cracks are classified, carry a recommended maintenance action, and are visible on the 3D asset in Power BI.",
      "Recorded an evidence-based lesson on tool choice: lightweight browser IFC viewers could not handle the model, and Power BI with a 3D visual could.",
    ],
    relevance: [
      "Bridges the structural standard (crack-width limits) with data science and BIM, which is the kind of problem digital-delivery teams bring to consultants.",
    ],
    gallery: [
      { src: "/images/aecom/tank-site-model.webp", alt: "Revit site model with the tank on terrain", caption: "Revit site model of the tank, built from AECOM's 2D drawings.", width: 1600, height: 612, wide: true },
      { src: "/images/aecom/revit-tank.webp", alt: "Revit model of an elevated concrete water tank on a steel frame", caption: "Tank model in Revit, exported to IFC and linked to crack data with Dynamo.", width: 1600, height: 848, wide: true },
      { src: "/images/aecom/live-table.webp", alt: "Crack register table with crack type, image link, suggested maintenance and width", caption: "Crack register: EN 1992 width class and a recommended action for each crack.", width: 642, height: 595 },
      { src: "/images/aecom/crack-classes.webp", alt: "Crack photos outlined in green with class labels such as Severe Crack", caption: "Width-based classes; severe (>0.3 mm) flagged for immediate repair.", width: 732, height: 722 },
      { src: "/images/aecom/crack-masks.webp", alt: "Binary crack masks above the original crack photos", caption: "Pixel masks used for width estimation.", width: 638, height: 630 },
      { src: "/images/aecom/vgg16-curves.webp", alt: "Accuracy and loss curves for the VGG16 classifier", caption: "VGG16 transfer learning: accuracy and loss.", width: 1189, height: 490 },
      { src: "/images/aecom/cnn-baseline-curves.webp", alt: "Diverging validation loss for the first CNN", caption: "First CNN: validation loss diverged, prompting the switch to VGG16.", width: 1189, height: 390 },
      { src: "/images/aecom/mobile-view.webp", alt: "Phone mock-up showing the 3D tank view and a Live button", caption: "Mobile view concept, fed from the same dataset.", width: 720, height: 720 },
    ],
    honestNotes: [
      "No camera was installed on site. The live-camera and cloud stages are a proposed architecture, and the report says so.",
      "Training images came from public crack datasets (Mendeley, Utah State University), not from the tank itself. They carry no physical scale, so the mm widths rely on an assumed calibration.",
      "The submitted report states 89.69% for VGG16; the last saved notebook run shows 70.0% on 30 test images. Both are published in the repository.",
    ],
    links: [
      { label: "Code & documentation: water-tank-crack-digital-twin", href: "https://github.com/mohamedragab4554/water-tank-crack-digital-twin" },
    ],
    sources: ["MSc\\BEN-715-IND\\REPORT\\Mohamed Ragab - B00968029.pdf", "MSc\\BEN-715-IND\\crack_project\\*", "AECAI\\Aecom\\*.png"],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "brinell-building-bim",
    title: "BIM coordination & automation: The Brinell Building",
    shortTitle: "Brinell Building BIM",
    category: "BIM · ISO 19650 · Coordination",
    context: "MSc Building Information Modelling module (BEN714), team project",
    period: "Sep 2024 – Jan 2025",
    role: "BIM Coordinator and structural modeller",
    summary:
      "Coordinated architecture, structure and MEP models for a multi-storey office building in Brighton, from 2D PDFs to federated Revit models, clash detection and a Power BI model dashboard.",
    hero: {
      src: "/images/brinell/revit-render.webp",
      alt: "Revit 3D view of a multi-storey office building with dark glazing",
      caption: "Federated Revit model of The Brinell Building.",
      width: 1900,
      height: 578,
    },
    challenge: [
      "Rebuild a real building from 2D PDF drawings into coordinated discipline models, following ISO 19650 information-management practice.",
    ],
    whatIDid: [
      "Converted the PDF general arrangements (basement to level 7, plus elevations) to AutoCAD, and modelled the structure in Revit.",
      "Coordinated ARC/STR/MEP models under a structured naming convention (e.g. BRN-UU-BEN714-BIM-M3-STR-DD-002) and ran clash detection in Navisworks.",
      "Automated parameters, schedules and exports with Dynamo and pyRevit, and built a Power BI dashboard for model progress and QA.",
      "Contributed to the BEP against EIR templates (CIC BIM Protocol, CPIx pre-contract BEP), and to the cost plan and programme.",
    ],
    approach: [
      { title: "PDF → CAD", detail: "Clean DWG base for every level and elevation" },
      { title: "Model", detail: "Structural Revit model; federated ARC / STR / MEP" },
      { title: "Coordinate", detail: "Navisworks clash tests and issue tracking" },
      { title: "Automate", detail: "Dynamo / pyRevit parameters, schedules, exports" },
      { title: "Report", detail: "Power BI model dashboard; BEP and CDE structure" },
    ],
    tools: ["Revit", "AutoCAD", "Navisworks", "Dynamo", "pyRevit", "Power BI", "ACC / BIM 360", "ISO 19650"],
    metrics: [
      { value: "3", label: "Federated discipline models", context: "architecture · structure · MEP", source: "MSc\\BEN-714\\01-PROJECT\\00-Final\\*.rvt" },
      { value: "B1–L7", label: "Levels rebuilt from PDF", context: "plus street elevations", source: "MSc\\BEN-714\\01-PROJECT\\02-PDF TO CAD\\*.dwg" },
      { value: "73%", label: "Module mark", context: "BEN714 Building Information Modelling", source: "CV\\CERTIFICATES\\MSC\\MSc_Transcript.pdf" },
    ],
    charts: [],
    results: [
      "Delivered coordinated, ISO 19650-named discipline models, clash reports and a model dashboard for design reviews.",
    ],
    relevance: [
      "This is the core BIM coordinator skill set, plus the automation habit of scripting the repetitive steps.",
    ],
    gallery: [
      { src: "/images/brinell/powerbi.webp", alt: "Power BI dashboard with a 3D model and element counts", caption: "Power BI model dashboard.", width: 1600, height: 848, wide: true },
      { src: "/images/brinell/structural-frame.webp", alt: "Revit 3D view of the structural frame", caption: "Structural frame model.", width: 561, height: 684 },
      { src: "/images/brinell/clash.webp", alt: "Navisworks view highlighting a clash between a beam and a column", caption: "Clash detection in Navisworks.", width: 565, height: 695 },
      { src: "/images/brinell/revit-exterior.webp", alt: "Revit exterior view of the building", caption: "Architectural model.", width: 561, height: 422 },
      { src: "/images/brinell/dynamo.webp", alt: "Dynamo graph for parameter automation", caption: "Dynamo automation graph.", width: 879, height: 469 },
    ],
    honestNotes: ["This was a university team project. Role descriptions come from my own project portfolio."],
    sources: ["MSc\\BEN-714\\01-PROJECT\\*", "CV\\01-TEMP-UNI\\01-Ganeral BIM\\Egypt\\Mohamed_Ragab_AI_Driven_Digital_Twin_Portfolio-1 (1).pdf"],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
