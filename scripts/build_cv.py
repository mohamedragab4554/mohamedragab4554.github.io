"""Render scripts/cv/cv.html to public/Mohamed_Ragab_CV.pdf (requires: pip install playwright)."""
import asyncio, pathlib
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        await pg.goto((ROOT / "cv" / "cv.html").as_uri(), wait_until="networkidle")
        await pg.pdf(path=str(ROOT.parent / "public" / "Mohamed_Ragab_CV.pdf"), format="A4", print_background=True, prefer_css_page_size=True)
        await b.close()
asyncio.run(main())
