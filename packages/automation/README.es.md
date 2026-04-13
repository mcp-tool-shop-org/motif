<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/automation

Automatización expresiva para Motif: pistas, interpolación, macros, envolventes y captura en tiempo real.

## Funcionalidades

- Creación y gestión de puntos en las pistas de automatización.
- Interpolación de valores basada en el tiempo (lineal).
- Gestión de estados de macros y mapeo de múltiples parámetros.
- Envolventes por sección para la dinámica de la estructura de las señales.
- Grabación, filtrado y aplicación de datos capturados en tiempo real.

## Exportaciones Principales

### Pistas (`lanes.ts`)
- `createLane(id, target, points)`: crea una pista con un objetivo y puntos iniciales.
- `makeTarget(param, entityId)`: crea un objetivo de automatización.
- `addPoint` / `removePointAt` / `updatePoint` / `clearLane`: funciones para manipular los puntos de una pista.
- `lanesForTarget` / `lanesForParam` / `laneTimeSpan`: funciones para obtener información sobre las pistas.

### Interpolación (`interpolate.ts`)
- `evaluateLane(lane, timeMs)`: devuelve el valor interpolado en un momento dado.
- `interpolate(pointA, pointB, timeMs)`: realiza una interpolación lineal.
- `sampleLane(lane, startMs, endMs, stepMs)`: realiza un muestreo regular de una pista.
- `evaluateLanesAt(lanes, timeMs)`: evalúa múltiples pistas simultáneamente.

### Macros (`macros.ts`)
- `defaultMacroState()`: devuelve los valores predeterminados de intensidad, tensión y energía.
- `createMacroMapping(id, macro, param, options)`: mapea un macro a un parámetro.
- `evaluateMacros(mappings, macroState)`: calcula todos los valores de los parámetros.
- `applyMacroInfluence(baseValue, macroValue, influence)`: calcula la influencia de un macro.
- `mappingsForMacro` / `macrosAffectingParam`: funciones para obtener información sobre los mapeos y macros.

### Envolventes (`envelopes.ts`)
- `createEnvelope(id, target, sectionRole, points)`: crea una automatización con alcance a una sección.
- `evaluateEnvelope(envelope, timeMs)`: devuelve el valor interpolado de una envolvente.
- `envelopesForTarget` / `entryEnvelopes` / `exitEnvelopes`: funciones para obtener información sobre las envolventes.

### Captura (`capture.ts`)
- `createCapture(id, name, source)`: inicia una sesión de captura.
- `recordPoint(capture, timeMs, value)`: registra un valor.
- `finalizeCapture(capture)`: marca la captura como completa.
- `applyCaptureToLane` / `mergeCaptureIntoLane`: aplica la captura a una pista.
- `thinCapture(capture, tolerance)`: reduce la densidad de puntos en una captura.
- `captureDuration(capture)`: devuelve la duración total de la captura.

## Funcionalidades No Incluidas

- Procesamiento de audio o efectos.
- Orquestación o reproducción de escenas.
- Composición de clips.
- Componentes de interfaz de usuario.

## Dependencias

- `@motif-studio/schema`: tipos para pistas, objetivos, puntos, macros, envolventes y capturas.
