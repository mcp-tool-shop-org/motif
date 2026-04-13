<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/studio

L'app Studio è l'interfaccia principale per la creazione dei pacchetti Motif. Fornisce un'interfaccia di controllo con tema scuro per creare, modificare e visualizzare tutti gli elementi di un pacchetto.

## Schermate

| Schermata | Scopo |
|--------|---------|
| **Project** | Metadati del pacchetto, panoramica delle statistiche, rilevamento di elementi non utilizzati. |
| **Assets** | Operazioni CRUD (Creazione, Lettura, Aggiornamento, Eliminazione) per le risorse audio (musica, effetti sonori, ambientazioni, jingle, voci). |
| **Stems** | Operazioni CRUD per le tracce audio, con assegnazione delle risorse e etichettatura dei ruoli. |
| **Scenes** | Operazioni CRUD per le scene, con modifica dei livelli direttamente nella schermata (aggiunta/rimozione/riordino). |
| **Bindings** | Operazioni CRUD per le associazioni, con modifica delle condizioni direttamente nella schermata. |
| **Transitions** | Operazioni CRUD per le transizioni, con avvisi di validazione specifici per la modalità. |
| **Review** | Avvisi di validazione in tempo reale provenienti da `@motif-studio/review`, raggruppati per gravità. |
| **Preview** | Simulazione dello stato di runtime manuale e sequenziale, con integrazione del motore. |

## Anteprima

La schermata di anteprima simula il comportamento della colonna sonora in fase di runtime rispetto alla versione corrente del pacchetto.

Funzionalità attuali:
- Anteprima dello stato di runtime manuale.
- Simulazione della sequenza modificabile.
- Visualizzazione delle associazioni e delle scene vincenti.
- Visualizzazione delle tracce audio attive.
- Visibilità delle transizioni e degli avvisi.

Questa anteprima è basata sulla simulazione e non esegue la riproduzione effettiva dell'audio.

## Sviluppo

```bash
pnpm --filter @motif-studio/studio dev    # Next.js dev server
pnpm --filter @motif-studio/studio build  # Production build
pnpm --filter @motif-studio/studio test   # Run tests
```

## Stack tecnologico

- **Framework:** Next.js 15 (App Router)
- **Gestione dello stato:** Zustand
- **Validazione:** `@motif-studio/review` (ottenuta tramite l'hook `useReview`)
- **Testing:** Vitest + Testing Library + jsdom
- **Styling:** Variabili CSS, tema scuro (nessun CSS-in-JS)
