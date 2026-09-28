# Mohamed Ragab: Portfolio

**Live site:** https://mohamedragab4554.github.io/

This is an interactive portfolio for a structural engineer who works in computer vision, BIM and Scan-to-BIM. It is built with **Next.js 15 (App Router) · TypeScript · Tailwind CSS · Three.js** and exported as a static site. It is hosted on **GitHub Pages**, and every push to `main` triggers an automatic deploy.

## What's inside

| Feature | Where |
|---|---|
| WebGL hero: a point cloud resolves into a structural frame (scan → segment → detect → model). It plays once, then settles; the cursor adds parallax. | `components/hero/*` |
| Static SVG fallback for the hero. It is server-rendered and shown for reduced motion, missing WebGL or low-power devices, and while the 3D module loads. | `components/hero/HeroFallback.tsx` |
| Systems map: inputs → methods → outcomes, traceable per project | `components/SystemsMap.tsx` |
| Inference viewer: the same real site photo through YOLO11x-seg, U-Net and FPN, with a drag comparison | `components/InferenceViewer.tsx` |
| Before/after sliders using real inputs and outputs (drawings, point cloud, crack masks) | `components/CompareSlider.tsx` |
| Dimensional project cards (tilt and hover reveal) | `components/WorkCard.tsx` |
| Career laid out as a construction-programme (Gantt) timeline | `components/Programme.tsx` |
| Case studies with five chapters (challenge → input data → workflow → result → impact), a sticky chapter bar and reading progress | `app/projects/[slug]/page.tsx` |
| Animated SVG charts with tooltips and data tables | `components/charts/Charts.tsx` |

Motion runs only when JavaScript is available **and** the visitor has not asked for reduced motion (`html[data-motion="ok"]`, set in `app/layout.tsx`). Without that, all content is fully visible and static. The 3D module (~150 KB gzipped) is loaded after first paint during idle time, and it pauses when off-screen or when the tab is hidden.

## Run locally

