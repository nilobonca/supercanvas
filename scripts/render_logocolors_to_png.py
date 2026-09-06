import subprocess
import os
from PIL import Image

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
  <img src="logocolors.svg">
</body>
</html>
'''

temp_html = r'd:\Projetos\supercanvas\public\temp_render.html'
with open(temp_html, 'w', encoding='utf-8') as f:
    f.write(html_content)

temp_png = r'd:\Projetos\supercanvas\public\temp_rendered_logocolors.png'
chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

cmd = [
    chrome_path,
    '--headless=new',
    '--default-background-color=00000000',
    '--window-size=512,512',
    '--force-device-scale-factor=1',
    f'--screenshot={temp_png}',
    temp_html
]

print("Running headless chrome screenshot...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Return code:", res.returncode)

if os.path.exists(temp_png):
    im = Image.open(temp_png)
    print("Rendered successfully! Size:", im.size, "Mode:", im.mode)
    # Clean up temp html
    if os.path.exists(temp_html):
        os.remove(temp_html)
else:
    print("PNG was not created.")
