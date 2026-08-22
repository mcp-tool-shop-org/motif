<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

<p align="center">
  <a href="https://www.npmjs.com/search?q=%40motif-studio"><img src="https://img.shields.io/npm/v/@motif-studio/schema?label=npm&color=cb3837" alt="npm"></a>
  <a href="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://codecov.io/gh/mcp-tool-shop-org/motif"><img src="https://codecov.io/gh/mcp-tool-shop-org/motif/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"></a>
  <a href="https://mcp-tool-shop-org.github.io/motif/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page"></a>
</p>

Studio di colonna sonora adattiva per la composizione, l'arrangiamento, la creazione di partiture e l'esportazione di musica interattiva per videogiochi.

## Cos'è

Motif è una workstation incentrata sulla composizione e consapevole dell'adattabilità. Combina strumenti strutturati per la creazione musicale (clip, cue, scene, layer, automazione) con una logica adattiva che risponde allo stato del gioco in tempo reale. Il risultato: musica per videogiochi che sembra intenzionale, non generata casualmente.

## Cos'è invece

Non è una DAW (Digital Audio Workstation). Non è un sequencer giocattolo. Non è un generatore di musica basato sull'intelligenza artificiale. Non è un database per la creazione di mondi con suoni allegati. Motif è uno strumento creativo avanzato per la creazione di partiture adattive per videogiochi.

Motif non genera musica. Elabora l'audio che hai generato altrove, trasformando una traccia mixata, le sue singole tracce e una misurazione del volume in scene, famiglie di cue e riproduzioni a più livelli. L'origine dell'audio è affare tuo; il lavoro di Motif inizia quando la traccia esiste.

## Cosa può fare

- **Comporre:** clip con note, strumenti, scale, accordi, trasformazioni del motivo musicale, varianti di intensità
- **Sintetizzare:** voci di sintetizzatore multi-oscillatore con unisono/supersaw (16 preset), modulazione LFO (filtro, ampiezza, intonazione)
- **Strumenti campionati:** pianoforte, archi, chitarra tramite SampleVoice; importazione, taglio, suddivisione, creazione di kit
- **Arrangiare:** scene con tracce a più livelli, ruoli delle sezioni, curve di intensità; 10 preset per pattern di batteria
- **Mixare ed elaborare:** 8 tipi di effetti (EQ, delay, riverbero, compressore, chorus, distorsione, phaser, limiter); 4 slot FX inseriti per traccia
- **Creare una colonna sonora per un mondo:** famiglie Motif, profili della colonna sonora, famiglie di cue, voci sulla mappa del mondo, derivazione
- **Elaborare audio generato:** trasformare una traccia mixata generata nel cloud + tracce Demucs + misurazione LUFS in un pacchetto riproducibile e normalizzato per il volume; contenuto indirizzato in modo che le ripetizioni siano quasi istantanee
- **Creare pacchetti di genere da un catalogo:** una voce JSON per cue genera un intero pacchetto: scena, famiglia di cue, blocco della generazione, collegamenti e tracce A/B
- **Automatizzare:** corsie, macro, inviluppi, acquisizione e fusione in tempo reale
- **Richiamare e riutilizzare:** modelli, istantanee, rami, preferiti, raccolte, confronto
- **MIDI:** importazione/esportazione di file Standard MIDI
- **Logica adattiva:** trigger di collegamenti, transizioni, risoluzione deterministica delle scene
- **Eseguire:** anteprima in tempo reale delle clip, riproduzione con un clic, metronomo con click programmati tramite AudioContext
- **Validare:** validazione dello schema, controllo dell'integrità, controlli di riferimento incrociato
- **Esportare:** WAV a 24/32 bit a 44,1/48/96 kHz; pacchetti in tempo reale per l'utilizzo nel motore di gioco
- **Creare:** annulla/ripeti (fino a 50 livelli, Ctrl+Z), salvataggio/caricamento del progetto con autosalvataggio, scorciatoie da tastiera (Spazio=riproduci, ?=aiuto), BPM globale e indicazione della misura
- **Affidabilità:** limite di errore con ripristino graduale, programmazione lookahead di AudioContext per una temporizzazione precisa al campione

