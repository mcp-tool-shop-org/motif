<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/automation

Automatisation avancée pour Motif : pistes, interpolation, macros, enveloppes et enregistrement en direct.

## Fonctionnalités

- Création et gestion des points sur les pistes d'automatisation.
- Interpolation de valeurs basée sur le temps (linéaire).
- Gestion des états des macros et mappages multi-paramètres.
- Enveloppes pour la structure dynamique des séquences.
- Enregistrement, simplification et application des données capturées en direct.

## Principales exportations

### Pistes (`lanes.ts`)
- `createLane(id, target, points)` : crée une piste avec une cible et des points initiaux.
- `makeTarget(param, entityId)` : crée une cible d'automatisation.
- `addPoint` / `removePointAt` / `updatePoint` / `clearLane` : ajout, suppression, modification et effacement de points.
- `lanesForTarget` / `lanesForParam` / `laneTimeSpan` : récupération des pistes pour une cible ou un paramètre, et de la durée d'une piste.

### Interpolation (`interpolate.ts`)
- `evaluateLane(lane, timeMs)` : valeur interpolée à un moment donné.
- `interpolate(pointA, pointB, timeMs)` : interpolation linéaire.
- `sampleLane(lane, startMs, endMs, stepMs)` : échantillonnage régulier.
- `evaluateLanesAt(lanes, timeMs)` : évaluation de plusieurs pistes simultanément.

### Macros (`macros.ts`)
- `defaultMacroState()` : valeurs par défaut d'intensité, de tension et d'énergie.
- `createMacroMapping(id, macro, param, options)` : associe une macro à un paramètre.
- `evaluateMacros(mappings, macroState)` : calcule toutes les valeurs des paramètres.
- `applyMacroInfluence(baseValue, macroValue, influence)` : calcul d'une influence unique.
- `mappingsForMacro` / `macrosAffectingParam` : récupération des mappages pour une macro, et des macros affectant un paramètre.

### Enveloppes (`envelopes.ts`)
- `createEnvelope(id, target, sectionRole, points)` : automatisation spécifique à une section.
- `evaluateEnvelope(envelope, timeMs)` : valeur d'enveloppe interpolée.
- `envelopesForTarget` / `entryEnvelopes` / `exitEnvelopes` : récupération des enveloppes pour une cible, d'entrée ou de sortie.

### Enregistrement (`capture.ts`)
- `createCapture(id, name, source)` : démarre une session d'enregistrement.
- `recordPoint(capture, timeMs, value)` : enregistre une valeur.
- `finalizeCapture(capture)` : marque l'enregistrement comme terminé.
- `applyCaptureToLane` / `mergeCaptureIntoLane` : applique l'enregistrement à une piste.
- `thinCapture(capture, tolerance)` : réduit la densité des points.
- `captureDuration(capture)` : durée totale de l'enregistrement.

## Ce que cela ne fait pas

- Traitement audio, effets ou DSP.
- Orchestration ou lecture de scènes.
- Composition de clips.
- Composants d'interface utilisateur.

## Dépendances

- `@motif/schema` : types pour les pistes, les cibles, les points, les macros, les enveloppes et les enregistrements.
