import subprocess
import shutil
import os
from PIL import Image

chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

# 1. Copy logocolorslight.svg to favicon-light.svg
shutil.copyfile(r'd:\Projetos\supercanvas\public\logocolorslight.svg', r'd:\Projetos\supercanvas\public\favicon-light.svg')
shutil.copyfile(r'd:\Projetos\supercanvas\public\logocolors.svg', r'd:\Projetos\supercanvas\public\favicon-dark.svg')
print("Copied SVG files.")

# 2. Render logocolorslight.svg to PNG using headless chrome
html_content = '''<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: transparent;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 512px;
      height: 512px;
    }
    img {
      width: 512px;
      height: 512px;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <img src="logocolorslight.svg">
</body>
</html>
'''
temp_html = r'd:\Projetos\supercanvas\public\temp_render_light.html'
with open(temp_html, 'w', encoding='utf-8') as f:
    f.write(html_content)

temp_png = r'd:\Projetos\supercanvas\public\temp_light_rendered.png'

cmd = [
    chrome_path,
    '--headless=new',
    '--default-background-color=00000000',
    '--window-size=512,512',
    '--force-device-scale-factor=1',
    f'--screenshot={temp_png}',
    temp_html
]

subprocess.run(cmd, check=True)
if os.path.exists(temp_png):
    im_light = Image.open(temp_png).convert('RGBA')
    im_light.save(r'd:\Projetos\supercanvas\public\favicon-light.png')
    
    # Also save 32x32 and 16x16 light PNGs
    im_light.resize((32, 32), Image.Resampling.LANCZOS).save(r'd:\Projetos\supercanvas\public\favicon-light-32.png')
    im_light.resize((16, 16), Image.Resampling.LANCZOS).save(r'd:\Projetos\supercanvas\public\favicon-light-16.png')
    print("Rendered favicon-light.png successfully!")
    
    os.remove(temp_png)
    if os.path.exists(temp_html):
        os.remove(temp_html)
