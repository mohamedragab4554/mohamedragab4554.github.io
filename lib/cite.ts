/**
 * Turns internal evidence paths (kept in content/*.ts for traceability) into
 * readable citations for visitors. The raw path stays available as a tooltip.
 */
const RULES: [RegExp, string][] = [
  [/MSc\\Dissertation\\02-pub\\Diss\\[^,;§]*?\.pdf/gi, "MSc dissertation (Ulster University, 2025)"],
  [/MSc\\Dissertation\\Final\\[^;]*?results_metrics\.csv(; combined_defect_metrics\.csv)?/gi, "MSc dissertation evaluation outputs (per-class metrics)"],
  [/MSc\\Dissertation\\Final\\[^;]*?\*\.png/gi, "MSc dissertation figures"],
  [/CV\\CERTIFICATES\\MSC\\MSc_Transcript\.pdf/gi, "Ulster University MSc transcript"],
  [/MSc\\BEN-715-IND\\REPORT\\[^,;§]*?\.pdf/gi, "BEN715 industry-project report (AECOM × Ulster, 2025)"],
  [/MSc\\BEN-715-IND\\crack_project\\\*/gi, "BEN715 project files: Revit, Dynamo, Power BI"],
  [/AECAI\\Aecom\\\*\.png/gi, "BEN715 dashboard captures"],
  [/MSc\\BEN-714\\01-PROJECT\\00-Final\\\*\.rvt/gi, "BEN714 federated Revit models"],
  [/MSc\\BEN-714\\01-PROJECT\\02-PDF TO CAD\\\*\.dwg/gi, "BEN714 PDF-to-CAD drawing set"],
  [/MSc\\BEN-714\\01-PROJECT\\\*/gi, "BEN714 BIM project files"],
  [/CV\\01-TEMP-UNI\\[^;]*?Portfolio[^;]*?\.pdf/gi, "Project portfolio captures (2026)"],
  [/AECAI\\Spalling\\01_last_version\\MD\\PROGRESS\.MD/gi, "AECAI model-evaluation log"],
  [/AECAI\\PROJECT_KNOWLEDGE\.md/gi, "AECAI engineering knowledge base"],
  [/AECAI\\04-campaign\\AECAI APP\\[^;]*/gi, "AECAI product screenshots (identifiers blurred)"],
  [/(AECAI\\)?AGECS\\04_column_detection\\01-important notes[^;]*/gi, "AGECS column-detection pipeline record"],
  [/(AECAI\\)?AGECS\\04_column_detection\\MD\\PROGRESS\.MD/gi, "AGECS column-detection training log"],
  [/(AECAI\\)?AGECS\\05_beam_walls_detection\\MD\\PROGRESS\.MD/gi, "AGECS dataset-engineering log"],
  [/(AGECS\\06-structural elements detection|…)\\[^;]*?test_metrics\.csv/gi, "AGECS 8-class test metrics"],
  [/(AGECS\\06-structural elements detection|…)\\[^;]*?results\.csv/gi, "AGECS 8-class training log"],
  [/…\\final_training_dataset\\README_DATASET\.md/gi, "AGECS dataset card"],
  [/(AECAI\\)?AGECS\\06-structural elements detection\\[^;]*/gi, "AGECS training outputs"],
  [/(AECAI\\)?AGECS\\00_Daily tasks\\[^;]*/gi, "AGECS annotation QA report"],
  [/(AECAI\\AGECS\\|…\\|)?(02-Scan_to_BIM\\01-structural elements\\)?[^;]*?hospital-synthetic-bimstruct3d\\[^;]*/gi, "AGECS PointNet++ evaluation (synthetic data)"],
  [/CV\\Portfolio\\NC2x-\*\.pdf/gi, "NCE design packages (client material, not reproduced)"],
  [/(AECAI\\AGECS\\)?02-Scan_to_BIM\\01-structural elements\\[^;]*?kladno-station\\[^;]*/gi, "AGECS Scan-to-BIM benchmark runs (Kladno)"],
  [/(AECAI\\AGECS\\|…\\)(02-Scan_to_BIM\\01-structural elements\\)?2026-09-01_<site>\\[^;§]*/gi, "AGECS Scan-to-BIM project record"],
  [/(AECAI\\AGECS\\)?02-Scan_to_BIM\\01-structural elements\\MD\\PROGRESS\.MD[^;]*/gi, "AGECS Scan-to-BIM progress log"],
];

export function cite(raw: string): string {
  let s = raw;
  for (const [re, label] of RULES) s = s.replace(re, label);
  return s.replace(/([^\s(])§/g, "$1 §").replace(/\s{2,}/g, " ").trim();
}
