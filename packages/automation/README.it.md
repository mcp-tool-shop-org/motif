<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/automation

Automazione avanzata per Motif: tracce, interpolazione, macro, inviluppi e acquisizione in tempo reale.

## Funzionalità incluse

- Creazione e gestione di tracce di automazione e dei relativi punti.
- Interpolazione di valori basata sul tempo (lineare).
- Gestione degli stati delle macro e mappature multi-parametro.
- Inviluppi per la struttura dinamica dei segnali.
- Registrazione, filtraggio e applicazione di dati acquisiti in tempo reale.

## Esportazioni principali

### Tracce (`lanes.ts`)
- `createLane(id, target, points)` — crea una traccia con un target e punti iniziali.
- `makeTarget(param, entityId)` — crea un target di automazione.
- `addPoint` / `removePointAt` / `updatePoint` / `clearLane`
- `lanesForTarget` / `lanesForParam` / `laneTimeSpan`

### Interpolazione (`interpolate.ts`)
- `evaluateLane(lane, timeMs)` — valore interpolato in qualsiasi momento.
- `interpolate(pointA, pointB, timeMs)` — interpolazione lineare.
- `sampleLane(lane, startMs, endMs, stepMs)` — campionamento a intervalli regolari.
- `evaluateLanesAt(lanes, timeMs)` — valuta più tracce contemporaneamente.

### Macro (`macros.ts`)
- `defaultMacroState()` — valori predefiniti di intensità/tensione/energia.
- `createMacroMapping(id, macro, param, options)` — mappa una macro a un parametro.
- `evaluateMacros(mappings, macroState)` — calcola tutti i valori dei parametri.
- `applyMacroInfluence(baseValue, macroValue, influence)` — calcolo dell'influenza singola.
- `mappingsForMacro` / `macrosAffectingParam`

### Inviluppi (`envelopes.ts`)
- `createEnvelope(id, target, sectionRole, points)` — automazione a livello di sezione.
- `evaluateEnvelope(envelope, timeMs)` — valore dell'inviluppo interpolato.
- `envelopesForTarget` / `entryEnvelopes` / `exitEnvelopes`

### Acquisizione (`capture.ts`)
- `createCapture(id, name, source)` — avvia una sessione di acquisizione.
- `recordPoint(capture, timeMs, value)` — registra un valore.
- `finalizeCapture(capture)` — contrassegna come completata.
- `applyCaptureToLane` / `mergeCaptureIntoLane` — applica a una traccia.
- `thinCapture(capture, tolerance)` — riduce la densità dei punti.
- `captureDuration(capture)` — durata totale.

## Funzionalità non incluse

- Elaborazione audio o effetti.
- Orchestrazione o riproduzione di scene.
- Composizione di clip.
- Componenti dell'interfaccia utente.

## Dipendenze

- `@motif-studio/schema` — tipi per tracce, target, punti, macro, inviluppi, acquisizioni.
