<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/sample-lab

Ferramentas para edição, recorte, criação de kits e instrumentos para o fluxo de trabalho de samples do Motif.

## O que ele oferece

- Edição e gerenciamento de pontos de loop para arquivos de áudio.
- Recorte uniforme e baseado em eventos.
- Criação e gerenciamento de kits de samples.
- Criação de instrumentos de sample e utilitários de afinação.
- Ferramentas auxiliares para importação de arquivos de áudio (inferência de recursos a partir do nome do arquivo).

## Principais funcionalidades

### Recorte (`trim.ts`)
- `resolveTrimRegion(asset)` — limites de recorte efetivos.
- `resolveLoopRegion(asset)` — limites de loop efetivos.
- `applyTrim(asset, startMs, endMs)` — define os pontos de recorte.
- `applyLoopPoints(asset, loopStartMs, loopEndMs)` — define os pontos de loop.

### Recorte (`slice.ts`)
- `sliceEvenly(assetId, startMs, endMs, count)` — divide em partes iguais.
- `sliceAtOnsets(assetId, onsets, totalEndMs)` — recorta em momentos específicos.
- `sliceDurationMs(slice)` — duração do recorte.

### Kit (`kit.ts`)
- `createKit(id, name)` — cria um kit vazio.
- `addKitSlot(kit, slot) / removeKitSlot(kit, pitch) / updateKitSlot(kit, pitch, update)` — adiciona, remove ou atualiza um slot no kit.
- `kitFromSlices(id, name, slices, basePitch)` — mapeia automaticamente os recortes para as notas MIDI.
- `kitAssetIds(kit) / findDuplicateSlotPitches(kit)` — obtém os IDs dos recursos do kit / encontra notas duplicadas nos slots.

### Instrumento (`instrument.ts`)
- `createSampleInstrument(id, name, assetId, rootNote, pitchMin, pitchMax)` — cria um instrumento de sample.
- `pitchToPlaybackRate(rootNote, targetNote)` — calcula a taxa de reprodução para a mudança de afinação.
- `isInRange(instrument, note) / rangeSpan(instrument)` — verifica se uma nota está dentro da faixa do instrumento / calcula a extensão da faixa do instrumento.

### Importação (`import.ts`)
- `inferSourceType(name)` — detecta o tipo a partir do nome do arquivo.
- `sourceTypeToKind(sourceType)` — mapeia o tipo de fonte para o tipo de recurso.
- `filenameToId(filename)` — gera um ID limpo a partir do nome do arquivo.
- `buildImportedAsset(filename, durationMs, src)` — cria um recurso a partir de um arquivo.

## O que ele não oferece

- Decodificação ou reprodução de arquivos de áudio (veja `@motif-studio/audio-engine`).
- Persistência de recursos de áudio ou operações de entrada/saída de arquivos.
- Componentes de interface do usuário.

## Dependências

- `@motif-studio/schema` — tipos para recursos, recortes, kits e instrumentos.
