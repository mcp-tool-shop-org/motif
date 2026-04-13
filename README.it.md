<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="400" alt="Motif">
</p>

<p align="center">
  <a href="https://www.npmjs.com/search?q=%40motif"><img src="https://img.shields.io/npm/v/@motif/schema?label=npm&color=cb3837" alt="npm"></a>
  <a href="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/motif/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://codecov.io/gh/mcp-tool-shop-org/motif"><img src="https://codecov.io/gh/mcp-tool-shop-org/motif/branch/main/graph/badge.svg" alt="Coverage"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"></a>
  <a href="https://mcp-tool-shop-org.github.io/motif/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page"></a>
</p>

Studio di composizione musicale adattiva per creare, organizzare, realizzare partiture e esportare musica interattiva per videogiochi.

## Cos'è

Motif è una workstation orientata alla composizione, con funzionalità di adattamento. Combina la creazione musicale strutturata (clip, indicazioni, scene, livelli, automazioni) con una logica adattiva che risponde allo stato del gioco durante l'esecuzione. Il risultato: musica per videogiochi che sembra intenzionale, non generata casualmente.

## Cosa non è

Una DAW (Digital Audio Workstation). Un sequencer giocattolo. Un generatore di musica basato sull'intelligenza artificiale. Un database per la creazione di mondi con elementi audio associati. Motif è uno strumento creativo avanzato per la realizzazione di partiture musicali adattive per videogiochi.

## Cosa può fare

- **Composizione** — Clip con note, strumenti, scale, accordi, trasformazioni di motivi, variazioni di intensità.
- **Sintesi** — Sintetizzatori multi-oscillatore con unisono/supersaw (16 preset), modulazione LFO (filtro, ampiezza, altezza)
- **Strumenti basati su campioni** — Template per pianoforte, archi, chitarra tramite SampleVoice; importazione, taglio, suddivisione, creazione di kit.
- **Arrangiamento** — Scene con tracce sovrapposte, ruoli delle sezioni, curve di intensità; 10 preset di pattern di batteria.
- **Mixaggio ed effetti** — 8 tipi di effetti (EQ, delay, riverbero, compressore, chorus, distorsione, phaser, limiter); 4 slot per effetti aggiuntivi per ogni traccia.
- **Composizione di un mondo** — Famiglie di motivi, profili di composizione, famiglie di indizi, voci nella mappa del mondo, derivazione.
- **Automazione** — Tracce, macro, inviluppi, acquisizione e unione in tempo reale.
- **Ripristino e riutilizzo** — Template, snapshot, rami, preferiti, raccolte, confronto.
- **MIDI** — Importazione/esportazione di file MIDI standard.
- **Logica adattiva** — Binding dei trigger, transizioni, risoluzione deterministica delle scene.
- **Esecuzione** — Anteprima dei clip in tempo reale, riproduzione con un clic, metronomo con click programmati tramite AudioContext.
- **Validazione** — Validazione dello schema, controllo dell'integrità, controlli di riferimento incrociato.
- **Esportazione** — File WAV a 24/32 bit a 44.1/48/96 kHz; pacchetti di runtime per l'utilizzo nei motori di gioco.
- **Funzionalità** — Annulla/ripeti (fino a 50 livelli, Ctrl+Z), salvataggio/caricamento del progetto con salvataggio automatico, scorciatoie da tastiera (Spazio=riproduci, ?=aiuto), BPM e tempo globali.
- **Affidabilità** — Gestione degli errori con ripristino controllato, pianificazione anticipata di AudioContext per una sincronizzazione precisa.

## Struttura Monorepo

### Applicazioni

| Applicazione | Descrizione |
|-----|-------------|
| [`apps/studio`](apps/studio) | Interfaccia utente principale per la composizione (Next.js 15, Zustand 5). |
| [`apps/docs`](apps/docs) | Sito di documentazione (Astro). |

### Pacchetti principali

| Pacchetto | Descrizione |
|---------|-------------|
| [`@motif/schema`](packages/schema) | Tipi canonici, schemi Zod, analisi/validazione. |
| [`@motif/asset-index`](packages/asset-index) | Indicizzazione e controllo dell'integrità dei pacchetti. |
| [`@motif/audio-engine`](packages/audio-engine) | Riproduzione di campioni, gestione delle voci, pianificazione di AudioContext. |
| [`@motif/test-kit`](packages/test-kit) | Strumenti di test e utilità. |

