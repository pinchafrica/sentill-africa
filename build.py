"""Builds Delta Watches Black November posters from live product photos."""
import io, json, math, os, sys, urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ANTON = os.path.join(HERE, "fonts/anton-400.woff")
MB = os.path.join(HERE, "fonts/montserrat-800.woff")
MS = os.path.join(HERE, "fonts/montserrat-600.woff")
GOLD = (212, 175, 55)
GOLD_L = (245, 214, 120)
RED = (200, 16, 46)
W = H = 1080


def f(p, s):
    return ImageFont.truetype(p, s)


def ctext(d, y, txt, fnt, fill, x0=0, x1=W):
    w = d.textlength(txt, font=fnt)
    d.text((x0 + (x1 - x0 - w) / 2, y), txt, font=fnt, fill=fill)
    return w


def fit(d, txt, path, size, maxw):
    while size > 20 and d.textlength(txt, font=f(path, size)) > maxw:
        size -= 2
    return f(path, size)


def load(src):
    if src.startswith("http"):
        hdr = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
               "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
               "Referer": "https://deltawatches.co.ke/watches"}
        last = None
        for u in (src, src.replace(".webp", "-lg.webp"), src.replace(".webp", "-md.webp"), src.replace(".webp", "-sm.webp")):
            try:
                r = urllib.request.urlopen(urllib.request.Request(u, headers=hdr), timeout=60)
                data = r.read()
                print(u, r.status, r.headers.get("content-type"), len(data), data[:16])
                return Image.open(io.BytesIO(data)).convert("RGB")
            except Exception as e:
                last = e
                print("fail", u, repr(e)[:200])
        raise last
    return Image.open(src).convert("RGB")


def poster(p, out):
    img = Image.new("RGB", (W, H), (8, 8, 10))
    glow = Image.new("L", (W, H), 0)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([140, 150, 940, 830], fill=90)
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    img.paste(Image.new("RGB", (W, H), (70, 52, 14)), (0, 0), glow)
    d = ImageDraw.Draw(img)

    # top band
    d.rectangle([0, 0, W, 112], fill=(0, 0, 0))
    d.line([(0, 112), (W, 112)], fill=GOLD, width=3)
    bf = f(ANTON, 74)
    t1, t2 = "BLACK ", "NOVEMBER"
    w1, w2 = d.textlength(t1, font=bf), d.textlength(t2, font=bf)
    x = (W - w1 - w2) / 2
    d.text((x, 12), t1, font=bf, fill=(255, 255, 255))
    d.text((x + w1, 12), t2, font=bf, fill=GOLD_L)

    # product photo on a soft white rounded tile
    tile = 600
    ph = load(p["image"])
    ph.thumbnail((tile - 30, tile - 30), Image.LANCZOS)
    card = Image.new("RGB", (tile, tile), (250, 250, 248))
    card.paste(ph, ((tile - ph.width) // 2, (tile - ph.height) // 2))
    mask = Image.new("L", (tile, tile), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, tile - 1, tile - 1], radius=36, fill=255)
    sh = Image.new("L", (W, H), 0)
    ImageDraw.Draw(sh).rounded_rectangle([(W - tile) // 2 + 8, 150 + 14, (W + tile) // 2 + 8, 150 + tile + 14], radius=36, fill=160)
    img.paste((0, 0, 0), (0, 0), sh.filter(ImageFilter.GaussianBlur(18)))
    img.paste(card, ((W - tile) // 2, 150), mask)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([(W - tile) // 2 - 4, 146, (W + tile) // 2 + 3, 150 + tile + 3], radius=40, outline=GOLD, width=3)

    # save badge (circle, top right of tile)
    cx, cy, r = (W + tile) // 2 - 10, 222, 108
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=RED, outline=(255, 255, 255), width=5)
    ctext(d, cy - 72, "SAVE", f(MB, 30), (255, 255, 255), cx - r, cx + r)
    ctext(d, cy - 40, f"{p['save']:,}", f(ANTON, 66), (255, 255, 255), cx - r, cx + r)
    ctext(d, cy + 46, "KES", f(MB, 26), (255, 255, 255), cx - r, cx + r)

    # name
    nf = fit(d, p["name"], MB, 40, W - 120)
    ctext(d, 778, p["name"], nf, (255, 255, 255))

    # was / now
    was = f"WAS KES {p['was']:,}"
    wf = f(MS, 38)
    now = f"NOW KES {p['now']:,}"
    nowf = f(ANTON, 104)
    ww = d.textlength(was, font=wf)
    nw = d.textlength(now, font=nowf)
    gap = 40
    x = (W - ww - gap - nw) / 2
    d.text((x, 872), was, font=wf, fill=(170, 170, 170))
    sy = 872 + 26
    d.line([(x - 4, sy), (x + ww + 4, sy)], fill=RED, width=5)
    d.text((x + ww + gap, 836), now, font=nowf, fill=GOLD_L)

    # footer
    d.rectangle([0, 990, W, H], fill=GOLD)
    ctext(d, 1006, "IN STOCK IN NAIROBI  ·  WHATSAPP TO ORDER  ›", f(MB, 38), (10, 10, 10))
    img.save(out, quality=92)
    print("built", out)


if __name__ == "__main__":
    items = json.load(open(os.path.join(HERE, "products.json")))
    outdir = os.path.join(HERE, "posters")
    os.makedirs(outdir, exist_ok=True)
    for p in items:
        if len(sys.argv) > 1:
            p = dict(p, image=sys.argv[1])
        poster(p, os.path.join(outdir, p["code"].lower() + ".jpg"))
        if len(sys.argv) > 1:
            break
