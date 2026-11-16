from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, sys

import os
F = os.path.dirname(os.path.abspath(__file__)) + "/fonts/"
ANTON = F + "anton-400.woff"
MB = F + "montserrat-800.woff"
MS = F + "montserrat-600.woff"
GOLD = (212, 175, 55)
GOLD_L = (245, 214, 120)
RED = (200, 16, 46)
W = H = 1080


def font(p, s):
    return ImageFont.truetype(p, s)


def ctext(d, y, txt, f, fill, spacing=0):
    if spacing:
        widths = [d.textlength(c, font=f) for c in txt]
        total = sum(widths) + spacing * (len(txt) - 1)
        x = (W - total) / 2
        for c, w in zip(txt, widths):
            d.text((x, y), c, font=f, fill=fill)
            x += w + spacing
    else:
        w = d.textlength(txt, font=f)
        d.text(((W - w) / 2, y), txt, font=f, fill=fill)


def gold_gradient_text(img, y, txt, f):
    mask = Image.new("L", (W, H), 0)
    md = ImageDraw.Draw(mask)
    w = md.textlength(txt, font=f)
    md.text(((W - w) / 2, y), txt, font=f, fill=255)
    grad = Image.new("RGB", (W, H))
    gd = ImageDraw.Draw(grad)
    for yy in range(H):
        t = (math.sin((yy - y) / 60.0) + 1) / 2
        c = tuple(int(GOLD[i] + (GOLD_L[i] - GOLD[i]) * t) for i in range(3))
        gd.line([(0, yy), (W, yy)], fill=c)
    img.paste(grad, (0, 0), mask)


img = Image.new("RGB", (W, H), (8, 8, 10))
# radial glow
glow = Image.new("L", (W, H), 0)
gdraw = ImageDraw.Draw(glow)
for r in range(520, 0, -8):
    gdraw.ellipse([W / 2 - r, 470 - r, W / 2 + r, 470 + r], fill=int(70 * (1 - r / 520)))
glow = glow.filter(ImageFilter.GaussianBlur(40))
img.paste(Image.new("RGB", (W, H), (60, 45, 12)), (0, 0), glow)

d = ImageDraw.Draw(img)
# frame
d.rectangle([28, 28, W - 28, H - 28], outline=GOLD, width=3)
d.rectangle([40, 40, W - 40, H - 40], outline=(90, 72, 25), width=1)

ctext(d, 78, "DELTA WATCHES  ·  NAIROBI", font(MS, 30), GOLD, spacing=4)
ctext(d, 150, "BLACK", font(ANTON, 250), (255, 255, 255))
gold_gradient_text(img, 395, "NOVEMBER", font(ANTON, 210))
d = ImageDraw.Draw(img)

# red tag
tag = Image.new("RGBA", (760, 120), (0, 0, 0, 0))
td = ImageDraw.Draw(tag)
td.rounded_rectangle([0, 0, 759, 119], radius=14, fill=RED)
tf = font(ANTON, 76)
tt = os.environ.get("TAG", "SAVE UP TO KES 5,200")
td.text(((760 - td.textlength(tt, font=tf)) / 2, 8), tt, font=tf, fill=(255, 255, 255))
tag = tag.rotate(-3, expand=True, resample=Image.BICUBIC)
img.paste(tag, ((W - tag.width) // 2, 668), tag)
d = ImageDraw.Draw(img)

ctext(d, 815, os.environ.get("L1", "18 watches in stock, from KES 1,500"), font(MB, 40), (255, 255, 255))
ctext(d, 870, os.environ.get("L2", "Ready in Nairobi  ·  Men's & Ladies'"), font(MS, 32), (200, 200, 200))
# CTA pill
pf = font(MB, 36)
pt = "WhatsApp us to order  ›"
pw = d.textlength(pt, font=pf)
d.rounded_rectangle([(W - pw) / 2 - 40, 945, (W + pw) / 2 + 40, 1015], radius=35, fill=GOLD)
d.text(((W - pw) / 2, 958), pt, font=pf, fill=(10, 10, 10))

out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "posters/00_black_november_hero.jpg")
img.save(out, quality=92)
print(out)