Requires Node.js 18.18+ (22 recommended).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
npm start          # serve ./out locally
```

## Deploy

Deployment is automatic. `.github/workflows/deploy.yml` builds the site and publishes `out/` to GitHub Pages whenever you push to `main`. You can also run it by hand from **Actions → Deploy portfolio to GitHub Pages → Run workflow**.

To use **Vercel** or **Netlify** instead, import this repository in their dashboard. Use the build command `npm run build` and the output directory `out`. No further configuration is needed.

## Connect a custom domain later

1. Buy a domain, for example `mohamedragab.com` or `mohamedragab.dev`.
2. On GitHub, open **Settings → Pages → Custom domain**, enter the domain and save. GitHub commits a `CNAME` file for you.
3. At your domain registrar, add DNS records:
   - **Apex domain** (`mohamedragab.com`): four `A` records pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`. Add `AAAA` records too if the registrar supports IPv6: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153` and `2606:50c0:8003::153`.
   - **`www` subdomain**: a `CNAME` record pointing to `mohamedragab4554.github.io`.
4. When the DNS check passes (minutes to a few hours), tick **Enforce HTTPS**.
5. Optional: verify the domain under **Settings → Pages → Verified domains** to protect it.

The site uses root-relative paths, so it works on a custom domain without changes.

## Update content

All text and numbers live in `content/`. You rarely need to edit components.

| File | Controls |
|---|---|
| `content/profile.ts` | Name, role title, headline, contact details (email, LinkedIn, `phones`), proof metrics, capability pillars, and the switches `showEmployerNames` and `useIndustryPhotos` |
| `content/projects.ts` | Case studies: summary, challenge, what I did, workflow steps, tools, metrics, charts, gallery, limitations, sources, code links |
| `content/story.ts` | Project accent colours, input-data cards, before/after pairs, inference-viewer images, systems map, programme timeline, and the home-page "Beyond the model" showcase (`showcase`) |
| `content/experience.ts` | Roles and grouped skills |
| `content/research.ts` | Dissertation, education, certifications |

- **Edit text or a metric:** change the value in `content/`, commit and push. The site redeploys in about 2 minutes.
- **Add a project:** copy an object in `projects.ts` and give it a new `slug`. Then add its accent, inputs and optional comparison in `story.ts`, and put images in `public/images/<slug>/`. The page `/projects/<slug>/` is generated automatically.
- **Add or replace images:** use WebP, under about 1,600 px wide. `scripts/prepare_assets.py` and `scripts/prepare_interactive.py` regenerate them from the original files; originals are never modified.
- **Sources:** keep the evidence path in each metric's `source`. `lib/cite.ts` turns it into a readable citation on the page; add a rule there for a new source folder.
- **CV download:** `public/Mohamed_Ragab_CV.pdf` is generated from `scripts/cv/cv.html` with `python scripts/build_cv.py`. You can also replace the PDF with your own file under the same name.

You can edit files directly on github.com: open the file, click the pencil icon, then **Commit changes**. The site redeploys automatically.

## Visual assets and sources

Every image is a real input, output or screenshot from my own project files. Faces, addresses, coordinates and client identifiers are cropped or blurred, and client drawings are not reproduced. The hero visual is procedural and illustrative, and the page labels it as such.

| File | Source |
|---|---|
| `/images/dissertation/unet-outputs.webp` | MSc\Dissertation\02-pub\Diss\Mohamed Ragab-B00968029.pdf (Fig. 18, PDF p.36) |
| `/images/dissertation/fpn-multidefect.webp` | MSc\Dissertation\02-pub\Diss\Mohamed Ragab-B00968029.pdf (Fig. 22, PDF p.40) |
| `/images/dissertation/yolo-false-positives.webp` | MSc\Dissertation\02-pub\Diss\Mohamed Ragab-B00968029.pdf (Fig. 20, PDF p.39) |
| `/images/dissertation/external-validation.webp` | MSc\Dissertation\02-pub\Diss\Mohamed Ragab-B00968029.pdf (Fig. 16, PDF p.34) |
| `/images/dissertation/multidefect-site.webp` | MSc\Dissertation\02-pub\Diss\Mohamed Ragab-B00968029.pdf (Fig. 19, PDF p.37) |
| `/images/dissertation/unet-loss.webp` | MSc\Dissertation\02-pub\Diss\Mohamed Ragab-B00968029.pdf (Fig. 17, PDF p.35) |
| `/images/dissertation/yolo11x-val-batch.webp` | MSc\Dissertation\Final\Final\11x-val_batch0_pred.jpg |
| `/images/aecom/revit-tank.webp` | AECAI\Aecom\TANK.png (copy of MSc\BEN-715-IND work) |
| `/images/aecom/tank-site-model.webp` | CV\01-TEMP-UNI\01-Ganeral BIM\Egypt\Mohamed_Ragab_AI_Driven_Digital_Twin_Portfolio-1 (1).pdf p.5 |
| `/images/aecom/crack-classes.webp` | AECAI\Aecom\Class2.png |
| `/images/aecom/crack-masks.webp` | AECAI\Aecom\MASK-RCNN.png |
| `/images/aecom/powerbi-3d.webp` | AECAI\Aecom\IOT.png |
| `/images/aecom/live-table.webp` | Digital_Twin_Portfolio PDF p.6 |
| `/images/aecom/mobile-view.webp` | Digital_Twin_Portfolio PDF p.7 |
| `/images/aecom/vgg16-curves.webp` | MSc\BEN-715-IND\REPORT\Mohamed Ragab - B00968029.pdf (Fig. 9) |
| `/images/aecom/cnn-baseline-curves.webp` | MSc\BEN-715-IND\REPORT\Mohamed Ragab - B00968029.pdf (Fig. 8) |
| `/images/brinell/revit-render.webp` | Digital_Twin_Portfolio PDF p.2 (model: MSc\BEN-714\01-PROJECT\00-Final\*.rvt) |
| `/images/brinell/revit-exterior.webp` | Digital_Twin_Portfolio PDF p.4 |
| `/images/brinell/structural-frame.webp` | Digital_Twin_Portfolio PDF p.4 |
| `/images/brinell/clash.webp` | Digital_Twin_Portfolio PDF p.4 |
| `/images/brinell/powerbi.webp` | Digital_Twin_Portfolio PDF p.3 |
| `/images/brinell/dynamo.webp` | Digital_Twin_Portfolio PDF p.3 |
| `/images/aecai/dashboard.webp` | AECAI\04-campaign\AECAI APP\1.png |
| `/images/aecai/asset.webp` | AECAI\04-campaign\AECAI APP\2.png |
| `/images/aecai/photos-cv.webp` | AECAI\04-campaign\AECAI APP\4.png |
| `/images/aecai/inspection-form.webp` | AECAI\04-campaign\AECAI APP\5.png |
| `/images/aecai/ai-scan.webp` | AECAI\04-campaign\AECAI APP\6.png |
| `/images/aecai/form-builder.webp` | AECAI\04-campaign\AECAI APP\3.png |
| `/images/drawings/pred-batch-0.webp` | AECAI\AGECS\06-structural elements detection\AGECS\AGECS\outputs\training_runs\beam_wall_seg_v1\val_batch0_pred.jpg |
| `/images/drawings/pred-batch-1.webp` | ...\beam_wall_seg_v1\val_batch1_pred.jpg |
| `/images/drawings/pred-batch-2.webp` | ...\beam_wall_seg_v1\val_batch2_pred.jpg |
| `/images/drawings/confusion.webp` | ...\beam_wall_seg_v1\confusion_matrix_normalized.png |
| `/images/scan/pointnet-seg.webp` | AECAI\AGECS\02-Scan_to_BIM\01-structural elements\2026-06-08_hospital-synthetic-bimstruct3d\results\figures\02_segmentation_3d.png |
| `/images/scan/raw-vs-labeled.webp` | ...\hospital-synthetic-bimstruct3d\results\figures\vis_raw_vs_labeled.png |
| `/images/scan/per-class.webp` | ...\hospital-synthetic-bimstruct3d\results\figures\vis_per_class_isolated.png |
| `/images/scan/kladno-slab-classification.webp` | AECAI\AGECS\02-Scan_to_BIM\01-structural elements\2026-08-06_kladno-station\outputs\comparison_images\arch_level0_classification.png |
| `/images/scan/site-structural-plan.webp` | ...\2026-09-01_<client>\PIPELINE_ARCHITECTURE.html (embedded figure; title and coordinates cropped) |
| `/images/scan/shoring-rejection.webp` | ...\2026-09-01_<client>\PIPELINE_ARCHITECTURE.html (embedded figure; coordinates cropped) |
| `/images/profile/headshot.webp` | CV\x\me.jpeg |
| `/images/inference/20250220_092206_input.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · 20250220_092206 (input) |
| `/images/inference/20250220_092206_yolo11x.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · 20250220_092206 (yolo11x) |
| `/images/inference/20250220_092206_unet.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · 20250220_092206 (unet) |
| `/images/inference/20250220_092206_multi.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · 20250220_092206 (multi) |
| `/images/inference/20250220_092206_mask.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · 20250220_092206 (mask) |
| `/images/inference/20250220_083026_input.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · 20250220_083026 (input) |
| `/images/inference/20250220_083026_yolo11x.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · 20250220_083026 (yolo11x) |
| `/images/inference/20250220_083026_unet.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · 20250220_083026 (unet) |
| `/images/inference/20250220_083026_multi.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · 20250220_083026 (multi) |
| `/images/inference/20250220_083026_mask.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · 20250220_083026 (mask) |
| `/images/inference/IMG_3442_input.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · IMG_3442 (input) |
| `/images/inference/IMG_3442_yolo11x.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · IMG_3442 (yolo11x) |
| `/images/inference/IMG_3442_unet.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · IMG_3442 (unet) |
| `/images/inference/IMG_3442_multi.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · IMG_3442 (multi) |
| `/images/inference/IMG_3442_mask.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · IMG_3442 (mask) |
| `/images/inference/20250220_100459_input.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · 20250220_100459 (input) |
| `/images/inference/20250220_100459_yolo11x.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · 20250220_100459 (yolo11x) |
| `/images/inference/20250220_100459_unet.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · 20250220_100459 (unet) |
| `/images/inference/20250220_100459_multi.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · 20250220_100459 (multi) |
| `/images/inference/20250220_100459_mask.webp` | AECAI\v11n vs. v11x vs. v8x\{real life images|crack_detection_outputs_v11x|crack_detection_outputs_unet|multiclass_segmentation_output|crack_detection_outputs_unet\masks} · 20250220_100459 (mask) |
| `/images/compare/drawings-labels.webp` | AECAI\AGECS\06-structural elements detection\...\beam_wall_seg_v1\val_batch1_labels.jpg |
| `/images/compare/drawings-pred.webp` | AECAI\AGECS\06-structural elements detection\...\beam_wall_seg_v1\val_batch1_pred.jpg |
| `/images/compare/scan-raw.webp` | ...\hospital-synthetic-bimstruct3d\results\figures\vis_raw_vs_labeled.png (left half) |
| `/images/compare/scan-labelled.webp` | ...\hospital-synthetic-bimstruct3d\results\figures\vis_raw_vs_labeled.png (right half) |
| `/images/compare/tank-crack-image.webp` | AECAI\Aecom\MASK-RCNN.png (bottom-left) |
| `/images/compare/tank-crack-mask.webp` | AECAI\Aecom\MASK-RCNN.png (top-left) |

## Accessibility and performance

- Semantic landmarks, a skip link, visible focus rings, and keyboard-operable controls (slider, tabs, radio groups and the image viewer with Esc / ← / →).
- Every chart has a data table. Every image has alt text. Colour contrast is WCAG AA or better.
- Fonts are self-hosted (IBM Plex Sans / Mono and Archivo) with `font-display: swap`. There are no third-party requests at runtime.
- Images are lazy-loaded. The WebGL scene caps its pixel ratio, uses fewer points on small screens, and only renders frames while something is changing.
