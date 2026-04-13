<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/test-kit

Conjunto de ferramentas, exemplos e utilitários de teste para pacotes Motif.

## O que este pacote inclui

- Arquivos de configuração (fixtures) em formato JSON para testes (pacotes mínimos, pacotes de teste de integridade, pacotes inválidos)
- Utilitários para carregar configurações (fixtures)
- Resolução de caminhos para configurações (fixtures)

## Principais funcionalidades

```ts
import { FIXTURES, loadFixture, fixturePath } from "@motif/test-kit";

const pack = loadFixture(FIXTURES.MINIMAL_PACK);
```

### Configurações (Fixtures)

| Constante | Arquivo de configuração (Fixture) | Propósito |
|----------|-------------|---------|
| `MINIMAL_PACK` | `minimal-pack.json` | Pacote válido com o mínimo necessário |
| `STARTER_PACK` | `starter-pack.json` | Pacote inicial mais completo |
| `INVALID_MISSING_META` | `invalid-pack-missing-meta.json` | Validação do esquema: metadados ausentes |
| `INVALID_BAD_TRANSITION` | `invalid-pack-bad-transition.json` | Validação do esquema: transição inválida |
| `INVALID_EMPTY_SCENE_LAYERS` | `invalid-pack-empty-scene-layers.json` | Validação do esquema: camadas vazias |
| `INVALID_BAD_ASSET_DURATION` | `invalid-pack-bad-asset-duration.json` | Validação do esquema: duração inválida |
| `INTEGRITY_VALID` | `integrity-valid-pack.json` | Integridade: pacote íntegro |
| `INTEGRITY_MISSING_ASSET_REF` | `integrity-missing-asset-ref.json` | Integridade: referência de ativo corrompida |
| `INTEGRITY_MISSING_STEM_REF` | `integrity-missing-stem-ref.json` | Integridade: referência de stem corrompida |
| `INTEGRITY_MISSING_SCENE_REF` | `integrity-missing-scene-ref.json` | Integridade: referência de cena corrompida |
| `INTEGRITY_DUPLICATE_IDS` | `integrity-duplicate-ids.json` | Integridade: IDs duplicados |
| `INTEGRITY_SELF_REFERENCE` | `integrity-self-reference-pack.json` | Integridade: entidades com referências a si mesmas |
| `INTEGRITY_UNUSED_ENTITIES` | `integrity-unused-entities.json` | Integridade: entidades não utilizadas |

## O que este pacote não inclui

- Testes de nível de aplicação (estes estão em cada pacote no diretório `test/`)
- Configuração do executor de testes (cada pacote tem sua própria configuração `vitest.config.ts`)
