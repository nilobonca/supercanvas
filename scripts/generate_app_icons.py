import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
import os

input_path = r'C:/Users/nilo/.gemini/antigravity/brain/63f7f174-d129-40ef-9450-ec39f25f9c29/.user_uploaded/media_1788661180317.png'
im_cv = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
if im_cv is None:
    raise FileNotFoundError("Input image not found")

alpha = im_cv[:, :, 3]
h, w = alpha.shape

# Threshold to binary mask
_, thresh = cv2.threshold(alpha, 120, 255, cv2.THRESH_BINARY)
contours, hierarchy = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)
filtered_contours = [c for c in contours if cv2.contourArea(c) > 25]

def smooth_contour(pts, window_size=7):
    pts = pts.squeeze()
    n = len(pts)
    if n <= window_size:
        return pts
    half = window_size // 2
    padded = np.pad(pts, ((half, half), (0, 0)), mode='wrap')
    kernel = np.ones(window_size) / window_size
    smoothed_x = np.convolve(padded[:, 0], kernel, mode='valid')
    smoothed_y = np.convolve(padded[:, 1], kernel, mode='valid')
    return np.column_stack([smoothed_x, smoothed_y])

svg_paths = []
for c in filtered_contours:
    smoothed = smooth_contour(c, window_size=7)
    approx = cv2.approxPolyDP(smoothed.astype(np.float32), epsilon=0.4, closed=True)
    d_parts = []
    for i, pt in enumerate(approx):
        x, y = pt[0]
        if i == 0:
            d_parts.append(f"M {x:.2f} {y:.2f}")
        else:
            d_parts.append(f"L {x:.2f} {y:.2f}")
    d_parts.append("Z")
    svg_paths.append(" ".join(d_parts))

path_d = " ".join(svg_paths)

# 1. public/logo.svg (universal currentColor)
svg_logo = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="currentColor" fill-rule="evenodd">
  <path d="{path_d}" />
</svg>
'''
with open(r'd:/Projetos/supercanvas/public/logo.svg', 'w', encoding='utf-8') as f:
    f.write(svg_logo)

# 2. public/favicon.svg (adaptive CSS media query: dark on light theme, white on dark theme)
svg_adaptive = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill-rule="evenodd">
  <style>
    path {{
      fill: #1c1917;
    }}
    @media (prefers-color-scheme: dark) {{
      path {{
        fill: #fdfdfd;
      }}
    }}
  </style>
  <path d="{path_d}" />
</svg>
'''
with open(r'd:/Projetos/supercanvas/public/favicon.svg', 'w', encoding='utf-8') as f:
    f.write(svg_adaptive)

# 3. public/favicon-light.svg (dark for light backgrounds)
svg_light = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill-rule="evenodd">
  <path fill="#18181b" d="{path_d}" />
</svg>
'''
with open(r'd:/Projetos/supercanvas/public/favicon-light.svg', 'w', encoding='utf-8') as f:
    f.write(svg_light)

# 4. public/favicon-dark.svg (white for dark backgrounds)
svg_dark = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill-rule="evenodd">
  <path fill="#ffffff" d="{path_d}" />
</svg>
'''
with open(r'd:/Projetos/supercanvas/public/favicon-dark.svg', 'w', encoding='utf-8') as f:
    f.write(svg_dark)

print("SVG files generated successfully.")

# Generate PNGs and ICO using PIL
raw_pil = Image.open(input_path).convert('RGBA')

# Create dark version (black/stone on transparent)
dark_arr = np.array(raw_pil)
dark_arr[:, :, 0] = 24  # R: #18
dark_arr[:, :, 1] = 24  # G: #18
dark_arr[:, :, 2] = 27  # B: #1b
pil_dark = Image.fromarray(dark_arr, 'RGBA')
pil_dark.save(r'd:/Projetos/supercanvas/public/favicon-light.png')

# Create light version (white on transparent)
light_arr = np.array(raw_pil)
light_arr[:, :, 0] = 255
light_arr[:, :, 1] = 255
light_arr[:, :, 2] = 255
pil_light = Image.fromarray(light_arr, 'RGBA')
pil_light.save(r'd:/Projetos/supercanvas/public/favicon-dark.png')

# Create high-contrast App Icon with luxury squircle (visible on BOTH dark and light taskbars/desktops)
def create_app_icon(size=512):
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    
    # Rounded rectangle dimensions
    padding = int(size * 0.06)
    radius = int(size * 0.22)
    # Dark modern squircle background #0e0e14 with border
    draw.rounded_rectangle(
        [padding, padding, size - padding, size - padding],
        radius=radius,
        fill=(15, 15, 22, 255),
        outline=(50, 48, 65, 255),
        width=max(2, int(size * 0.015))
    )
    
    # Resize shell logo to fit nicely in center (approx 65% of size)
    logo_size = int(size * 0.62)
    scaled_logo = pil_light.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    offset = (size - logo_size) // 2
    canvas.paste(scaled_logo, (offset, offset), scaled_logo)
    return canvas

icon_512 = create_app_icon(512)
icon_512.save(r'd:/Projetos/supercanvas/public/icon-512.png')
icon_512.save(r'd:/Projetos/supercanvas/public/icon.png')

icon_192 = create_app_icon(192)
icon_192.save(r'd:/Projetos/supercanvas/public/icon-192.png')

icon_180 = create_app_icon(180)
icon_180.save(r'd:/Projetos/supercanvas/public/apple-touch-icon.png')

# For favicon.ico: include 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
icon_512.save(r'd:/Projetos/supercanvas/public/favicon.ico', sizes=ico_sizes)

# Also create clean 32x32 and 16x16 PNGs
icon_32 = create_app_icon(32)
icon_32.save(r'd:/Projetos/supercanvas/public/favicon-32x32.png')

icon_16 = create_app_icon(16)
icon_16.save(r'd:/Projetos/supercanvas/public/favicon-16x16.png')

icon_512.save(r'd:/Projetos/supercanvas/public/favicon.png')

print("All PNG and ICO assets generated successfully!")
