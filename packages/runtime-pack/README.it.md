<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/runtime-pack

Esportazione e importazione a runtime per i pacchetti di colonna sonora di Motif.

## Cosa include

- Rimozione degli elementi non necessari da un pacchetto di creazione per ottenere un pacchetto a runtime.
- Serializzazione del pacchetto a runtime.
- Verifica bidirezionale di importazione/esportazione.

## Stato

Pacchetto di esempio. La logica di esportazione a runtime sarà ampliata nella Fase 20 (Pubblicazione, Impacchettamento e Integrazione a Runtime) per includere profili di esportazione, raggruppamento di risorse e manifesti per l'adattatore del motore.

## Cosa non include

- Modello di dati di creazione (vedere `@motif/schema`).
- Impacchettamento di file audio.
- SDK di riproduzione specifici per ogni motore.
