/**
 * Personal profile and site-wide switches.
 * Every factual line here traces to a file listed in portfolio_evidence_inventory.md.
 */
export const profile = {
  name: "Mohamed Ragab",
  title: "AI & Digital Construction Engineer",
  discipline: "Structural engineering · BIM · Computer vision",
  headline: "Where structural engineering meets AI and BIM.",
  intro:
    "I am a structural engineer and computer-vision researcher. I build AI, BIM and automation workflows that turn site photos, structural drawings and laser scans into data an engineer can check and sign off.",
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
    title: "Computer vision for inspection",
    body: "I build detection and segmentation models for concrete defects: cracks, spalling, exposed rebar and 18-class bridge deterioration. I validate them on noisy site imagery, not only on curated benchmarks.",
    tags: ["YOLOv8/11-seg", "U-Net", "FPN", "PyTorch"],
    href: "/projects/concrete-defect-detection/",
    hrefLabel: "Evidence: dissertation",
  },
  {
    title: "Drawing & document intelligence",
    body: "I turn structural plans into structured elements: columns, beams, walls, openings and piles. The work combines tiled instance segmentation, geometry-aware post-processing and dataset engineering at scale.",
    tags: ["Instance segmentation", "Tiled inference & TTA", "COCO/YOLO", "CVAT"],
    href: "/projects/structural-drawing-understanding/",
    hrefLabel: "Evidence: drawing AI",
  },
  {
    title: "BIM, Scan-to-BIM & digital twins",
    body: "I build federated Revit models, run clash coordination and connect Power BI to the models. I also reconstruct IFC models from point clouds with a human-in-the-loop review step.",
    tags: ["Revit", "Navisworks", "IFC / IfcOpenShell", "Open3D"],
    href: "/projects/brinell-building-bim/",
    hrefLabel: "Evidence: BIM project",
  },
  {
    title: "Structural engineering judgement",
    body: "Before this work I delivered a year of structural and façade design packages to AISC, ASCE, ACI and the Florida Building Code. That practice shapes what I ask my models to measure and flag.",
    tags: ["ETABS", "SAP2000", "IDEA StatiCa", "EN 1992"],
    href: "/experience/",
    hrefLabel: "Evidence: experience",
  },
];