### Composizione e riproduzione

| Pacchetto | Descrizione |
|---------|-------------|
| [`@motif/clip-engine`](packages/clip-engine) | Sequenziamento di clip, trasformazioni, pianificazione di indicazioni. |
| [`@motif/instrument-rack`](packages/instrument-rack) | Sintetizzatore multi-oscillatore, voce di batteria, voce di campione, modulazione LFO, 16 preset. |
| [`@motif/music-theory`](packages/music-theory) | Scale, accordi, motivi, trasformazioni di intensità. |
| [`@motif/playback-engine`](packages/playback-engine) | Riproduzione in tempo reale, missaggio, 8 tipi di effetti, I/O MIDI, esportazione WAV (24/32 bit). |
| [`@motif/sample-lab`](packages/sample-lab) | Strumenti per il taglio, la suddivisione, la creazione di kit e di strumenti. |
| [`@motif/score-map`](packages/score-map) | Motivi, profili, famiglie di indicazioni, derivazioni. |
| [`@motif/automation`](packages/automation) | Tracce, macro, inviluppi, acquisizione. |
| [`@motif/library`](packages/library) | Modelli, snapshot, rami, preferiti, confronto. |

### Infrastruttura

| Pacchetto | Descrizione |
|---------|-------------|
| [`@motif/scene-mapper`](packages/scene-mapper) | Mappatura dei trigger e valutazione deterministica delle associazioni. |
| [`@motif/runtime-pack`](packages/runtime-pack) | Esportazione/importazione in runtime con serializzazione deterministica. |
| [`@motif/review`](packages/review) | Riepiloghi e strumenti di controllo. |
| [`@motif/ui`](packages/ui) | Componenti dell'interfaccia utente condivisi. |

## Installazione

```bash
npm install @motif/schema @motif/clip-engine @motif/runtime-pack
```

Tutti i pacchetti sono pubblicati su npm con il prefisso `@motif`.

## Guida rapida (monorepo)

```bash
pnpm install
pnpm build
pnpm test       # 1,002 tests across all packages
pnpm dev        # Start Studio dev server
```

**Requisiti:** Node.js >= 22, pnpm >= 10

## Test

Tutti i 16 pacchetti includono test unitari che coprono la validazione dello schema, il controllo dell'integrità, le operazioni sui campioni, la composizione di mondi, l'automazione, la gestione delle librerie, la riproduzione, la sintesi, gli effetti, il MIDI e l'integrazione con lo studio. 1.002 test in totale.

Eseguire tutto: `pnpm test`

## Manuale

Il [manuale](https://mcp-tool-shop-org.github.io/motif/handbook/product/) è il manuale operativo completo che copre la definizione del prodotto, l'architettura, la navigazione nello studio, i flussi di lavoro creativi e la strategia. Punti di accesso principali:

- [Prodotto: Cos'è Motif](https://mcp-tool-shop-org.github.io/motif/handbook/product/)
- [Architettura: Panoramica del repository](https://mcp-tool-shop-org.github.io/motif/handbook/architecture/)
- [Flusso di lavoro: Creazione di un indizio da zero](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/building-a-cue/)
- [Flusso di lavoro: Lavorare con campioni personalizzati](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/custom-samples/)
- [Flusso di lavoro: Composizione di mondi](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/world-scoring/)
- [Strategia: Glossario](https://mcp-tool-shop-org.github.io/motif/handbook/strategy/glossary/)
- [Pacchetti di esempio](examples/)

## Sicurezza e affidabilità

Motif funziona **interamente nel browser**. Nessun server, nessuna sincronizzazione cloud, nessuna telemetria.

- **Dati accessibili:** File di pacchetti di colonna sonora creati dall'utente (JSON), riferimenti a risorse audio, archiviazione locale del browser.
- **Dati NON accessibili:** Nessun archivio lato server, nessun accesso al file system al di fuori della sandbox del browser.
- **Rete:** Nessuna connessione di rete in uscita; tutta la composizione e la riproduzione avvengono lato client.
- **Credenziali:** Non legge, memorizza o trasmette credenziali.
- **Telemetria:** Nessuna informazione raccolta o trasmessa.
- **Permessi:** Solo API del browser standard (Web Audio API).

Consultare il file [SECURITY.md](SECURITY.md) per segnalare eventuali vulnerabilità.

## Licenza

MIT

---

Creato da <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
