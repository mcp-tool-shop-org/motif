<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
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

Estúdio de trilha sonora adaptável para composição, arranjo, criação de partituras e exportação de música interativa para jogos.

## O que é

Motif é uma estação de trabalho focada na composição, com recursos de adaptação. Ele combina a criação estruturada de música — clipes, pistas, cenas, camadas, automação — com lógica adaptativa que responde ao estado do jogo em tempo real. O resultado: música para jogos que parece intencional, não gerada aleatoriamente.

## O que não é

Uma DAW (Digital Audio Workstation). Um sequenciador de brinquedo. Um gerador de música baseado em IA. Um banco de dados para construção de mundos com áudio anexado. Motif é um instrumento criativo sério para a criação de trilhas sonoras adaptativas para jogos.

Motif não gera música. Ele [ingere](#generated-cues-and-the-genre-library) o áudio que você gerou em outro lugar, transformando uma mixagem, seus elementos individuais e uma leitura de volume em cenas, famílias de pistas e reprodução em camadas. De onde veio o áudio é da sua responsabilidade; o trabalho do Motif começa quando a gravação já existe.

## O que pode fazer

- **Compor** — Cliques com notas, instrumentos, escalas, acordes, transformações de motivos, variantes de intensidade
- **Sintetizar** — Vozes de sintetizador multi-oscilador com uníssono/supersaw (16 predefinições), modulação LFO (filtro, amplitude, tom)
- **Instrumentos de amostra** — Piano, cordas, modelos de guitarra via SampleVoice; importar, cortar, fatiar, criador de kits
- **Arranjar** — Cenas com elementos em camadas, funções de seção, curvas de intensidade; 10 predefinições de padrões de bateria
- **Mixar e aplicar efeitos** — 8 tipos de efeitos (EQ, delay, reverb, compressor, chorus, distorção, phaser, limiter); 4 slots de efeito inseridos por elemento
- **Criar a trilha sonora de um mundo** — Famílias Motif, perfis de trilha sonora, famílias de pistas, entradas do mapa do mundo, derivação
- **Ingerir áudio gerado** — Transformar uma mixagem gerada na nuvem + elementos Demucs + leitura LUFS em um pacote reproduzível e normalizado por volume; conteúdo endereçado para que as execuções repetidas sejam quase instantâneas
- **Criar pacotes de gênero a partir de um catálogo** — Uma entrada JSON por pista gera um pacote inteiro: cena, família de pistas, bloqueio de geração, vinculações e gravações A/B
- **Automatizar** — Faixas, macros, envelopes, captura e mesclagem em tempo real
- **Relembrar e reutilizar** — Modelos, instantâneos, ramificações, favoritos, coleções, comparar
- **MIDI** — Importar/exportar arquivos MIDI padrão
- **Lógica adaptativa** — Vinculações de gatilho, transições, resolução determinística de cenas
- **Executar** — Pré-visualização de clipes em tempo real, clique para audição, metrônomo com cliques agendados pelo AudioContext
- **Validar** — Validação de esquema, auditoria de integridade, verificações de referência cruzada
- **Exportar** — WAV de 24/32 bits a 44,1/48/96 kHz; pacotes em tempo de execução para consumo pelo motor do jogo
- **Criar** — Desfazer/refazer (50 níveis, Ctrl+Z), salvar/carregar projeto com salvamento automático, atalhos de teclado (Espaço=reproduzir, ?=ajuda), BPM global e compasso
- **Confiabilidade** — Limite de erro com recuperação graciosa, agendamento de lookahead do AudioContext para temporização precisa da amostra

## Pistas geradas e a biblioteca de gêneros

Motif pode criar um pacote `SoundtrackPack` reproduzível a partir de áudio gerado. Você descreve um pacote em um arquivo de catálogo, gera o áudio da maneira que preferir e o Motif o transforma em cenas, famílias de pistas e elementos em camadas que você pode ouvir no Studio.

```
catalog entry  →  generation  →  collection  →  ingest  →  playable pack
   (you)          (any model)     (masters)    (Motif)      (Studio)
```

Motif é responsável pelas duas últimas etapas. Ele se preocupa apenas com o fato de que cada gravação chegue como uma mixagem, seus elementos individuais e uma leitura de volume.

**O catálogo integrado descreve 24 pacotes de gênero — 233 pistas, duas gravações por pista.** Fantasia, táticas, masmorra, steampunk, pirata, faroeste, ópera espacial, cyberpunk, mítico, deserto, oriental, nórdico, deserto, floresta, congelado, gótico, subaquático, vulcânico, aconchegante, noir, temas emocionais, drones ambientais, tensão e menus. O catálogo e a derivação estão neste repositório; **os arquivos de áudio master não** — eles são grandes e gerados por usuário, então você os fornece e executa a ingestão.

```bash
# Ingest one pack, or a whole tier
pnpm --filter @motif-studio/sample-lab ingest:library --pack fantasy-jrpg-core
pnpm --filter @motif-studio/sample-lab ingest:library --tier 2 --tier 3
```

A ingestão é **endereçada por conteúdo e incremental**: uma gravação cujos arquivos de entrada ainda correspondem ao que a execução anterior registrou é reutilizada em vez de ser redecodificada, para que executar um pacote finalizado leve cerca de um segundo em vez de minutos, e uma execução interrompida retoma onde parou. `--force` redecodifica tudo para provar que o pipeline ainda reproduz sua própria saída; `--skip-defective` descarta uma gravação malformada, relata-a e sai com um código diferente de zero, em vez de interromper toda a execução.

Consulte [Pistas geradas e pacotes da biblioteca](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/generated-cues/) no manual para obter o fluxo de trabalho completo, incluindo bloqueios de geração e curadoria de gravações.

## Estrutura do monorepos

### Aplicativos

| Aplicativo | Descrição |
|-----|-------------|
| [`apps/studio`](apps/studio) | Interface principal de criação (Next.js, Zustand 5) |

### Pacotes principais

| Pacote | Descrição |
|---------|-------------|
| [`@motif-studio/schema`](packages/schema) | Tipos canônicos, esquemas Zod, análise/validação |
| [`@motif-studio/asset-index`](packages/asset-index) | Indexação e auditoria da integridade do pacote |
| [`@motif-studio/audio-engine`](packages/audio-engine) | Reprodução de amostras, gerenciamento de voz, agendamento do AudioContext |
| [`@motif-studio/test-kit`](packages/test-kit) | Fixas e utilitários de teste |

### Composição e reprodução

| Pacote | Descrição |
|---------|-------------|
| [`@motif-studio/clip-engine`](packages/clip-engine) | Sequenciamento de clipes, transformações, agendamento de pistas |
| [`@motif-studio/instrument-rack`](packages/instrument-rack) | Sintetizador multi-oscilador, voz de bateria, voz de amostra, modulação LFO, 16 predefinições |
| [`@motif-studio/music-theory`](packages/music-theory) | Escalas, acordes, motivos, transformações de intensidade |
| [`@motif-studio/playback-engine`](packages/playback-engine) | Reprodução em tempo real, mixagem, 8 tipos de efeitos, E/S MIDI, exportação WAV (24/32 bits) |
| [`@motif-studio/sample-lab`](packages/sample-lab) | Aparar, fatiar, kit, auxiliares de instrumento — mais a faixa de geração: cliente de execução na nuvem, ingestão de artefatos, normalização de volume, criação de pacotes da biblioteca |
| [`@motif-studio/score-map`](packages/score-map) | Motivos, perfis, famílias de pistas, derivação, catálogo da biblioteca |
| [`@motif-studio/automation`](packages/automation) | Faixas, macros, envelopes, captura |
| [`@motif-studio/library`](packages/library) | Modelos, instantâneos, ramificações, favoritos, comparar |

### Infraestrutura

| Pacote | Descrição |
|---------|-------------|
| [`@motif-studio/scene-mapper`](packages/scene-mapper) | Mapeamento de gatilhos e avaliação determinística de vinculação |
| [`@motif-studio/runtime-pack`](packages/runtime-pack) | Exportação/importação em tempo de execução com serialização determinística |
| [`@motif-studio/review`](packages/review) | Resumos e auxiliares de auditoria |
| [`@motif-studio/ui`](packages/ui) | Componentes de interface do usuário compartilhados |

## Instalar

```bash
npm install @motif-studio/schema @motif-studio/clip-engine @motif-studio/runtime-pack
```

Todos os pacotes são publicados no npm sob o escopo `@motif-studio`.

## Guia de Início Rápido (monorepositorio)

```bash
pnpm install
pnpm build
pnpm test       # 1,709 tests across all packages
pnpm dev        # Start Studio dev server
```

**Requisitos:** Node.js >= 22, pnpm >= 10

## Testes

Todos os 16 pacotes possuem testes unitários que abrangem a validação de esquema, auditoria de integridade, operações de exemplo, pontuação do mundo, automação, gerenciamento de biblioteca, reprodução, síntese, efeitos, MIDI, ingestão de geração e integração com o estúdio. 1.709 testes em todos os pacotes.

Executar tudo: `pnpm test`

## Manual

O [manual](https://mcp-tool-shop-org.github.io/motif/handbook/product/) é o manual de operação abrangente que cobre a definição do produto, arquitetura, navegação no estúdio, fluxos de trabalho criativos e estratégia. Principais pontos de entrada:

- [Produto: O que é Motif](https://mcp-tool-shop-org.github.io/motif/handbook/product/)
- [Arquitetura: Visão geral do repositório](https://mcp-tool-shop-org.github.io/motif/handbook/architecture/)
- [Fluxo de trabalho: Criando uma trilha sonora do zero](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/building-a-cue/)
- [Fluxo de trabalho: Trilhas sonoras geradas e pacotes de biblioteca](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/generated-cues/)
- [Fluxo de trabalho: Trabalhando com amostras personalizadas](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/custom-samples/)
- [Fluxo de trabalho: Pontuação do mundo](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/world-scoring/)
- [Estratégia: Glossário](https://mcp-tool-shop-org.github.io/motif/handbook/strategy/glossary/)
- [Pacotes de exemplo](examples/)

## Segurança e Confiança

**O estúdio é executado inteiramente no navegador.** Sem servidor, sem sincronização na nuvem, sem telemetria.

- **Dados acessados:** Arquivos de pacotes de trilha sonora criados pelo usuário (JSON), referências de ativos de áudio, armazenamento local do navegador
- **Dados NÃO acessados:** Sem armazenamento no lado do servidor, sem acesso ao sistema de arquivos além da sandbox do navegador
- **Rede:** O aplicativo Studio não realiza nenhuma comunicação de rede — toda a criação e reprodução são feitas no lado do cliente
- **Credenciais:** Não lê, armazena ou transmite credenciais
- **Telemetria:** Nenhuma coletada ou enviada
- **Permissões:** Apenas APIs padrão do navegador (Web Audio API)

**Uma exceção, e é opcional e fora do aplicativo:** `@motif-studio/sample-lab` inclui uma ferramenta de geração de linha de comando que se comunica com um endpoint Comfy Cloud para enviar e recuperar trabalhos de geração. Ela só é executada quando você a invoca a partir de um terminal, nunca é importada pelo aplicativo Studio e lê suas credenciais do seu próprio ambiente. Ignore-a completamente e o Motif permanecerá totalmente offline.

Consulte [SECURITY.md](SECURITY.md) para relatar vulnerabilidades.

## Licença

MIT

---

Criado por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
