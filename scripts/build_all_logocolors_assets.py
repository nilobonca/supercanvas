import shutil
import os
from PIL import Image, ImageDraw

svg_src = r'd:\Projetos\supercanvas\public\logocolors.svg'
svg_dest_logo = r'd:\Projetos\supercanvas\public\logo.svg'
svg_dest_favicon = r'd:\Projetos\supercanvas\public\favicon.svg'

# Copy logocolors.svg as canonical logo.svg and favicon.svg
shutil.copyfile(svg_src, svg_dest_logo)
shutil.copyfile(svg_src, svg_dest_favicon)
print("Copied logocolors.svg to logo.svg and favicon.svg.")

rendered_png = r'd:\Projetos\supercanvas\public\temp_rendered_logocolors.png'
im_raw = Image.open(rendered_png).convert('RGBA')

# 1. Clean transparent versions
im_raw.save(r'd:\Projetos\supercanvas\public\favicon.png')
im_raw.save(r'd:\Projetos\supercanvas\public\favicon-dark.png')
im_raw.save(r'd:\Projetos\supercanvas\public\favicon-light.png')

# 2. Resized transparent favicons
fav32 = im_raw.resize((32, 32), Image.Resampling.LANCZOS)
fav32.save(r'd:\Projetos\supercanvas\public\favicon-32x32.png')

fav16 = im_raw.resize((16, 16), Image.Resampling.LANCZOS)
fav16.save(r'd:\Projetos\supercanvas\public\favicon-16x16.png')

# 3. App icon with premium luxury squircle framing
# Ensures 100% visibility on both black and white taskbars / OS desktop backgrounds
def create_squircle_icon(size=512):
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    
    padding = int(size * 0.05)
    radius = int(size * 0.22)
    # Dark obsidian squircle with fine border
    draw.rounded_rectangle(
        [padding, padding, size - padding, size - padding],
        radius=radius,
        fill=(14, 14, 20, 255),
        outline=(45, 42, 58, 255),
        width=max(2, int(size * 0.015))
    )
    
    logo_size = int(size * 0.72)
    scaled_logo = im_raw.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    offset = (size - logo_size) // 2
    canvas.paste(scaled_logo, (offset, offset), scaled_logo)
    return canvas

icon_512 = create_squircle_icon(512)
icon_512.save(r'd:\Projetos\supercanvas\public\icon-512.png')
icon_512.save(r'd:\Projetos\supercanvas\public\icon.png')

icon_192 = create_squircle_icon(192)
icon_192.save(r'd:\Projetos\supercanvas\public\icon-192.png')

icon_180 = create_squircle_icon(180)
icon_180.save(r'd:\Projetos\supercanvas\public\apple-touch-icon.png')

# 4. Multi-size favicon.ico
ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
icon_512.save(r'd:\Projetos\supercanvas\public\favicon.ico', sizes=ico_sizes)

# Clean up temp files if they exist
if os.path.exists(r'd:\Projetos\supercanvas\public\temp_rendered_logocolors.png'):
    os.remove(r'd:\Projetos\supercanvas\public\temp_rendered_logocolors.png')
if os.path.exists(r'd:\Projetos\supercanvas\public\temp_render.html'):
    os.remove(r'd:\Projetos\supercanvas\public\temp_render.html')

print("All logocolors assets generated successfully!")
