"""Convert the static Next.js export (./out) into a self-contained multi-page bundle
for hosting as a claude.ai Artifact (or any host that only serves plain files).

- strips the React runtime (every page is fully pre-rendered HTML already)
- flattens routes to root-level .html files with relative links
- inlines the Tailwind CSS, swaps self-hosted fonts for Google Fonts (allowed by the Artifact CSP)
- adds a small vanilla script: image lightbox, copy-email button, CV save via the `downloads` capability

Run after `npm run build`:  python scripts/export_artifact.py
Output: ./artifact/
"""
import glob, os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "out")
DST = os.path.join(ROOT, "artifact")

ROUTES = {  # route -> output filename ("" = the artifact's main page)
    "/": "",
    "/experience/": "experience.html",
    "/research/": "research.html",
    "/about/": "about.html",
    "/projects/": "projects.html",
}
for d in sorted(glob.glob(os.path.join(OUT, "projects", "*", "index.html"))):
    slug = os.path.basename(os.path.dirname(d))
    ROUTES[f"/projects/{slug}/"] = f"project-{slug}.html"

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900'
         '&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">')

EXTRA_CSS = """
:root{--font-sans:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
--font-mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
--font-display:"Archivo","IBM Plex Sans",system-ui,sans-serif;color-scheme:light}
body{background:#F7F7F4;color:#101418;font-family:var(--font-sans);font-size:16px;line-height:1.5;margin:0}
header.sticky{top:env(safe-area-inset-top,0px)}
.lb{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(6,12,20,.78)}
.lb[hidden]{display:none!important}
.lb-panel{display:flex;flex-direction:column;width:min(96vw,1400px);max-height:92vh;border-radius:12px;overflow:hidden;background:#0E1B2C;color:#fff;border:1px solid rgba(255,255,255,.12)}
.lb-bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.1);font-size:14px}
.lb-bar p{margin:0;color:rgba(255,255,255,.82)}
.lb-bar button{background:transparent;color:#fff;border:0;border-radius:6px;padding:6px 10px;font-size:16px;cursor:pointer}
.lb-bar button:hover{background:rgba(255,255,255,.1)}
.lb-img{overflow:auto;background:#fff;padding:8px;display:flex;justify-content:center}
.lb-img img{max-height:80vh;width:auto;max-width:100%;height:auto}
"""

SCRIPT = r"""<script>
(function(){
  // copy email
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click',function(){
      var t=b.getAttribute('data-copy'), l=b.querySelector('[data-copy-label]')||b;
      var ok=function(){l.textContent='Copied';setTimeout(function(){l.textContent='Copy'},1800)};
      try{navigator.clipboard.writeText(t).then(ok,function(){})}catch(e){}
    });
  });
  // CV: offer the PDF through the viewer's save dialog when available; otherwise the link opens the PDF
  var dl=null;
  try{ if(window.claude&&window.claude.use){ window.claude.use('downloads').then(function(d){dl=d},function(){}) } }catch(e){}
  document.querySelectorAll('a[data-cv]').forEach(function(a){
    a.addEventListener('click',function(ev){
      if(!dl) return;
      ev.preventDefault();
      fetch(a.getAttribute('href')).then(function(r){return r.blob()}).then(function(b){
        return dl.save({filename:'Mohamed_Ragab_CV.pdf',data:b});
      }).catch(function(){});
    });
  });
  // lightbox
  var btns=[].slice.call(document.querySelectorAll('button[aria-label^="Enlarge image"]'));
  if(!btns.length) return;
  var items=btns.map(function(b){var i=b.querySelector('img');var f=b.closest('figure');var c=f&&f.querySelector('figcaption');
    return {src:i.getAttribute('src'),alt:i.getAttribute('alt')||'',cap:c?c.textContent.replace(/^Fig\.\s*\d+\s*/,''):''}});
  var lb=document.createElement('div');lb.className='lb';lb.hidden=true;lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Image viewer');
  lb.innerHTML='<div class="lb-panel"><div class="lb-bar"><p></p><div><button type="button" data-a="prev" aria-label="Previous image">&larr;</button><button type="button" data-a="next" aria-label="Next image">&rarr;</button><button type="button" data-a="close" aria-label="Close image viewer">&#10005;</button></div></div><div class="lb-img"><img alt=""></div></div>';
  document.body.appendChild(lb);
  var cur=0,last=null,img=lb.querySelector('img'),cap=lb.querySelector('p');
  function show(i){cur=(i+items.length)%items.length;img.src=items[cur].src;img.alt=items[cur].alt;cap.textContent=items[cur].cap}
  function open(i){last=document.activeElement;show(i);lb.hidden=false;lb.querySelector('[data-a=close]').focus()}
  function close(){lb.hidden=true;if(last)last.focus()}
  btns.forEach(function(b,i){b.addEventListener('click',function(){open(i)})});
  lb.addEventListener('click',function(e){var a=e.target.closest('[data-a]');if(a){var k=a.getAttribute('data-a');if(k==='close')close();else show(cur+(k==='next'?1:-1));}else if(e.target===lb)close();});
  document.addEventListener('keydown',function(e){if(lb.hidden)return;if(e.key==='Escape')close();if(e.key==='ArrowRight')show(cur+1);if(e.key==='ArrowLeft')show(cur-1)});
})();
</script>"""


