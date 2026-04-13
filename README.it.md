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

Studio di composizione musicale adattiva per creare, organizzare, realizzare colonne sonore e esportare musica interattiva per videogiochi.

## Cos'è

Motif è una workstation orientata alla composizione, con funzionalità di adattamento. Combina la creazione musicale strutturata (clip, indicazioni, scene, livelli, automazione) con una logica adattiva che risponde allo stato del gioco durante l'esecuzione. Il risultato: musica per videogiochi che sembra intenzionale, non generata casualmente.

## Cosa non è

Una DAW (Digital Audio Workstation). Un sequencer giocattolo. Un generatore di musica basato sull'intelligenza artificiale. Un database di creazione di mondi con suoni associati. Motif è uno strumento creativo avanzato per la realizzazione di colonne sonore adattive per videogiochi.

## Cosa può fare

- **Comporre** — Clip con note, strumenti, scale, accordi, trasformazioni di motivi, varianti di intensità.
- **Sintetizzare** — Voci di sintetizzatore multi-oscillatore con unisono/supersaw (16 preset), modulazione LFO (filtro, ampiezza, altezza).
- **Campionare strumenti** — Template per pianoforte, archi, chitarra tramite SampleVoice; importazione, taglio, slicing, creazione di kit di batteria.
- **Organizzare** — Scene con stem multistrato, ruoli delle sezioni, curve di intensità; 10 preset di pattern di batteria.
- **Mixare ed applicare effetti** — 8 tipi di effetti (EQ, delay, riverbero, compressore, chorus, distorsione, phaser, limiter); 4 slot di effetti per stem.
- **Creare un mondo sonoro** — Famiglie di motivi, profili, famiglie di indicazioni, voci di mappa del mondo, derivazione.
- **Automatizzare** — Tracce, macro, inviluppi, acquisizione e unione in tempo reale.
- **Ripristinare e riutilizzare** — Template, snapshot, rami, preferiti, raccolte, confronto.
- **MIDI** — Importazione/esportazione di file MIDI standard.
- **Logica adattiva** — Binding dei trigger, transizioni, risoluzione deterministica delle scene.
- **Eseguire** — Anteprima dei clip in tempo reale, ascolto, metronomo con click programmati tramite AudioContext.
- **Validare** — Validazione dello schema, controllo dell'integrità, controlli di riferimento incrociato.
- **Esportare** — File WAV a 24/32 bit a 44.1/48/96 kHz; pacchetti di runtime per l'utilizzo nei motori di gioco.
- **Creare** — Annulla/ripeti (fino a 50 livelli, Ctrl+Z), salvataggio/caricamento del progetto con salvataggio automatico, scorciatoie da tastiera (Spazio=play, ?=help), BPM e tempo globale.
- **Affidabilità** — Gestione degli errori con ripristino controllato, pianificazione anticipata di AudioContext per una sincronizzazione precisa.

## Struttura del monorepo

### Applicazioni

| Applicazione | Descrizione |
|-----|-------------|
| [`apps/studio`](apps/studio) | Interfaccia utente principale per la creazione (Next.js, Zustand 5). |

### Pacchetti principali

| Pacchetto | Descrizione |
|---------|-------------|
| [`@motif-studio/schema`](packages/schema) | Tipi canonici, schemi Zod, analisi/validazione. |
| [`@motif-studio/asset-index`](packages/asset-index) | Indicizzazione e controllo dell'integrità dei pacchetti. |
| [`@motif-studio/audio-engine`](packages/audio-engine) | Riproduzione di campioni, gestione delle voci, pianificazione di AudioContext. |
| [`@motif-studio/test-kit`](packages/test-kit) | Strumenti di test e utilità. |

### Composizione e riproduzione

