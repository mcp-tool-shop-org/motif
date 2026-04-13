<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/schema

Tipos canônicos e validação para pacotes de trilha sonora do Motif.

## Inclui:

- Tipos TypeScript para todas as entidades principais da trilha sonora.
- Esquemas Zod para análise e validação.
- Funções de validação seguras com informações detalhadas sobre erros.
- Imposição da versão do esquema (`schemaVersion: "1"`).

## Entidades principais:

- `SoundtrackPackMeta` — identidade e versão do pacote.
- `AudioAsset` — referência a um arquivo de áudio, com tipo, duração e pontos de loop.
- `Stem` — camada reproduzível associada a um arquivo de áudio, com uma função específica.
- `Scene` — estado musical composto por camadas de stems.
- `SceneLayerRef` — referência a um stem dentro de uma cena.
- `TriggerCondition` / `TriggerBinding` — mapeamento entre o estado de execução e a cena.
- `TransitionRule` — como a música transita entre as cenas.
- `SoundtrackPack` — o documento completo do pacote.
- `RuntimeMusicState` — estrutura do estado do jogo para avaliação de gatilhos.

## Principais exportações:

```ts
import {
  parseSoundtrackPack,
  safeParseSoundtrackPack,
  validateSoundtrackPack,
} from "@motif/schema";
```

### `parseSoundtrackPack(input: unknown): SoundtrackPack`

Análise estrita. Lança erros em caso de dados inválidos.

### `safeParseSoundtrackPack(input: unknown)`

Retorna `{ success: true, data }` ou `{ success: false, errors }`. Nunca lança erros.

### `validateSoundtrackPack(input: unknown): ValidationResult<SoundtrackPack>`

Retorna `{ ok, data?, issues }` com um array estruturado de `ValidationIssue[]`.

Cada erro inclui `path`, `code` e `message` para depuração.

## Regras de validação:

- Campos obrigatórios são aplicados.
- Valores de enum são aplicados (tipo de arquivo de áudio, função do stem, categoria da cena, operação do gatilho, modo de transição).
- `durationMs > 0`.
- `loopStartMs >= 0` se presente.
- `loopEndMs > loopStartMs` se ambos estiverem presentes.
- `priority` deve ser um inteiro.
- Bindings devem ter pelo menos uma condição.
- Cenas devem ter pelo menos uma camada.
- `durationMs` é obrigatório para transições `crossfade` e `cooldown-fade`.
- `schemaVersion` deve ser `"1"`.

## Escopo:

Este pacote valida a estrutura e a correção em nível de campo.

Verificações de integridade de referências (por exemplo, "a cena se refere a um stem inexistente") são tratadas por pacotes de nível superior.