def load_css():
    css = "".join(open(f, encoding="utf8").read() for f in sorted(glob.glob(os.path.join(OUT, "_next", "static", "css", "*.css"))))
    css = re.sub(r"@font-face\s*\{[^}]*\}", "", css)
    return css + EXTRA_CSS


def rewrite(html, is_main):
    def url(u):
        path, frag = (u.split("#", 1) + [""])[:2]
        frag = ("#" + frag) if frag else ""
        if u.startswith(("http", "mailto:", "tel:", "#")):
            return u
        if path in ROUTES:
            target = ROUTES[path]
            if target == "":
                return frag if (is_main and frag) else "./" + frag
            return target + frag
        if path.startswith("/images/") or path == "/Mohamed_Ragab_CV.pdf":
            return path.lstrip("/")
        return u

    html = re.sub(r'(href|src)="([^"]+)"', lambda m: f'{m.group(1)}="{url(m.group(2))}"', html)
    # CV links: no `download` attribute (inert in the Artifact sandbox); mark for the save script
    html = re.sub(r'<a ([^>]*?)href="Mohamed_Ragab_CV.pdf"([^>]*?) download=""', r'<a \1href="Mohamed_Ragab_CV.pdf"\2 data-cv target="_blank" rel="noopener"', html)
    html = re.sub(r'<a ([^>]*?)href="Mohamed_Ragab_CV.pdf" download=""([^>]*)>', r'<a \1href="Mohamed_Ragab_CV.pdf" data-cv target="_blank" rel="noopener"\2>', html)
    html = html.replace(' download=""', "")
    return html


def body_of(path):
    s = open(path, encoding="utf8").read()
    title = re.search(r"<title>(.*?)</title>", s, re.S).group(1)
    desc = re.search(r'<meta name="description" content="([^"]*)"', s)
    body = re.search(r"<body[^>]*>(.*)</body>", s, re.S).group(1)
    body = re.sub(r"<script\b[^>]*>.*?</script>", "", body, flags=re.S)
    body = re.sub(r"<dialog\b.*?</dialog>", "", body, flags=re.S)
    body = re.sub(r"<!--/?\$[!?]?-->", "", body)
    return title, (desc.group(1) if desc else ""), body


def main():
    if os.path.exists(DST):
        shutil.rmtree(DST)
    os.makedirs(DST)
    css = load_css()
    for route, name in ROUTES.items():
        src = os.path.join(OUT, route.strip("/"), "index.html") if route != "/" else os.path.join(OUT, "index.html")
        title, desc, body = body_of(src)
        is_main = name == ""
        body = rewrite(body, is_main)
        if is_main:
            doc = (f"<title>Mohamed Ragab Portfolio</title>\n<meta name=\"description\" content=\"{desc}\">\n{FONTS}\n"
                   f"<style>{css}</style>\n{body}\n{SCRIPT}\n")
            open(os.path.join(DST, "index.html"), "w", encoding="utf8").write(doc)
        else:
            doc = ('<!doctype html><html lang="en-GB"><head><meta charset="utf-8">'
                   '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
                   f"<title>{title}</title><meta name=\"description\" content=\"{desc}\">{FONTS}<style>{css}</style></head>"
                   f"<body>{body}{SCRIPT}</body></html>")
            open(os.path.join(DST, name), "w", encoding="utf8").write(doc)
    shutil.copytree(os.path.join(OUT, "images"), os.path.join(DST, "images"), ignore=shutil.ignore_patterns("manifest.json"))
    shutil.copy(os.path.join(OUT, "Mohamed_Ragab_CV.pdf"), DST)
    print("pages:", len(ROUTES), "->", DST)


if __name__ == "__main__":
    main()
