#!/usr/bin/env python3
"""Собирает статичное превью из артбордов холста (.dc.html) в обычные HTML-страницы.

Запуск: python3 tools/build.py <папка с .dc.html> <папка вывода>
"""
import re
import shutil
import sys
from pathlib import Path

LIVE = {"home.html": "js/live-home.js", "case.html": "js/live-case.js"}

# ассеты холста (/_blob/<id>) -> файлы превью
BLOBS = {
    "/_blob/ee25da5eb4234dac2da8a9c76f12d419": "img/wm-t.png",
    "/_blob/990a13dcc9548109e400d3363c575327": "img/wm-buro.png",
    "/_blob/da99a2c5c3c2810c125d5cbd63eb39ec": "img/tt-specimen.png",
}

PAGES = {
    "Main": ("moodboard.html", "fixed"),
    "ConceptA": ("concept-a.html", "fixed"),
    "ConceptB": ("concept-b.html", "fixed"),
    "ConceptC": ("concept-c.html", "fixed"),
    "Palettes": ("palettes.html", "fixed"),
    "Type": ("type.html", "fixed"),
    "UIKit": ("ui-kit.html", "fixed"),
    "MotionHero": ("motion-hero.html", "fixed"),
    "MotionServices": ("motion-services.html", "fixed"),
    "MotionCase": ("motion-case.html", "fixed"),
    "Brief": ("brief.html", "fixed"),
    "HomeDesktop": ("home.html", "fluid"),
    "HomeMobile": ("home-mobile.html", "phone"),
    "CaseDesktop": ("case.html", "fluid"),
    "CaseMobile": ("case-mobile.html", "phone"),
    "ContentSpec": ("content-spec.html", "fixed"),
}

FIT_JS = """
(function(){
  var box = document.getElementById('tb-fit'), root = box.firstElementChild;
  function fit(){
    var w = root.offsetWidth, k = Math.min(1, (window.innerWidth) / w);
    root.style.transform = k < 1 ? 'scale(' + k + ')' : '';
    root.style.transformOrigin = '0 0';
    box.style.height = (root.offsetHeight * k) + 'px';
    box.style.width = (w * k) + 'px';
  }
  window.addEventListener('resize', fit); fit();
  if (document.fonts) document.fonts.ready.then(fit);
})();
"""

BADGE = ('<a href="index.html" style="position:fixed;left:12px;bottom:12px;z-index:99;'
         'background:rgba(14,14,14,.72);color:#F2F0EB;border:1px solid rgba(242,240,235,.3);'
         'border-radius:999px;padding:8px 14px;font:500 12px/1 \'JetBrains Mono\',monospace;'
         'text-decoration:none;backdrop-filter:blur(6px)">← toburo · все материалы</a>')


def section(src, tag):
    m = re.search(r"<%s>(.*?)</%s>" % (tag, tag), src, re.S)
    return m.group(1) if m else ""


def convert(src, mode, live=None):
    title = re.search(r"<title>(.*?)</title>", src, re.S).group(1)
    xdc = section(src, "x-dc")
    helmet = section(xdc, "helmet")
    body = re.sub(r"<helmet>.*?</helmet>", "", xdc, flags=re.S).strip()
    body = re.sub(r'ref="\{\{ refs\.(\w+) \}\}"', r'data-ref="\1"', body)
    for stem, (out, _) in PAGES.items():
        body = body.replace('href="%s.dc.html"' % stem, 'href="%s"' % out)
    for blob, local in BLOBS.items():
        body = body.replace(blob, local)
        helmet = helmet.replace(blob, local)
    if "/_blob/" in body + helmet:
        raise SystemExit("unmapped asset in " + title)
    if "{{" in body:
        raise SystemExit("unresolved template hole in " + title)

    script = ""
    core = re.search(r"// CORE-START(.*?)// CORE-END", src, re.S)
    if core:
        script = ("<script>\n(function(){\nvar R = {};\n"
                  "document.querySelectorAll('[data-ref]').forEach(function(el){ R[el.getAttribute('data-ref')] = el; });\n"
                  "(function(R){" + core.group(1) + "})(R);\n})();\n</script>")

    extra_css = "html,body{margin:0}"
    if mode == "fixed":
        body = '<div id="tb-fit" style="overflow:hidden">' + body + "</div>"
        script += "<script>" + FIT_JS + "</script>"
    elif mode == "phone":
        body = '<div style="display:flex;justify-content:center;background:#060606;min-height:100vh">' + body + "</div>"

    return (
        "<!doctype html>\n<html lang=\"ru\">\n<head>\n<meta charset=\"utf-8\">\n"
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
        "<meta name=\"robots\" content=\"noindex\">\n"
        "<title>" + title + "</title>\n" + helmet + "\n<style>" + extra_css + "</style>\n</head>\n<body>\n"
        + body + "\n" + BADGE + "\n" + script
        + ('\n<script src="' + live + '"></script>' if live else "")
        + "\n</body>\n</html>\n"
    )


def main():
    src_dir, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "js").mkdir(exist_ok=True)
    for js in (Path(__file__).parent / "live").glob("*.js"):
        shutil.copy(js, out_dir / "js" / js.name)
    (out_dir / "img").mkdir(exist_ok=True)
    for png in (Path(__file__).parent / "img").glob("*.png"):
        shutil.copy(png, out_dir / "img" / png.name)
    for stem, (out, mode) in PAGES.items():
        html = convert((src_dir / (stem + ".dc.html")).read_text(encoding="utf-8"), mode, LIVE.get(out))
        (out_dir / out).write_text(html, encoding="utf-8")
        print("built", out)


if __name__ == "__main__":
    main()
