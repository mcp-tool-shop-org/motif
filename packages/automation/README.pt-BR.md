<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/automation

Automação expressiva para Motif — trilhas, interpolação, macros, envelopes e captura em tempo real.

## O que ele oferece

- Criação e gerenciamento de trilhas de automação e pontos.
- Interpolação de valores baseada no tempo (linear).
- Gerenciamento de estados de macros e mapeamento de múltiplos parâmetros.
- Envelopes de seção para a estrutura dinâmica de comandos.
- Gravação, filtragem e aplicação de captura em tempo real.

## Principais exportações

### Trilhas (`lanes.ts`)
- `createLane(id, target, points)` — cria uma trilha com um alvo e pontos iniciais.
- `makeTarget(param, entityId)` — cria um alvo de automação.
- `addPoint` / `removePointAt` / `updatePoint` / `clearLane`
- `lanesForTarget` / `lanesForParam` / `laneTimeSpan`

### Interpolação (`interpolate.ts`)
- `evaluateLane(lane, timeMs)` — valor interpolado em qualquer momento.
- `interpolate(pointA, pointB, timeMs)` — interpolação linear.
- `sampleLane(lane, startMs, endMs, stepMs)` — amostragem em intervalos regulares.
- `evaluateLanesAt(lanes, timeMs)` — avalia múltiplas trilhas simultaneamente.

### Macros (`macros.ts`)
- `defaultMacroState()` — valores padrão de intensidade/tensão/energia.
- `createMacroMapping(id, macro, param, options)` — mapeia macro → parâmetro.
- `evaluateMacros(mappings, macroState)` — calcula todos os valores de parâmetros.
- `applyMacroInfluence(baseValue, macroValue, influence)` — cálculo de influência individual.
- `mappingsForMacro` / `macrosAffectingParam`

### Envelopes (`envelopes.ts`)
- `createEnvelope(id, target, sectionRole, points)` — automação com escopo de seção.
- `evaluateEnvelope(envelope, timeMs)` — valor de envelope interpolado.
- `envelopesForTarget` / `entryEnvelopes` / `exitEnvelopes`

### Captura (`capture.ts`)
- `createCapture(id, name, source)` — inicia uma sessão de captura.
- `recordPoint(capture, timeMs, value)` — registra um valor.
- `finalizeCapture(capture)` — marca como concluída.
- `applyCaptureToLane` / `mergeCaptureIntoLane` — aplica a trilhas.
- `thinCapture(capture, tolerance)` — reduz a densidade de pontos.
- `captureDuration(capture)` — duração total.

## O que ele não oferece

- Processamento de áudio ou efeitos.
- Orquestração ou reprodução de cenas.
- Composição de clipes.
- Componentes de interface do usuário.

## Dependências

- `@motif/schema` — tipos para trilhas, alvos, pontos, macros, envelopes, capturas.
