<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/sample-lab

Herramientas para recortar, dividir, crear kits e instrumentos, diseñadas para el flujo de trabajo de muestras de Motif.

## Funcionalidades

- Recorte de archivos de audio y gestión de puntos de bucle.
- División en partes iguales o basada en puntos de inicio.
- Creación y gestión de kits de muestras.
- Creación de instrumentos de muestra y utilidades de afinación.
- Herramientas para importar archivos de audio (inferencia de recursos a partir del nombre del archivo).

## Exportaciones Principales

### Recortar (`trim.ts`)
- `resolveTrimRegion(asset)`: límites de recorte efectivos.
- `resolveLoopRegion(asset)`: límites de bucle efectivos.
- `applyTrim(asset, startMs, endMs)`: establece los puntos de recorte.
- `applyLoopPoints(asset, loopStartMs, loopEndMs)`: establece los puntos de bucle.

### Dividir (`slice.ts`)
- `sliceEvenly(assetId, startMs, endMs, count)`: divide en partes iguales.
- `sliceAtOnsets(assetId, onsets, totalEndMs)`: divide en momentos específicos.
- `sliceDurationMs(slice)`: duración de la división.

### Kit (`kit.ts`)
- `createKit(id, name)`: crea un kit vacío.
- `addKitSlot(kit, slot) / removeKitSlot(kit, pitch) / updateKitSlot(kit, pitch, update)`: añade, elimina o actualiza una ranura en el kit.
- `kitFromSlices(id, name, slices, basePitch)`: asigna automáticamente las divisiones a las notas MIDI.
- `kitAssetIds(kit) / findDuplicateSlotPitches(kit)`: obtiene los IDs de los recursos del kit / busca afinaciones duplicadas en las ranuras.

### Instrumento (`instrument.ts`)
- `createSampleInstrument(id, name, assetId, rootNote, pitchMin, pitchMax)`: crea un instrumento de muestra.
- `pitchToPlaybackRate(rootNote, targetNote)`: calcula la relación de cambio de afinación.
- `isInRange(instrument, note) / rangeSpan(instrument)`: verifica si una nota está dentro del rango del instrumento / calcula el rango del instrumento.

### Importar (`import.ts`)
- `inferSourceType(name)`: detecta el tipo a partir del nombre del archivo.
- `sourceTypeToKind(sourceType)`: mapea el tipo de fuente al tipo de recurso.
- `filenameToId(filename)`: genera un ID limpio a partir del nombre del archivo.
- `buildImportedAsset(filename, durationMs, src)`: crea un recurso a partir de un archivo.

## Funcionalidades No Incluidas

- Decodificación o reproducción de archivos de audio (ver `@motif/audio-engine`).
- Persistencia de recursos de audio o entrada/salida de archivos.
- Componentes de interfaz de usuario.

## Dependencias

- `@motif/schema`: tipos para recursos, divisiones, kits e instrumentos.