## Cue generati e libreria di genere

Motif può creare un pacchetto `SoundtrackPack` riproducibile a partire da audio generato. Descrivi un pacchetto in un file del catalogo, genera l'audio come preferisci e Motif lo trasforma in scene, famiglie di cue e tracce a più livelli che puoi ascoltare in anteprima nello Studio.

```
catalog entry  →  generation  →  collection  →  ingest  →  playable pack
   (you)          (any model)     (masters)    (Motif)      (Studio)
```

Motif gestisce gli ultimi due passaggi. Si preoccupa solo che ogni traccia arrivi come una traccia mixata, le sue singole tracce e una misurazione del volume.

**Il catalogo integrato descrive 24 pacchetti di genere: 233 cue, due tracce per cue.** Fantasy, tattico, dungeon, steampunk, pirata, western, space opera, cyberpunk, mitologico, post-apocalittico, orientale, norreno, desertico, forestale, ghiacciato, gotico, sottomarino, vulcanico, accogliente, noir, temi emotivi, droni ambientali, tensione e menu. Il catalogo e la derivazione si trovano in questo repository; **i file audio master non sono inclusi**, perché sono di grandi dimensioni e vengono generati per ogni utente, quindi dovrai fornirli tu ed eseguire l'elaborazione.

```bash
# Ingest one pack, or a whole tier
pnpm --filter @motif-studio/sample-lab ingest:library --pack fantasy-jrpg-core
pnpm --filter @motif-studio/sample-lab ingest:library --tier 2 --tier 3
```

L'elaborazione è **indirizzata al contenuto e incrementale**: una traccia i cui file di input continuano a corrispondere a ciò che è stato registrato nell'esecuzione precedente viene riutilizzata invece di essere decodificata nuovamente, quindi rieseguire un pacchetto completato richiede circa un secondo anziché minuti e un'esecuzione interrotta riprende da dove si era fermata. `--force` ricalcola tutto per dimostrare che la pipeline continua a riprodurre il proprio output; `--skip-defective` scarta una traccia non valida, lo segnala ed esce con un codice di errore diverso da zero invece di interrompere l'intera esecuzione.

Consulta [Cue generati e pacchetti della libreria](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/generated-cues/) nel manuale per il flusso di lavoro completo, inclusi i blocchi della generazione e la curatela delle tracce.

## Struttura del monorepository

### App

| App | Descrizione |
|-----|-------------|
| [`apps/studio`](apps/studio) | Interfaccia utente principale per la creazione (Next.js, Zustand 5) |

### Pacchetti principali

| Pacchetto | Descrizione |
|---------|-------------|
| [`@motif-studio/schema`](packages/schema) | Tipi canonici, schemi Zod, analisi/validazione |
| [`@motif-studio/asset-index`](packages/asset-index) | Indicizzazione e controllo dell'integrità del pacchetto |
| [`@motif-studio/audio-engine`](packages/audio-engine) | Riproduzione di campioni, gestione delle voci, programmazione AudioContext |
| [`@motif-studio/test-kit`](packages/test-kit) | Strumenti e utilità di test |

### Composizione e riproduzione

| Pacchetto | Descrizione |
|---------|-------------|
| [`@motif-studio/clip-engine`](packages/clip-engine) | Sequenziamento delle clip, trasformazioni, programmazione dei cue |
| [`@motif-studio/instrument-rack`](packages/instrument-rack) | Sintetizzatore multi-oscillatore, voce di batteria, voce di campioni, modulazione LFO, 16 preset |
| [`@motif-studio/music-theory`](packages/music-theory) | Scale, accordi, motivi, trasformazioni di intensità |
| [`@motif-studio/playback-engine`](packages/playback-engine) | Riproduzione in tempo reale, mixaggio, 8 tipi di effetti, I/O MIDI, esportazione WAV (24/32 bit) |
| [`@motif-studio/sample-lab`](packages/sample-lab) | Strumenti per il taglio, la suddivisione e la creazione di kit; più la corsia di generazione: client per l'esecuzione nel cloud, importazione degli artefatti, normalizzazione del volume, creazione del pacchetto della libreria |
| [`@motif-studio/score-map`](packages/score-map) | Motivi, profili, famiglie di cue, derivazione, catalogo della libreria |
| [`@motif-studio/automation`](packages/automation) | Corsie, macro, inviluppi, acquisizione |
| [`@motif-studio/library`](packages/library) | Modelli, istantanee, rami, preferiti, confronto |

