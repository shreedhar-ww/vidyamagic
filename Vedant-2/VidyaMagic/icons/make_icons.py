"""Generate PWA icons (192x192 and 512x512) for VidyaMagic."""
from PIL import Image, ImageDraw, ImageFont
import os

HERE = os.path.dirname(__file__)

def make_icon(size, out_path):
    img = Image.new('RGB', (size, size), '#9B5DE5')
    d = ImageDraw.Draw(img)

    # Diagonal gradient effect using overlapping rectangles
    for i in range(size):
        # interpolate from purple → pink → orange
        t = i / size
        if t < 0.5:
            tt = t * 2
            r = int(0x9B + (0xF1 - 0x9B) * tt)
            g = int(0x5D + (0x5B - 0x5D) * tt)
            b = int(0xE5 + (0xB5 - 0xE5) * tt)
        else:
            tt = (t - 0.5) * 2
            r = int(0xF1 + (0xFF - 0xF1) * tt)
            g = int(0x5B + (0x6B - 0x5B) * tt)
            b = int(0xB5 + (0x35 - 0xB5) * tt)
        d.line([(0, i), (size, i)], fill=(r, g, b))

    # Big "V" + "M" letters in white
    try:
        font_size = int(size * 0.55)
        font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', font_size)
    except Exception:
        font = ImageFont.load_default()

    text = 'VM'
    bbox = d.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) // 2 - bbox[0]
    y = (size - th) // 2 - bbox[1] - int(size * 0.04)
    # subtle shadow
    d.text((x + 4, y + 4), text, fill=(0, 0, 0, 100), font=font)
    d.text((x, y), text, fill='white', font=font)

    # Star at corner
    star_size = int(size * 0.12)
    sx, sy = size - star_size - int(size*0.08), int(size*0.08)
    d.ellipse([sx, sy, sx + star_size, sy + star_size], fill='#FFD93D')

    img.save(out_path, 'PNG')
    print(f'wrote {out_path} ({size}x{size})')

make_icon(192, os.path.join(HERE, 'icon-192.png'))
make_icon(512, os.path.join(HERE, 'icon-512.png'))
