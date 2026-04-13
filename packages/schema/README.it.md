<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/schema

Tipi canonici e validazione per i pacchetti di colonna sonora di Motif.

## Include:

- Tipi TypeScript per tutte le entità principali della colonna sonora.
- Schemi Zod per l'analisi e la validazione.
- Funzioni di validazione sicure con gestione strutturata degli errori.
- Applicazione della versione dello schema (`schemaVersion: "1"`).

## Entità principali:

- `SoundtrackPackMeta`: identità e versione del pacchetto.
- `AudioAsset`: riferimento al file audio con tipo, durata e punti di loop.
- `Stem`: livello riproducibile associato a un file audio con un ruolo.
- `Scene`: stato musicale composto da livelli.
- `SceneLayerRef`: riferimento a un livello all'interno di una scena.
- `TriggerCondition` / `TriggerBinding`: mappatura tra lo stato di runtime e la scena.
- `TransitionRule`: come la musica si sposta tra le scene.
- `SoundtrackPack`: il documento completo del pacchetto.
- `RuntimeMusicState`: struttura dello stato del gioco per la valutazione dei trigger.

## Esportazioni principali:

```ts
import {
  parseSoundtrackPack,
  safeParseSoundtrackPack,
  validateSoundtrackPack,
} from "@motif-studio/schema";
```

### `parseSoundtrackPack(input: unknown): SoundtrackPack`

Analisi rigorosa. Genera un errore in caso di dati non validi.

### `safeParseSoundtrackPack(input: unknown)`

Restituisce `{ success: true, data }` oppure `{ success: false, errors }`. Non genera mai un errore.

### `validateSoundtrackPack(input: unknown): ValidationResult<SoundtrackPack>`

Restituisce `{ ok, data?, issues }` con una struttura `ValidationIssue[]`.

Ogni errore include `path`, `code` e `message` per il debug.

## Regole di validazione:

- Campi obbligatori applicati.
- Valori degli enum applicati (tipo di asset, ruolo dello stem, categoria della scena, operatore del trigger, modalità di transizione).
- `durationMs > 0`.
- `loopStartMs >= 0` se presente.
- `loopEndMs > loopStartMs` se entrambi sono presenti.
- `priority` deve essere un intero.
- I binding devono avere almeno una condizione.
- Le scene devono avere almeno un livello.
- `durationMs` richiesto per le transizioni `crossfade` e `cooldown-fade`.
- `schemaVersion` deve essere `"1"`.

## Ambito:

Questo pacchetto valida la struttura e la correttezza a livello di campo.

I controlli di integrità delle referenze (ad esempio, "una scena fa riferimento a uno stem mancante") sono gestiti da pacchetti di livello superiore.
