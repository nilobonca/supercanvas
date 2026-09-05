# Regra de Verificação Obrigatória de Skills - Supercanvas

Esta regra é carregada automaticamente pelo Antigravity através do diretório `.agents/rules/`.

## Ciclo Obrigatório de Verificação de Skills

Em **qualquer interação** neste projeto, o assistente **DEVE** avaliar o seguinte catálogo antes de responder ou executar código:

### 1. Núcleo de Engenharia & Arquitetura
- `componentization-first`: Modularidade atômica e separação estrita de UI e lógica de negócio.
- `vercel-react-best-practices`: Boas práticas de arquitetura e performance em React 19 / Next.js.
- `ai-readable-features`: Registro e adaptação de novas features/blocos no `aiService` do app.
- `multi-agent-loops`: Delegação e loops de execução com subagentes em tarefas complexas ou paralelas.
- `full-output-enforcement`: Código integral sem reticências ou omissões.

### 2. Catálogo Completo de Design, UI & UX
- `design-taste-frontend`: Padrões visuais refinados, tipografia de alto nível, anti-slop.
- `high-end-visual-design`: Estética de agências premium, sombras, grids e cards refinados.
- `brandkit`: Criação e padronização de identidade visual, moodboards e design tokens.
- `image-to-code`: Tradução fiel de referências visuais e mockups para código.
- `imagegen-frontend-web`: Geração de referências visuais conceituais para interfaces web/desktop.
- `imagegen-frontend-mobile`: Concepção de fluxos visuais e interfaces responsivas/mobile.
- `minimalist-ui`: Interfaces editoriais, limpas, paletas quentes/monocromáticas e tipografia refinada.
- `industrial-brutalist-ui`: Estética técnica, blueprints de dados densos e utilitários de alta densidade.
- `gpt-taste`: Motion design avançado, animações (Framer Motion / GSAP) e micro-interações fluidas.
- `generative_ui`: Widgets e interfaces interativas auto-contidas no chat/canvas.
- `redesign-existing-projects`: Modernização e upgrade estético de telas existentes sem quebrar funcionalidades.
- `design-an-interface`: Exploração de interfaces e arquiteturas visuais alternativas em paralelo.
- `taste-design` & `stitch-design-taste`: Diretrizes semânticas de design systems e criação de arquivos `DESIGN.md`.

### 3. Protocolo de Resposta
1. Verificar as skills aplicáveis à solicitação.
2. Carregar o arquivo `SKILL.md` via `view_file` caso as regras específicas ainda não estejam no contexto.
3. Exibir o cabeçalho obrigatório na primeiríssima linha da resposta:
   - `🎯 **Skills Ativas**: [skill-1, skill-2, ...]` ou
   - `🎯 **Skills Ativas**: Nenhuma (tarefa direta/investigativa)`
