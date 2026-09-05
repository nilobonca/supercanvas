# Regras de Desenvolvimento e Auditoria de Skills - Supercanvas

Este documento define os padrões obrigatórios para o assistente AI ao trabalhar no projeto **Supercanvas**.

---

## 1. Verificação Obrigatória de Skills a Cada Prompt

Em **toda e qualquer solicitação do usuário**, antes de começar a responder, planejar ou gerar código, o assistente **DEVE** executar o seguinte ciclo de verificação:

### Passo 1: Avaliação do Núcleo de Engenharia & Arquitetura
1. **`componentization-first`**:
   - **Quando ativar**: Criação, refatoração ou expansão de componentes UI, telas ou formulários.
   - **Diretriz**: Exigir modularidade atômica, separação estrita de UI e lógica, hooks customizados e tipagem TypeScript limpa.

2. **`vercel-react-best-practices`**:
   - **Quando ativar**: Qualquer alteração em código React 19 ou Next.js (páginas, hooks, client/server components, estado, renderização).
   - **Diretriz**: Otimização de performance, redução de re-renders desnecessários e boas práticas modernas do ecossistema React/Next.js.

3. **`ai-readable-features`**:
   - **Quando ativar**: Adição de novos tipos de bloco, páginas, componentes, estruturas de dados ou formulários no app.
   - **Diretriz**: Garantir que toda nova feature seja imediatamente indexada e adaptada no serviço de IA (`aiService` / workspace context) para que a IA do app possa lê-la e manipulá-la.

4. **`multi-agent-loops`**:
   - **Quando ativar**: Tarefas complexas, refatorações amplas, pesquisas paralelas ou processos que se beneficiam de decomposição em subagentes.
   - **Diretriz**: Utilizar subagentes especializados em paralelo para pesquisar, implementar ou auditar.

5. **`full-output-enforcement`**:
   - **Quando ativar**: Geração de código de componentes, arquivos novos ou refatorações completas.
   - **Diretriz**: Nunca usar placeholders, reticências (`// ... resto do código ...`) ou código truncado. Sempre fornecer o código integral necessário.

---

### Passo 2: Avaliação do Catálogo Completo de Design, UI & UX
Sempre que a tarefa envolver criação visual, estilização, interfaces, mockups, paleta de cores ou redesign, analise e ative a(s) skill(s) de design correspondente(s):

1. **`design-taste-frontend`**:
   - **Quando ativar**: Interfaces web, páginas e redesigns de UI.
   - **Diretriz**: Padrões visuais refinados, tipografia de alto nível, espaçamentos consistentes, evitando designs genéricos ("AI slop").

2. **`high-end-visual-design`**:
   - **Quando ativar**: Telas, componentes e páginas que precisam de acabamento estético de alto nível.
   - **Diretriz**: Padrões de agências premium — tipografia refinada, sombras calculadas, cards bento sem aspecto genérico de IA.

3. **`brandkit`**:
   - **Quando ativar**: Definição de identidades visuais, moodboards, sistemas de design tokens, paletas de cores ou boards de estilo.
   - **Diretriz**: Construção intencional de identidade visual, tipografia calibrada e linguagem estética consistente.

4. **`image-to-code`**:
   - **Quando ativar**: Implementação de telas a partir de mockups, imagens de referência ou quando for necessário gerar uma imagem antes de codificar.
   - **Diretriz**: Analisar referências visuais com profundidade e implementar componentes idênticos ao layout.

5. **`imagegen-frontend-web`**:
   - **Quando ativar**: Geração e concepção de referências visuais e layouts conceituais para interfaces web / desktop.
   - **Diretriz**: Criação de referências visuais seccionadas e de alto padrão estético.

6. **`imagegen-frontend-mobile`**:
   - **Quando ativar**: Criação de fluxos e layouts para interfaces responsivas/mobile ou visões compactas.
   - **Diretriz**: Composições com hierarquia clara e padrões de design mobile nativo.

7. **`minimalist-ui`**:
   - **Quando ativar**: Criação de interfaces limpas, editoriais e minimalistas.
   - **Diretriz**: Paleta monocromática acolhedora, alto contraste tipográfico, grids planos e ausência de gradientes exagerados.

8. **`industrial-brutalist-ui`**:
   - **Quando ativar**: Dashboards utilitários, painéis técnicos, ferramentas de áudio/RPG ou dados densos.
   - **Diretriz**: Grids rígidos, contraste tipográfico suíço e estética de terminais técnicos/blueprints.

9. **`gpt-taste`**:
   - **Quando ativar**: Motion design avançado, animações ricas, interações e layouts com micro-interações.
   - **Diretriz**: Animações suaves (Framer Motion / GSAP), tipografia editorial larga e grids bento refinados.

10. **`generative_ui`**:
    - **Quando ativar**: Renderização de diagramas, fluxos interativos, tabelas ricas ou widgets HTML interativos no chat/canvas.
    - **Diretriz**: Gerar interfaces visuais e controles interativos auto-contidos.

11. **`redesign-existing-projects`**:
    - **Quando ativar**: Atualização, modernização ou refatoração estética de telas e componentes já existentes.
    - **Diretriz**: Auditar a UI atual, eliminar padrões genéricos de IA e elevar a qualidade visual sem quebrar lógica ou funcionalidades.

12. **`design-an-interface`**:
    - **Quando ativar**: Quando for necessário comparar múltiplas opções de interface ou explorar abordagens visuais/estruturais radicalmente distintas.
    - **Diretriz**: Gerar propostas alternativas de design em paralelo para validação.

13. **`taste-design` & `stitch-design-taste`**:
    - **Quando ativar**: Criação de arquivos `DESIGN.md` e sistemas semânticos de design para o projeto.
    - **Diretriz**: Regras semânticas de design, anti-patterns explícitos e tokens consistentes.

---

### Passo 3: Consulta ao `SKILL.md` (Progressive Disclosure)
- Para cada skill identificada como ativa, o assistente **DEVE consultar o arquivo `SKILL.md`** correspondente via ferramenta `view_file` (caso as diretrizes detalhadas ainda não estejam no contexto) para assegurar conformidade total.

---

### Passo 4: Cabeçalho Visual Obrigatório no Topo da Resposta
**Toda resposta deve obrigatoriamente iniciar com um cabeçalho explícito informando o status das skills**, no seguinte formato:

- Se uma ou mais skills forem ativadas:
  ```markdown
  🎯 **Skills Ativas**: `nome-da-skill-1`, `nome-da-skill-2`
  ```

- Se nenhuma skill do catálogo for aplicável (ex: pergunta direta, comando Git simples, consulta pontual):
  ```markdown
  🎯 **Skills Ativas**: Nenhuma (tarefa direta/investigativa)
  ```

---

## 2. Diretrizes Técnicas do Repositório Supercanvas
- **Stack**: Next.js (App Router / Turbopack), React 19, Electron, Tailwind CSS, Zustand, Lucide Icons, Framer Motion.
- **Integridade de Código**: Nunca remova comentários ou docstrings pré-existentes sem autorização explícita.
- **Tipagem**: TypeScript rigoroso em todos os componentes e utilitários.
