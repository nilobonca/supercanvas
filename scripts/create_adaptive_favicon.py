# Read logocolors and logocolorslight path
with open(r'd:\Projetos\supercanvas\public\logocolors.svg', 'r', encoding='utf-8') as f:
    content_dark = f.read()

# Path D is identical in both
path_d = content_dark.split('d="')[1].split('"')[0]

adaptive_favicon_svg = f'''<svg width="176" height="179" viewBox="0 0 176 179" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .theme-dark {{ display: block; }}
    .theme-light {{ display: none; }}
    @media (prefers-color-scheme: light) {{
      .theme-dark {{ display: none; }}
      .theme-light {{ display: block; }}
    }}
  </style>

  <defs>
    <clipPath id="concha_path_clip">
      <path d="{path_d}" />
    </clipPath>

    <!-- Dark Mode Palette: Luminous rainbow tones -->
    <linearGradient id="grad_dark" x1="0" y1="0" x2="500" y2="500" gradientUnits="userSpaceOnUse">
      <stop stop-color="#BFF226" stop-opacity="0.85"/>
      <stop offset="0.1" stop-color="#CCCF43" stop-opacity="0.8375"/>
      <stop offset="0.2" stop-color="#D9AC60" stop-opacity="0.825"/>
      <stop offset="0.3" stop-color="#F26699" stop-opacity="0.8"/>
      <stop offset="0.4" stop-color="#E63359" stop-opacity="0.85"/>
      <stop offset="0.5" stop-color="#9933BF" stop-opacity="0.8"/>
      <stop offset="0.6" stop-color="#4759D9" stop-opacity="0.8"/>
      <stop offset="0.7" stop-color="#1AC7B3" stop-opacity="0.75"/>
      <stop offset="0.8" stop-color="#43D28F" stop-opacity="0.775"/>
      <stop offset="0.9" stop-color="#6CDD6C" stop-opacity="0.8"/>
      <stop offset="1" stop-color="#BFF226" stop-opacity="0.85"/>
    </linearGradient>

    <!-- Light Mode Palette (logocolorslight): Rich, deep, high-contrast rainbow tones -->
    <linearGradient id="grad_light" x1="0" y1="0" x2="500" y2="500" gradientUnits="userSpaceOnUse">
      <stop stop-color="#9CC817" stop-opacity="0.85"/>
      <stop offset="0.1" stop-color="#9D9F27" stop-opacity="0.8375"/>
      <stop offset="0.2" stop-color="#B7842E" stop-opacity="0.825"/>
      <stop offset="0.3" stop-color="#CE4678" stop-opacity="0.8"/>
      <stop offset="0.4" stop-color="#C5193E" stop-opacity="0.85"/>
      <stop offset="0.5" stop-color="#7C14A3" stop-opacity="0.8"/>
      <stop offset="0.6" stop-color="#2032B4" stop-opacity="0.8"/>
      <stop offset="0.7" stop-color="#099E8D" stop-opacity="0.75"/>
      <stop offset="0.8" stop-color="#20AD6C" stop-opacity="0.775"/>
      <stop offset="0.9" stop-color="#3CAC3C" stop-opacity="0.8"/>
      <stop offset="1" stop-color="#94C00D" stop-opacity="0.85"/>
    </linearGradient>
  </defs>

  <!-- Dark Mode Group -->
  <g class="theme-dark">
    <path d="{path_d}" fill="white" />
    <g clip-path="url(#concha_path_clip)">
      <g transform="matrix(0.114 0.012 -0.0209556 0.199078 44.4644 144.358)">
        <rect x="0" y="0" width="1172.81" height="785.973" fill="url(#grad_dark)" opacity="1" shape-rendering="crispEdges"/>
        <rect x="0" y="0" width="1172.81" height="785.973" transform="scale(1 -1)" fill="url(#grad_dark)" opacity="1" shape-rendering="crispEdges"/>
        <rect x="0" y="0" width="1172.81" height="785.973" transform="scale(-1 1)" fill="url(#grad_dark)" opacity="1" shape-rendering="crispEdges"/>
        <rect x="0" y="0" width="1172.81" height="785.973" transform="scale(-1)" fill="url(#grad_dark)" opacity="1" shape-rendering="crispEdges"/>
      </g>
    </g>
    <path d="{path_d}" fill="white" fill-opacity="0.2" />
  </g>

  <!-- Light Mode Group (logocolorslight) -->
  <g class="theme-light">
    <path d="{path_d}" fill="white" />
    <g clip-path="url(#concha_path_clip)">
      <g transform="matrix(0.114 0.012 -0.0209556 0.199078 44.4644 144.358)">
        <rect x="0" y="0" width="1172.81" height="785.973" fill="url(#grad_light)" opacity="1" shape-rendering="crispEdges"/>
        <rect x="0" y="0" width="1172.81" height="785.973" transform="scale(1 -1)" fill="url(#grad_light)" opacity="1" shape-rendering="crispEdges"/>
        <rect x="0" y="0" width="1172.81" height="785.973" transform="scale(-1 1)" fill="url(#grad_light)" opacity="1" shape-rendering="crispEdges"/>
        <rect x="0" y="0" width="1172.81" height="785.973" transform="scale(-1)" fill="url(#grad_light)" opacity="1" shape-rendering="crispEdges"/>
      </g>
    </g>
    <path d="{path_d}" fill="white" fill-opacity="0.2" />
  </g>
</svg>
'''

with open(r'd:\Projetos\supercanvas\public\favicon.svg', 'w', encoding='utf-8') as f:
    f.write(adaptive_favicon_svg)

print("Created adaptive favicon.svg with both dark and light logocolors modes!")
