from PIL import Image
import os

src_path = r'C:\Users\dylan\.gemini\antigravity\brain\9a994d50-005b-4f3e-a47a-1aa303c95cc9\.user_uploaded\media_1794511209192_29aa3c56.jpg'
out_dir = r'C:\Users\dylan\.gemini\antigravity\scratch\vital-sur\public\brand'
os.makedirs(out_dir, exist_ok=True)

im = Image.open(src_path).convert('RGBA')
w, h = im.size
bg = (247, 241, 229)

# Save original jpg to brand directory
im.convert('RGB').save(os.path.join(out_dir, 'vital-sur-original.jpg'), quality=95)

# Convert to transparent PNG
out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
for y in range(h):
    for x in range(w):
        r, g, b, _ = im.getpixel((x, y))
        dist = ((r - bg[0])**2 + (g - bg[1])**2 + (b - bg[2])**2)**0.5
        if dist <= 10:
            out.putpixel((x, y), (0, 0, 0, 0))
        elif dist < 45:
            alpha = int(255 * (dist - 10) / (45 - 10))
            if alpha > 0:
                f = alpha / 255.0
                fg_r = int(min(255, max(0, (r - (1.0 - f) * bg[0]) / f)))
                fg_g = int(min(255, max(0, (g - (1.0 - f) * bg[1]) / f)))
                fg_b = int(min(255, max(0, (b - (1.0 - f) * bg[2]) / f)))
                out.putpixel((x, y), (fg_r, fg_g, fg_b, alpha))
            else:
                out.putpixel((x, y), (0, 0, 0, 0))
        else:
            out.putpixel((x, y), (r, g, b, 255))

# Vertical / full logo (symbol + text)
bbox = out.getbbox()
vertical_logo = out.crop(bbox)
vertical_logo.save(os.path.join(out_dir, 'logo-vertical.png'))

# Monogram / Isotipo (from top to gap at y=615)
symbol_crop_box = (bbox[0], bbox[1], bbox[2], 615)
symbol_logo = out.crop(symbol_crop_box)
# trim transparent edges
sym_bbox = symbol_logo.getbbox()
symbol_logo = symbol_logo.crop(sym_bbox)
symbol_logo.save(os.path.join(out_dir, 'isotipo.png'))

# Text only (from gap y=650 to bottom)
text_crop_box = (bbox[0], 650, bbox[2], bbox[3])
text_logo = out.crop(text_crop_box)
text_bbox = text_logo.getbbox()
text_logo = text_logo.crop(text_bbox)
text_logo.save(os.path.join(out_dir, 'logo-text.png'))

# Horizontal logo: Symbol on left, Text on right!
# Let's scale symbol to height ~120, and text proportionally to fit nicely side by side
target_h = 100
sym_aspect = symbol_logo.width / symbol_logo.height
new_sym_w = int(target_h * sym_aspect)
scaled_sym = symbol_logo.resize((new_sym_w, target_h), Image.Resampling.LANCZOS)

# scale text height to ~48px
text_target_h = 42
text_aspect = text_logo.width / text_logo.height
new_text_w = int(text_target_h * text_aspect)
scaled_text = text_logo.resize((new_text_w, text_target_h), Image.Resampling.LANCZOS)

gap = 24
h_total_w = new_sym_w + gap + new_text_w
h_total_h = target_h

horizontal_logo = Image.new('RGBA', (h_total_w, h_total_h), (0, 0, 0, 0))
horizontal_logo.paste(scaled_sym, (0, 0), scaled_sym)
# Center text vertically with respect to symbol
text_y = (h_total_h - text_target_h) // 2
horizontal_logo.paste(scaled_text, (new_sym_w + gap, text_y), scaled_text)
horizontal_logo.save(os.path.join(out_dir, 'logo-horizontal.png'))

# Also create favicon/icon
favicon = symbol_logo.resize((64, 64), Image.Resampling.LANCZOS)
favicon.save(os.path.join(out_dir, 'favicon.png'))
favicon.save(os.path.join(out_dir, 'isotipo-64.png'))

print('All logo variants successfully generated in', out_dir)

