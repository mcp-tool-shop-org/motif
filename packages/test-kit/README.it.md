<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/test-kit

Strumenti di test, pacchetti di esempio e utilità per i pacchetti Motif.

## Cosa include

- File di configurazione JSON per i test (pacchetti minimi, pacchetti per il test di integrità, pacchetti non validi)
- Utilità per il caricamento delle configurazioni
- Risoluzione dei percorsi delle configurazioni

## Esportazioni principali

```ts
import { FIXTURES, loadFixture, fixturePath } from "@motif-studio/test-kit";

const pack = loadFixture(FIXTURES.MINIMAL_PACK);
```

### Configurazioni

| Costante | File di configurazione | Scopo |
|----------|-------------|---------|
| `MINIMAL_PACK` | `minimal-pack.json` | Pacchetto valido con il minimo indispensabile |
| `STARTER_PACK` | `starter-pack.json` | Pacchetto di esempio più completo |
| `INVALID_MISSING_META` | `invalid-pack-missing-meta.json` | Validazione dello schema: metadati mancanti |
| `INVALID_BAD_TRANSITION` | `invalid-pack-bad-transition.json` | Validazione dello schema: transizione non valida |
| `INVALID_EMPTY_SCENE_LAYERS` | `invalid-pack-empty-scene-layers.json` | Validazione dello schema: livelli vuoti |
| `INVALID_BAD_ASSET_DURATION` | `invalid-pack-bad-asset-duration.json` | Validazione dello schema: durata non valida |
| `INTEGRITY_VALID` | `integrity-valid-pack.json` | Integrità: pacchetto valido |
| `INTEGRITY_MISSING_ASSET_REF` | `integrity-missing-asset-ref.json` | Integrità: riferimento a risorsa non valido |
| `INTEGRITY_MISSING_STEM_REF` | `integrity-missing-stem-ref.json` | Integrità: riferimento a traccia non valido |
| `INTEGRITY_MISSING_SCENE_REF` | `integrity-missing-scene-ref.json` | Integrità: riferimento a scena non valido |
| `INTEGRITY_DUPLICATE_IDS` | `integrity-duplicate-ids.json` | Integrità: ID duplicati |
| `INTEGRITY_SELF_REFERENCE` | `integrity-self-reference-pack.json` | Integrità: entità che si riferiscono a se stesse |
| `INTEGRITY_UNUSED_ENTITIES` | `integrity-unused-entities.json` | Integrità: entità non utilizzate |

## Cosa non include

- Test a livello di applicazione (questi si trovano nella directory `test/` di ogni pacchetto)
- Configurazione dell'esecutore dei test (ogni pacchetto ha la propria configurazione `vitest.config.ts`)
