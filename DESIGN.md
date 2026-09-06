# Design System: Supercanvas / Concha

## 1. Identidade & Filosofia Visual
O **Supercanvas** adota uma identidade visual intencional, contrastada e refinada, unindo a precisão de ferramentas de conhecimento estilo Obsidian/Linear à imersão sonora e tátil de mesas virtuais. 

O sistema opera exclusivamente em dois modos sincronizados:
- **Dark Mode (Padrão Oficial):** Fundo Midnight Navy (`#17192A`) profundo com tipografia em Marfim Aquecido (`#F4F0E6`), acentos em Periwinkle (`#7F95FF`), Azul Cobalto (`#1831D7`) e brilhos cianos (`#52B1FF`).
- **Light Mode (Modo Claro):** Fundo Marfim Aquecido (`#F4F0E6`) com texto em Midnight Navy profundo (`#17192A`), superfícies em branco puro e elementos de destaque no mesmo gradiente da marca.

---

## 2. Paleta de Cores Oficial

| Token | Hex | Papel Semântico | Aplicação no App |
| :--- | :--- | :--- | :--- |
| **Midnight Navy** | `#17192A` | Background Escuro & Texto Claro | Fundo principal da aplicação, painéis, modais, texto no modo claro |
| **Warm Ivory** | `#F4F0E6` | Foreground Escuro & Fundo Claro | Texto primário de alto contraste no modo escuro, canvas no modo claro |
| **Royal Cobalt** | `#1831D7` | Cor Primária / Ação | Botões primários, CTAs principais, links ativos, indicadores de foco |
| **Soft Periwinkle** | `#7F95FF` | Accent da Marca / Destaque | Ícones, foco de seleção, bordas iluminadas, badge tags, visualizador |
| **Sky Cyan** | `#52B1FF` | Ponto de Luz / Parada 0% | Início do gradiente da marca, detalhes luminosos, destaques de áudio |
| **Ice Blue Pastel** | `#B4D3F1` | Suave / Muted / Bordas | Textos secundários, bordas sutis com opacidade, tags discretas |

---

## 3. Gradiente Linear Oficial da Marca

O gradiente oficial deve ser utilizado em barras de progresso, linhas de brilho, anéis de foco, botões especiais e cabeçalhos em destaque:

- **0%**: `#52B1FF` (100% de opacidade)
- **20%**: `#7F95FF` (100% de opacidade)
- **100%**: `#001FFF` a **80%** de opacidade (`rgba(0, 31, 255, 0.8)`)

### Sintaxe CSS
```css
/* Diagonal (135 graus) */
linear-gradient(135deg, #52B1FF 0%, #7F95FF 20%, rgba(0, 31, 255, 0.8) 100%);

/* Horizontal (to right) */
linear-gradient(to right, #52B1FF 0%, #7F95FF 20%, rgba(0, 31, 255, 0.8) 100%);
```

### Classes Utilitárias do Tailwind / CSS
- `.bg-brand-gradient` &rarr; Gradiente diagonal (135deg)
- `.bg-brand-gradient-h` &rarr; Gradiente horizontal (to right)
- `.text-brand-gradient` &rarr; Texto com preenchimento em gradiente (`bg-clip-text`)
- `.border-brand-gradient` &rarr; Borda estilizada com o gradiente

---

## 4. Tipografia & Hierarquia
- **Sans (Interface Principal):** `'Outfit'`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
- **Serif (RPG & Mística):** `'Cinzel'`, `Georgia`, `serif`
- **Mono (Código & Parâmetros):** `'JetBrains Mono'`, `monospace`

---

## 5. Regras Anti-Padrão (Banned)
1. **Sem temas secundários genéricos:** Temas como `grimdark`, `cyber`, `taverna` e `ethereal` foram descontinuados em favor da identidade única da marca em variantes `dark` e `light`.
2. **Sem fundos preto puro (`#000000`):** O fundo escuro oficial é rigorosamente `#17192A`.
3. **Sem gradientes roxos genéricos de IA:** Todos os gradientes devem utilizar estritamente as paradas `#52B1FF`, `#7F95FF` e `#001FFF` (80%).
4. **Sem texto cinza ilegível:** Textos no modo escuro utilizam `#F4F0E6` (marfim aquecido) ou `#B4D3F1` (ice blue pastel) garantindo contraste WCAG AA+.
