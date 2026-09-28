"""Prepare web-optimised portfolio images from original evidence files.

Originals are never modified. Each output records its source in public/images/manifest.json.
Run from the project root:  python scripts/prepare_assets.py <uploads_root> <extract_root>
  uploads_root  = folder mirroring D:\\Mohamed Ragab (staged copies of the originals)
  extract_root  = folder holding images extracted from PDFs/HTML (pdfimages output)
"""
import json, os, sys
from PIL import Image, ImageFilter

Image.MAX_IMAGE_PIXELS = None
U, X = sys.argv[1], sys.argv[2]
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "images")

# (dest, source, crop(l,t,r,b) or None, blur boxes [(l,t,r,b)], max_w, original path on D:)
A = [
 # --- Dissertation (MSc) ---
 ("dissertation/unet-outputs.webp", f"{X}/diss/i-036-054.png", None, [], 1400, r"MSc\Dissertation\02-pub\Diss\Mohamed Ragab-B00968029.pdf (Fig. 18, PDF p.36)"),
 ("dissertation/fpn-multidefect.webp", f"{X}/diss/i-040-059.png", None, [], 1400, r"MSc\Dissertation\02-pub\Diss\Mohamed Ragab-B00968029.pdf (Fig. 22, PDF p.40)"),
 ("dissertation/yolo-false-positives.webp", f"{X}/diss/i-039-057.png", None, [], 1400, r"MSc\Dissertation\02-pub\Diss\Mohamed Ragab-B00968029.pdf (Fig. 20, PDF p.39)"),
 ("dissertation/external-validation.webp", f"{X}/diss/i-034-051.png", None, [], 1700, r"MSc\Dissertation\02-pub\Diss\Mohamed Ragab-B00968029.pdf (Fig. 16, PDF p.34)"),
 ("dissertation/multidefect-site.webp", f"{X}/diss/i-037-056.png", None, [], 1400, r"MSc\Dissertation\02-pub\Diss\Mohamed Ragab-B00968029.pdf (Fig. 19, PDF p.37)"),
 ("dissertation/unet-loss.webp", f"{X}/diss/i-035-053.png", None, [], 900, r"MSc\Dissertation\02-pub\Diss\Mohamed Ragab-B00968029.pdf (Fig. 17, PDF p.35)"),
 ("dissertation/yolo11x-val-batch.webp", f"{U}/MSc/Dissertation/Final/Final/11x-val_batch0_pred.jpg", None, [], 1100, r"MSc\Dissertation\Final\Final\11x-val_batch0_pred.jpg"),
 # --- AECOM x Ulster industry project ---
 ("aecom/revit-tank.webp", f"{U}/AECAI/Aecom/TANK.png", None, [], 1600, r"AECAI\Aecom\TANK.png (copy of MSc\BEN-715-IND work)"),
 ("aecom/tank-site-model.webp", f"{X}/dt/i-013.png", None, [], 1600, r"CV\01-TEMP-UNI\01-Ganeral BIM\Egypt\Mohamed_Ragab_AI_Driven_Digital_Twin_Portfolio-1 (1).pdf p.5"),
 ("aecom/crack-classes.webp", f"{U}/AECAI/Aecom/Class2.png", None, [], 900, r"AECAI\Aecom\Class2.png"),
 ("aecom/crack-masks.webp", f"{U}/AECAI/Aecom/MASK-RCNN.png", None, [], 800, r"AECAI\Aecom\MASK-RCNN.png"),
 ("aecom/powerbi-3d.webp", f"{U}/AECAI/Aecom/IOT.png", None, [], 1500, r"AECAI\Aecom\IOT.png"),
 ("aecom/live-table.webp", f"{X}/dt/i-015.png", None, [], 800, r"Digital_Twin_Portfolio PDF p.6"),
 ("aecom/mobile-view.webp", f"{X}/dt/i-017.png", None, [], 720, r"Digital_Twin_Portfolio PDF p.7"),
 ("aecom/vgg16-curves.webp", f"{X}/b715/i-011-008.png", None, [], 1200, r"MSc\BEN-715-IND\REPORT\Mohamed Ragab - B00968029.pdf (Fig. 9)"),
 ("aecom/cnn-baseline-curves.webp", f"{X}/b715/i-010-007.png", None, [], 1200, r"MSc\BEN-715-IND\REPORT\Mohamed Ragab - B00968029.pdf (Fig. 8)"),
 # --- Brinell Building BIM ---
 ("brinell/revit-render.webp", f"{X}/dt/i-005.png", None, [], 1900, r"Digital_Twin_Portfolio PDF p.2 (model: MSc\BEN-714\01-PROJECT\00-Final\*.rvt)"),
 ("brinell/revit-exterior.webp", f"{X}/dt/i-011.png", None, [], 900, r"Digital_Twin_Portfolio PDF p.4"),
 ("brinell/structural-frame.webp", f"{X}/dt/i-009.png", None, [], 900, r"Digital_Twin_Portfolio PDF p.4"),
 ("brinell/clash.webp", f"{X}/dt/i-012.png", None, [], 900, r"Digital_Twin_Portfolio PDF p.4"),
 ("brinell/powerbi.webp", f"{X}/dt/i-006.png", None, [], 1600, r"Digital_Twin_Portfolio PDF p.3"),
 ("brinell/dynamo.webp", f"{X}/dt/i-007.png", None, [], 900, r"Digital_Twin_Portfolio PDF p.3"),
 # --- AECAI platform (address / coordinates blurred) ---
 ("aecai/dashboard.webp", f"{U}/AECAI/04-campaign/AECAI APP/1.png", None, [(405,690,640,750)], 1600, r"AECAI\04-campaign\AECAI APP\1.png"),
 ("aecai/asset.webp", f"{U}/AECAI/04-campaign/AECAI APP/2.png", None, [(552,350,880,462),(540,10,800,62)], 1600, r"AECAI\04-campaign\AECAI APP\2.png"),
 ("aecai/photos-cv.webp", f"{U}/AECAI/04-campaign/AECAI APP/4.png", None, [(550,8,790,60)], 1600, r"AECAI\04-campaign\AECAI APP\4.png"),
 ("aecai/inspection-form.webp", f"{U}/AECAI/04-campaign/AECAI APP/5.png", None, [(568,140,1000,192),(540,8,790,85)], 1600, r"AECAI\04-campaign\AECAI APP\5.png"),
 ("aecai/ai-scan.webp", f"{U}/AECAI/04-campaign/AECAI APP/6.png", None, [], 800, r"AECAI\04-campaign\AECAI APP\6.png"),
 ("aecai/form-builder.webp", f"{U}/AECAI/04-campaign/AECAI APP/3.png", None, [], 1600, r"AECAI\04-campaign\AECAI APP\3.png"),
 # --- Structural drawing understanding (public-dataset tiles only) ---
 ("drawings/pred-batch-0.webp", f"{U}/Mohamed_Ragab_Portfolio/_work/staging/sed_val_batch0_pred.jpg", None, [], 1200, r"AECAI\AGECS\06-structural elements detection\AGECS\AGECS\outputs\training_runs\beam_wall_seg_v1\val_batch0_pred.jpg"),
 ("drawings/pred-batch-1.webp", f"{U}/Mohamed_Ragab_Portfolio/_work/staging/sed_val_batch1_pred.jpg", None, [], 1200, r"...\beam_wall_seg_v1\val_batch1_pred.jpg"),
 ("drawings/pred-batch-2.webp", f"{U}/Mohamed_Ragab_Portfolio/_work/staging/sed_val_batch2_pred.jpg", None, [], 1200, r"...\beam_wall_seg_v1\val_batch2_pred.jpg"),
 ("drawings/confusion.webp", f"{U}/Mohamed_Ragab_Portfolio/_work/staging/sed_confusion_matrix_normalized.png", None, [], 1300, r"...\beam_wall_seg_v1\confusion_matrix_normalized.png"),
 # --- Scan-to-BIM ---
 ("scan/pointnet-seg.webp", f"{U}/AECAI/AGECS/02-Scan_to_BIM/01-structural elements/2026-06-08_hospital-synthetic-bimstruct3d/results/figures/02_segmentation_3d.png", None, [], 1400, r"AECAI\AGECS\02-Scan_to_BIM\01-structural elements\2026-06-08_hospital-synthetic-bimstruct3d\results\figures\02_segmentation_3d.png"),
 ("scan/raw-vs-labeled.webp", f"{U}/AECAI/AGECS/02-Scan_to_BIM/01-structural elements/2026-06-08_hospital-synthetic-bimstruct3d/results/figures/vis_raw_vs_labeled.png", None, [], 1800, r"...\hospital-synthetic-bimstruct3d\results\figures\vis_raw_vs_labeled.png"),
 ("scan/per-class.webp", f"{U}/AECAI/AGECS/02-Scan_to_BIM/01-structural elements/2026-06-08_hospital-synthetic-bimstruct3d/results/figures/vis_per_class_isolated.png", None, [], 1900, r"...\hospital-synthetic-bimstruct3d\results\figures\vis_per_class_isolated.png"),
 ("scan/kladno-slab-classification.webp", f"{U}/AECAI/AGECS/02-Scan_to_BIM/01-structural elements/2026-08-06_kladno-station/outputs/comparison_images/arch_level0_classification.png", None, [], 760, r"AECAI\AGECS\02-Scan_to_BIM\01-structural elements\2026-08-06_kladno-station\outputs\comparison_images\arch_level0_classification.png"),
 ("scan/site-structural-plan.webp", f"{X}/pa/p05.png", (170,95,2580,2610), [], 1300, r"...\2026-09-01_<client>\PIPELINE_ARCHITECTURE.html (embedded figure; title and coordinates cropped)"),
 ("scan/shoring-rejection.webp", f"{X}/pa/p08.png", (1500,1333,3000,2400), [], 1200, r"...\2026-09-01_<client>\PIPELINE_ARCHITECTURE.html (embedded figure; coordinates cropped)"),
 # --- Profile ---
 ("profile/headshot.webp", f"{U}/CV/x/me.jpeg", None, [], 800, r"CV\x\me.jpeg"),
]

manifest = []
for dest, src, crop, blurs, maxw, orig in A:
    im = Image.open(src).convert("RGB")
    for b in blurs:
        region = im.crop(b).filter(ImageFilter.GaussianBlur(14)).filter(ImageFilter.GaussianBlur(14))
        im.paste(region, b[:2])
    if crop:
        im = im.crop(crop)
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    p = os.path.join(OUT, dest)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    im.save(p, "WEBP", quality=84, method=6)
    manifest.append({"file": "/images/" + dest, "width": im.width, "height": im.height, "source": orig,
                     "edits": (["blurred private text"] if blurs else []) + (["cropped"] if crop else []) + ["resized, WebP"]})
    print(f"{dest:45s} {im.size}  {os.path.getsize(p)//1024} KB")
json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w"), indent=1)
