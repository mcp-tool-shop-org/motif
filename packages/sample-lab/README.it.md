<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/sample-lab

Strumenti di supporto per il workflow di campioni di Motif, per tagliare, dividere, creare kit e gestire strumenti.

## Cosa include

- Taglio di file audio e gestione dei punti di loop
- Divisione in sezioni uniforme e basata sull'inizio dei suoni
- Creazione di kit di campioni e gestione degli slot
- Creazione di strumenti a campione e utilità per la modifica dell'intonazione
- Strumenti di supporto per l'importazione di file audio (inferenza del tipo di risorsa dal nome del file)

## Esportazioni principali

### Trim (`trim.ts`)
- `resolveTrimRegion(asset)` — definizione dei limiti di taglio
- `resolveLoopRegion(asset)` — definizione dei limiti del loop
- `applyTrim(asset, startMs, endMs)` — impostazione dei punti di taglio
- `applyLoopPoints(asset, loopStartMs, loopEndMs)` — impostazione dei punti di loop

### Slice (`slice.ts`)
- `sliceEvenly(assetId, startMs, endMs, count)` — divisione in sezioni uguali
- `sliceAtOnsets(assetId, onsets, totalEndMs)` — divisione in sezioni in momenti specifici
- `sliceDurationMs(slice)` — durata della sezione

### Kit (`kit.ts`)
- `createKit(id, name)` — creazione di un kit vuoto
- `addKitSlot(kit, slot)` / `removeKitSlot(kit, pitch)` / `updateKitSlot(kit, pitch, update)` — aggiunta, rimozione e aggiornamento di uno slot nel kit
- `kitFromSlices(id, name, slices, basePitch)` — mappatura automatica delle sezioni alle note MIDI
- `kitAssetIds(kit)` / `findDuplicateSlotPitches(kit)` — recupero degli ID delle risorse nel kit / ricerca di intonazioni duplicate negli slot

### Strumento (`instrument.ts`)
- `createSampleInstrument(id, name, assetId, rootNote, pitchMin, pitchMax)` — creazione di uno strumento a campione
- `pitchToPlaybackRate(rootNote, targetNote)` — rapporto di trasposizione dell'intonazione
- `isInRange(instrument, note)` / `rangeSpan(instrument)` — verifica se una nota è nell'intervallo dello strumento / intervallo dello strumento

### Importazione (`import.ts`)
- `inferSourceType(name)` — rilevamento del tipo di file dal nome
- `sourceTypeToKind(sourceType)` — mappatura del tipo di file al tipo di risorsa
- `filenameToId(filename)` — generazione di un ID pulito dal nome del file
- `buildImportedAsset(filename, durationMs, src)` — creazione di una risorsa a partire da un file

## Cosa non include

- Decodifica o riproduzione di file audio (vedere `@motif-studio/audio-engine`)
- Persistenza delle risorse audio o operazioni di I/O su file
- Componenti dell'interfaccia utente

## Dipendenze

- `@motif-studio/schema` — tipi per risorse, sezioni, kit, strumenti
