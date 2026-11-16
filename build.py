"""Builds Delta Watches Black November posters (1080x1080) from product photos."""
import io, json, os, sys, urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ANTON = os.path.join(HERE, "fonts/anton-400.woff")
MB = os.path.join(HERE, "fonts/montserrat-800.woff")
MS = os.path.join(HERE, "fonts/montserrat-600.woff")
GOLD = (212, 175, 55)
GOLD_L = (245, 214, 120)
RED = (200, 16, 46)
WHITE = (255, 255, 255)
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
        data = urllib.request.urlopen(src, timeout=60).read()
        return Image.open(io.BytesIO(data)).convert("RGB")
    return Image.open(src).convert("RGB")


def pill(d, x, y, txt, fnt, bg, fg, pad=18, h=48):
    w = d.textlength(txt, font=fnt)
    d.rounded_rectangle([x, y, x + w + pad * 2, y + h], radius=h // 2, fill=bg)
    d.text((x + pad, y + (h - fnt.size) / 2 - 3), txt, font=fnt, fill=fg)
    return w + pad * 2


def poster(p, out):
    img = Image.new("RGB", (W, H), (8, 8, 10))
    glow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(glow).ellipse([140, 150, 940, 830], fill=90)
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    img.paste(Image.new("RGB", (W, H), (70, 52, 14)), (0, 0), glow)
    d = ImageDraw.Draw(img)

    # header band
    d.rectangle([0, 0, W, 112], fill=(0, 0, 0))
    d.line([(0, 112), (W, 112)], fill=GOLD, width=3)
    bf = f(ANTON, 74)
    t1, t2 = "BLACK ", "NOVEMBER"
    w1, w2 = d.textlength(t1, font=bf), d.textlength(t2, font=bf)
    x = (W - w1 - w2) / 2
    d.text((x, 12), t1, font=bf, fill=WHITE)
    d.text((x + w1, 12), t2, font=bf, fill=GOLD_L)

    # product tile
    tile, top = 600, 150
    ph = load(p["image"])
    ph.thumbnail((tile - 24, tile - 24), Image.LANCZOS)
    bg = ph.getpixel((2, 2))
    card = Image.new("RGB", (tile, tile), bg if sum(bg) > 600 else (250, 250, 248))
    card.paste(ph, ((tile - ph.width) // 2, (tile - ph.height) // 2))
    mask = Image.new("L", (tile, tile), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, tile - 1, tile - 1], radius=36, fill=255)
    sh = Image.new("L", (W, H), 0)
    ImageDraw.Draw(sh).rounded_rectangle([(W - tile) // 2 + 8, top + 14, (W + tile) // 2 + 8, top + tile + 14], radius=36, fill=170)
    img.paste((0, 0, 0), (0, 0), sh.filter(ImageFilter.GaussianBlur(18)))
    img.paste(card, ((W - tile) // 2, top), mask)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([(W - tile) // 2 - 4, top - 4, (W + tile) // 2 + 3, top + tile + 3], radius=40, outline=GOLD, width=3)

    # tags on the tile
    lx = (W - tile) // 2 + 18
    pill(d, lx, top + tile - 66, "ONLY 1 IN STOCK", f(MB, 22), (10, 10, 10), GOLD_L, h=46)
    code = f"CODE {p['code']}"
    cf = f(MB, 22)
    cw = d.textlength(code, font=cf) + 36
    pill(d, (W + tile) // 2 - 18 - cw, top + tile - 66, code, cf, GOLD, (10, 10, 10), h=46)

    # save badge
    if p.get("save"):
        cx, cy, r = (W + tile) // 2 - 10, 222, 108
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=RED, outline=WHITE, width=5)
        ctext(d, cy - 72, "SAVE", f(MB, 30), WHITE, cx - r, cx + r)
        ctext(d, cy - 40, f"{p['save']:,}", f(ANTON, 66), WHITE, cx - r, cx + r)
        ctext(d, cy + 46, "KES", f(MB, 26), WHITE, cx - r, cx + r)

    # name
    nf = fit(d, p["name"], MB, 38, W - 120)
    ctext(d, 776, p["name"], nf, WHITE)

    # price block
    nowf = f(ANTON, 104)
    if p.get("was"):
        was = f"WAS KES {p['was']:,}"
        wf = f(MS, 38)
        now = f"NOW KES {p['now']:,}"
        ww, nw, gap = d.textlength(was, font=wf), d.textlength(now, font=nowf), 40
        x = (W - ww - gap - nw) / 2
        d.text((x, 872), was, font=wf, fill=(170, 170, 170))
        d.line([(x - 4, 898), (x + ww + 4, 898)], fill=RED, width=5)
        d.text((x + ww + gap, 836), now, font=nowf, fill=GOLD_L)
    else:
        lab = "BLACK NOVEMBER PRICE"
        lf = f(MB, 30)
        now = f"KES {p['now']:,}"
        lw, nw, gap = d.textlength(lab, font=lf), d.textlength(now, font=nowf), 36
        x = (W - lw - gap - nw) / 2
        d.text((x, 878), lab, font=lf, fill=(200, 200, 200))
        d.text((x + lw + gap, 836), now, font=nowf, fill=GOLD_L)

    # footer
    d.rectangle([0, 990, W, H], fill=GOLD)
    ctext(d, 1006, "NAIROBI DELIVERY  ·  PAY ON DELIVERY  ·  WHATSAPP  ›", f(MB, 34), (10, 10, 10))
    img.save(out, quality=92)
    print("built", out)


if __name__ == "__main__":
    items = json.load(open(os.path.join(HERE, "products.json")))
    outdir = os.path.join(HERE, "posters")
    os.makedirs(outdir, exist_ok=True)
    test = sys.argv[1] if len(sys.argv) > 1 else None
    for p in items:
        if test:
            for code in ("DWA011", "DWB001"):
                q = dict(next(i for i in items if i["code"] == code), image=test)
                poster(q, os.path.join(outdir, code.lower() + ".jpg"))
            break
        poster(p, os.path.join(outdir, p["code"].lower() + ".jpg"))