| Pacchetto | Descrizione |
|---------|-------------|
| [`@motif-studio/clip-engine`](packages/clip-engine) | Sequenziamento di clip, trasformazioni, pianificazione di indicazioni. |
| [`@motif-studio/instrument-rack`](packages/instrument-rack) | Sintetizzatore multi-oscillatore, voce di batteria, voce di campione, modulazione LFO, 16 preset. |
| [`@motif-studio/music-theory`](packages/music-theory) | Scale, accordi, motivi, trasformazioni di intensità. |
| [`@motif-studio/playback-engine`](packages/playback-engine) | Riproduzione in tempo reale, missaggio, 8 tipi di effetti, I/O MIDI, esportazione WAV (24/32 bit). |
| [`@motif-studio/sample-lab`](packages/sample-lab) | Taglio, slicing, kit, strumenti di supporto. |
| [`@motif-studio/score-map`](packages/score-map) | Motivi, profili, famiglie di indicazioni, derivazione. |
| [`@motif-studio/automation`](packages/automation) | Tracce, macro, inviluppi, acquisizione. |
| [`@motif-studio/library`](packages/library) | Template, snapshot, rami, preferiti, confronto. |

### Infrastruttura

| Pacchetto | Descrizione |
|---------|-------------|
| [`@motif-studio/scene-mapper`](packages/scene-mapper) | Mappatura dei trigger e valutazione deterministica del binding. |
| [`@motif-studio/runtime-pack`](packages/runtime-pack) | Esportazione/importazione in runtime con serializzazione deterministica. |
| [`@motif-studio/review`](packages/review) | Riepiloghi e utilità per il controllo. |
| [`@motif-studio/ui`](packages/ui) | Componenti dell'interfaccia utente condivisi. |

## Installazione

```bash
npm install @motif-studio/schema @motif-studio/clip-engine @motif-studio/runtime-pack
```

Tutti i pacchetti sono pubblicati su npm con il prefisso `@motif-studio`.

## Guida rapida (monorepo)

```bash
pnpm install
pnpm build
pnpm test       # 1,116 tests across all packages
pnpm dev        # Start Studio dev server
```

**Requisiti:** Node.js >= 22, pnpm >= 10

## Test

Tutti e 16 i pacchetti includono test unitari che coprono la validazione dello schema, l'audit dell'integrità, le operazioni di esempio, la gestione del suono, l'automazione, la gestione delle librerie, la riproduzione, la sintesi, gli effetti, il MIDI e l'integrazione con lo studio. Sono presenti 1.116 test in tutti i pacchetti.

Per eseguire tutti i test: `pnpm test`

## Manuale di riferimento

Il [manuale](https://mcp-tool-shop-org.github.io/motif/handbook/product/) è il manuale operativo completo che copre la definizione del prodotto, l'architettura, la navigazione nello studio, i flussi di lavoro creativi e la strategia. Punti di accesso principali:

- [Prodotto: Cos'è Motif](https://mcp-tool-shop-org.github.io/motif/handbook/product/)
- [Architettura: Panoramica del repository](https://mcp-tool-shop-org.github.io/motif/handbook/architecture/)
- [Flusso di lavoro: Creazione di un "cue" da zero](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/building-a-cue/)
- [Flusso di lavoro: Utilizzo di campioni personalizzati](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/custom-samples/)
- [Flusso di lavoro: Gestione del suono](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/world-scoring/)
- [Strategia: Glossario](https://mcp-tool-shop-org.github.io/motif/handbook/strategy/glossary/)
- [Pacchetti di esempio](examples/)

## Sicurezza e affidabilità

Motif funziona **interamente nel browser**. Non richiede server, sincronizzazione cloud o telemetria.

- **Dati accessibili:** File dei pacchetti audio creati dall'utente (JSON), riferimenti agli asset audio, archiviazione locale del browser.
- **Dati NON accessibili:** Nessun archivio lato server, nessun accesso al file system al di fuori della sandbox del browser.
- **Rete:** Assenza di traffico di rete in uscita; tutta la creazione e la riproduzione avvengono lato client.
- **Credenziali:** Non legge, memorizza o trasmette credenziali.
- **Telemetria:** Nessuna informazione viene raccolta o trasmessa.
- **Permessi:** Utilizza solo le API standard del browser (Web Audio API).

Consultare [SECURITY.md](SECURITY.md) per segnalare eventuali vulnerabilità.

## Licenza

MIT

---

Creato da <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