### Infrastruttura

| Pacchetto | Descrizione |
|---------|-------------|
| [`@motif-studio/scene-mapper`](packages/scene-mapper) | Mappatura dei trigger e valutazione deterministica del collegamento |
| [`@motif-studio/runtime-pack`](packages/runtime-pack) | Esportazione/importazione in tempo reale con serializzazione deterministica |
| [`@motif-studio/review`](packages/review) | Riepiloghi e strumenti di controllo |
| [`@motif-studio/ui`](packages/ui) | Componenti UI condivisi |

## Installa

```bash
npm install @motif-studio/schema @motif-studio/clip-engine @motif-studio/runtime-pack
```

Tutti i pacchetti vengono pubblicati su npm all’interno dello spazio dei nomi `@motif-studio`.

## Guida rapida (monorepo)

```bash
pnpm install
pnpm build
pnpm test       # 1,709 tests across all packages
pnpm dev        # Start Studio dev server
```

**Requisiti:** Node.js >= 22, pnpm >= 10

## Test

Tutti i 16 pacchetti hanno test unitari che coprono la convalida dello schema, l’audit di integrità, le operazioni di esempio, il calcolo dei punteggi per gli ambienti virtuali, l’automazione, la gestione delle librerie, la riproduzione, la sintesi, gli effetti, MIDI, l’importazione della generazione e l’integrazione dello studio. 1.709 test in tutti i pacchetti.

Esegui tutto: `pnpm test`

## Manuale

Il [manuale](https://mcp-tool-shop-org.github.io/motif/handbook/product/) è il manuale operativo completo che copre la definizione del prodotto, l’architettura, la navigazione dello studio, i flussi di lavoro creativi e la strategia. Punti di accesso principali:

- [Prodotto: cos’è Motif](https://mcp-tool-shop-org.github.io/motif/handbook/product/)
- [Architettura: panoramica del repository](https://mcp-tool-shop-org.github.io/motif/handbook/architecture/)
- [Flusso di lavoro: creazione di una traccia da zero](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/building-a-cue/)
- [Flusso di lavoro: tracce generate e pacchetti di librerie](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/generated-cues/)
- [Flusso di lavoro: utilizzo di campioni personalizzati](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/custom-samples/)
- [Flusso di lavoro: calcolo dei punteggi per gli ambienti virtuali](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/world-scoring/)
- [Strategia: glossario](https://mcp-tool-shop-org.github.io/motif/handbook/strategy/glossary/)
- [Esempi di pacchetti](examples/)

## Sicurezza e affidabilità

**Lo studio funziona interamente nel browser.** Nessun server, nessuna sincronizzazione cloud, nessun telemetria.

- **Dati elaborati:** file di pacchetti di colonne sonore creati dall’utente (JSON), riferimenti alle risorse audio, spazio di archiviazione locale del browser
- **Dati NON elaborati:** nessun archivio lato server, nessun accesso al file system oltre l’ambiente sandbox del browser
- **Rete:** l’app Studio non effettua alcuna comunicazione in uscita — tutta la creazione e la riproduzione avvengono sul client
- **Credenziali:** non legge, archivia o trasmette credenziali
- **Telemetria:** nessuna raccolta o invio di dati
- **Autorizzazioni:** solo API standard del browser (Web Audio API)

**Un’unica eccezione, che è facoltativa e al di fuori dell’app:** `@motif-studio/sample-lab` include un comando per la generazione dalla riga di comando che comunica con un endpoint Comfy Cloud per inviare e recuperare lavori di generazione. Funziona solo quando viene eseguito da un terminale, non viene mai importato dall’app Studio e legge le sue credenziali dal tuo ambiente. Puoi saltarlo completamente e Motif rimarrà completamente offline.

Consulta [SECURITY.md](SECURITY.md) per segnalare vulnerabilità.

## Licenza

MIT

---

Creato da <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
