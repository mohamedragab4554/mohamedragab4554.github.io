"""Images for the interactive viewers (inference viewer + before/after sliders).
Run: python scripts/prepare_interactive.py <uploads_root>
Sources are real model outputs from the MSc external-validation set and AGECS/AECOM work."""
import json, os, sys
from PIL import Image
U = sys.argv[1]
BA = f"{U}/Mohamed_Ragab_Portfolio/_work/staging/ba"
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "images")
man = []
def save(im, dest, src, maxw, q=80):
    im = im.convert("RGB")
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    p = os.path.join(OUT, dest); os.makedirs(os.path.dirname(p), exist_ok=True)
    im.save(p, "WEBP", quality=q, method=6); man.append({"file": "/images/" + dest, "width": im.width, "height": im.height, "source": src})
    print(dest, im.size, os.path.getsize(p) // 1024, "KB")

# Inference viewer: input + three model outputs + binary mask, same frame
ORIG = r"AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks}"
for n in ["20250220_092206", "20250220_083026", "IMG_3442", "20250220_100459"]:
    for k in ["input", "yolo11x", "unet", "multi", "mask"]:
        save(Image.open(f"{BA}/{n}_{k}.jpg"), f"inference/{n}_{k}.webp", ORIG + f" · {n} ({k})", 960, 78 if k != "mask" else 70)

# Drawing understanding: ground truth vs prediction (public floor-plan datasets)
for k in ["labels", "pred"]:
    save(Image.open(f"{BA}/sed_val_batch1_{k}.jpg"), f"compare/drawings-{k}.webp",
         r"AECAI\AGECS\06-structural elements detection\...\beam_wall_seg_v1\val_batch1_" + k + ".jpg", 1100)

# Scan-to-BIM: raw synthetic scan vs class-labelled ground truth (split the side-by-side figure)
fig = Image.open(f"{U}/AECAI/AGECS/02-Scan_to_BIM/01-structural elements/2026-06-08_hospital-synthetic-bimstruct3d/results/figures/vis_raw_vs_labeled.png")
w, h = fig.size
save(fig.crop((0, 60, w // 2, h)), "compare/scan-raw.webp", r"...\hospital-synthetic-bimstruct3d\results\figures\vis_raw_vs_labeled.png (left half)", 1300)
save(fig.crop((w // 2, 60, w, h)), "compare/scan-labelled.webp", r"...\hospital-synthetic-bimstruct3d\results\figures\vis_raw_vs_labeled.png (right half)", 1300)

# Water tank: crack photo vs annotated mask (public crack datasets)
m = Image.open(f"{U}/AECAI/Aecom/MASK-RCNN.png"); W, H = m.size
save(m.crop((0, H // 2, W // 2, H)), "compare/tank-crack-image.webp", r"AECAI\Aecom\MASK-RCNN.png (bottom-left)", 640, 85)
save(m.crop((0, 0, W // 2, H // 2)), "compare/tank-crack-mask.webp", r"AECAI\Aecom\MASK-RCNN.png (top-left)", 640, 85)

json.dump(man, open(os.path.join(OUT, "manifest-interactive.json"), "w"), indent=1)
