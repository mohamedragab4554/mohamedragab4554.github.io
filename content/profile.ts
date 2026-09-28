/**
 * Personal profile and site-wide switches.
 * Every factual line here traces to a file listed in portfolio_evidence_inventory.md.
 */
export const profile = {
  name: "Mohamed Ragab",
  title: "AI & Digital Construction Engineer",
  discipline: "Structural engineering · BIM · Computer vision",
  headline: "Training AI to read the built environment.",
  intro:
    "I am a structural engineer who builds AI. I train computer-vision and point-cloud models on site photos, structural drawings and laser scans, process the data behind them, and deploy them through cloud pipelines into BIM models and digital twins that engineers can check and sign off.",
  roles: [
    "AI / Computer Vision Engineer",
    "Digital Construction & BIM",
    "AI & Technology Consulting",
    "Structural-Digital Innovation",
  ],
  email: "mohamedragab6770@gmail.com",
  linkedin: "https://www.linkedin.com/in/mohamed-ragab-278208199",
  linkedinLabel: "linkedin.com/in/mohamed-ragab-278208199",
  /** Phone numbers shown on the site and CV (confirmed by Mohamed, 28 Sep 2026). Empty the list to hide them. */
  phones: [
    { label: "UK", display: "+44 7412 891254", tel: "+447412891254" },
    { label: "Egypt", display: "+20 10 9756 1115", tel: "+201097561115" },
  ] as { label: string; display: string; tel: string }[],
  /** Location intentionally generic until confirmed (CVs list Belfast and Cairo). */
  location: "United Kingdom · Egypt · open to remote",
  headshot: { src: "/images/profile/headshot.webp", width: 800, height: 839 },
  cvHref: "/Mohamed_Ragab_CV.pdf",
  membership: "Institution of Civil Engineers (ICE): Student Member",
  /** Set to false to replace "AGECS" with a generic employer description. */
  showEmployerNames: true,
  /** Set to false to hide industry-partner site photos from the dissertation. */
  useIndustryPhotos: true,
};

export const proofStrip = [
  {
    value: "Distinction",
    label: "MSc Digital Construction Analytics & BIM",
    context: "Ulster University, 2025",
    source: "CV\\CERTIFICATES\\MSC\\MSc_Transcript.pdf",
  },
  {
    value: "0.933",
    label: "Field recall on real site photos",
    context: "YOLO11x-seg · 44 manually verified industry images",
    source: "MSc dissertation, Table 7",
  },
  {
    value: "0.941",
    label: "mAP50: column detection on plans",
    context: "YOLOv8m-seg · P 0.944 · R 0.935",
    source: "AGECS\\04_column_detection\\MD\\PROGRESS.MD",
  },
  {
    value: "115+",
    label: "Structural & façade design packages",
    context: "National Consulting Engineers, 2023–24",
    source: "CVs; CV\\Portfolio\\NC2x-*.pdf",
  },
];

export const pillars = [
  {
    title: "Computer vision & deep learning",
    body: "Detection and segmentation models for concrete defects and structural drawings: cracks, spalling, exposed rebar, 18-class bridge deterioration, and columns, beams, walls, openings and piles on plans. Validated on noisy site data, not only on benchmarks.",
    tags: ["YOLOv8/11-seg", "U-Net", "FPN", "PointNet++", "PyTorch"],
    href: "/projects/concrete-defect-detection/",
    hrefLabel: "Evidence: dissertation",
  },
  {
    title: "ML engineering & data processing",
    body: "I build the datasets as well as the models: format converters, tiling, annotation QA and hash-verified copies, and pipelines that process a 264 M-point scan or hundreds of site photos in one run.",
    tags: ["pandas · NumPy", "Open3D", "OpenCV", "COCO / YOLO", "CVAT"],
    href: "/projects/structural-drawing-understanding/",
    hrefLabel: "Evidence: CAD-to-BIM AI",
  },
  {
    title: "Cloud & MLOps",
    body: "Models served as serverless GPU workers behind a web product, with versioned weights, a cloud database and push-to-deploy for both the app and the workers.",
    tags: ["RunPod", "Supabase", "Vercel", "Hugging Face", "GitHub Actions"],
    href: "/projects/aecai-inspection-platform/",
    hrefLabel: "Evidence: AECAI platform",
  },
  {
    title: "BIM, digital twins & BIM Level 3",
    body: "Federated Revit models and clash coordination under ISO 19650, Power BI twins that carry live condition data, and Scan-to-BIM that writes open IFC: the building blocks of BIM Level 3.",
    tags: ["Revit", "Navisworks", "IFC / IfcOpenShell", "Power BI", "ISO 19650"],
    href: "/#twin",
    hrefLabel: "Evidence: digital twins",
  },
  {
    title: "Generative AI & agentic workflows",
    body: "I evaluate multimodal LLMs on engineering drawings and document their failure modes, integrate them into products (an optional Claude or Gemini scan in AECAI), and build with AI coding agents under engineering review.",
    tags: ["Multimodal LLMs", "VLM evaluation", "Claude Code", "Codex", "Kimi"],
    href: "/projects/aecai-inspection-platform/",
    hrefLabel: "Evidence: AECAI platform",
  },
  {
    title: "Structural engineering judgement",
    body: "Before this work I delivered a year of structural and façade design packages to AISC, ASCE, ACI and the Florida Building Code. That practice shapes what I ask my models to measure and flag.",
    tags: ["ETABS", "SAP2000", "IDEA StatiCa", "EN 1992"],
    href: "/experience/",
    hrefLabel: "Evidence: experience",
  },
];
