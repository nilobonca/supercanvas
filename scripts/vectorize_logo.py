import cv2
import numpy as np
from PIL import Image

input_path = r'C:/Users/nilo/.gemini/antigravity/brain/63f7f174-d129-40ef-9450-ec39f25f9c29/.user_uploaded/media_1788661180317.png'
im = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
if im is None:
    raise FileNotFoundError("Input image not found")

alpha = im[:, :, 3]
h, w = alpha.shape

# Threshold to binary mask
_, thresh = cv2.threshold(alpha, 120, 255, cv2.THRESH_BINARY)

# Find contours
contours, hierarchy = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)

# Filter out noise (tiny specks)
filtered_contours = [c for c in contours if cv2.contourArea(c) > 25]

# Simple moving average smoothing for closed loop
def smooth_contour(pts, window_size=7):
    pts = pts.squeeze()
    n = len(pts)
    if n <= window_size:
        return pts
    # Circular pad
    half = window_size // 2
    padded = np.pad(pts, ((half, half), (0, 0)), mode='wrap')
    kernel = np.ones(window_size) / window_size
    smoothed_x = np.convolve(padded[:, 0], kernel, mode='valid')
    smoothed_y = np.convolve(padded[:, 1], kernel, mode='valid')
    return np.column_stack([smoothed_x, smoothed_y])

svg_paths = []
for c in filtered_contours:
    smoothed = smooth_contour(c, window_size=7)
    # Simplify polygon while preserving smooth curves
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

full_path = " ".join(svg_paths)

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="currentColor" fill-rule="evenodd">
  <path d="{full_path}" />
</svg>
'''

output_svg_path = r'd:/Projetos/supercanvas/public/logo.svg'
with open(output_svg_path, 'w', encoding='utf-8') as f:
    f.write(svg_content)

print(f"Successfully generated SVG at {output_svg_path} with {len(filtered_contours)} contours.")
