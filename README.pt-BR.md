<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
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

Estúdio de trilha sonora adaptável para composição, arranjo, criação de trilhas sonoras e exportação de músicas interativas para jogos.

## O que é

Motif é uma estação de trabalho focada na composição, com recursos de adaptação. Combina a criação estruturada de música — trechos, marcadores, cenas, camadas, automação — com lógica adaptativa que responde ao estado do jogo em tempo real. O resultado: músicas para jogos que parecem intencionais, e não geradas aleatoriamente.

## O que não é

Uma DAW (Digital Audio Workstation). Um sequenciador simples. Um gerador de música por inteligência artificial. Um banco de dados de criação de mundos com sons. Motif é um instrumento criativo para a criação de trilhas sonoras adaptáveis para jogos.

## O que ele pode fazer

- **Compor** — Trechos com notas, instrumentos, escalas, acordes, transformações de motivos, variações de intensidade.
- **Sintetizar** — Vozer sintetizadas com múltiplos osciladores, com unison/supersaw (16 presets), modulação LFO (filtro, amplitude, afinação).
- **Amostrar instrumentos** — Modelos de piano, cordas, guitarra via SampleVoice; importar, cortar, dividir, criador de kits.
- **Arranjar** — Cenas com camadas, funções de seções, curvas de intensidade; 10 presets de padrões de bateria.
- **Mixar e aplicar efeitos** — 8 tipos de efeitos (EQ, delay, reverb, compressor, chorus, distorção, phaser, limiter); 4 slots de efeitos para cada camada.
- **Criar um mundo sonoro** — Famílias de motivos, perfis de trilha sonora, famílias de marcadores, entradas de mapa do mundo, derivação.
- **Automatizar** — Trilhas, macros, envelopes, captura e mesclagem em tempo real.
- **Reutilizar e salvar** — Modelos, snapshots, ramificações, favoritos, coleções, comparar.
- **MIDI** — Importar/exportar arquivos MIDI padrão.
- **Lógica adaptativa** — Vinculação de gatilhos, transições, resolução de cenas determinística.
- **Reproduzir** — Visualização de trechos em tempo real, audição instantânea, metrônomo com cliques agendados via AudioContext.
- **Validar** — Validação de esquema, auditoria de integridade, verificações de referência cruzada.
- **Exportar** — WAV de 24/32 bits a 44.1/48/96kHz; pacotes de tempo de execução para uso em engines de jogos.
- **Criar** — Desfazer/refazer (até 50 níveis, Ctrl+Z), salvar/carregar projeto com salvamento automático, atalhos de teclado (Espaço=reproduzir, ?=ajuda), BPM e compasso globais.
- **Confiabilidade** — Limite de erros com recuperação suave, agendamento de antecipação do AudioContext para sincronização precisa.

## Estrutura de Monorepo

### Aplicativos

| Aplicativo | Descrição |
|-----|-------------|
| [`apps/studio`](apps/studio) | Interface de usuário principal de criação (Next.js, Zustand 5). |

### Pacotes Principais

| Pacote | Descrição |
|---------|-------------|
| [`@motif/schema`](packages/schema) | Tipos canônicos, esquemas Zod, parse/validação. |
| [`@motif/asset-index`](packages/asset-index) | Indexação e auditoria da integridade dos pacotes. |
| [`@motif/audio-engine`](packages/audio-engine) | Reprodução de amostras, gerenciamento de vozes, agendamento do AudioContext. |
| [`@motif/test-kit`](packages/test-kit) | Ferramentas de teste e exemplos. |

### Composição e Reprodução

| Pacote | Descrição |
|---------|-------------|
| [`@motif/clip-engine`](packages/clip-engine) | Sequenciamento de trechos, transformações, agendamento de marcadores. |
| [`@motif/instrument-rack`](packages/instrument-rack) | Sintetizador com múltiplos osciladores, voz de bateria, voz de amostra, modulação LFO, 16 presets. |
| [`@motif/music-theory`](packages/music-theory) | Escalas, acordes, motivos, transformações de intensidade. |
| [`@motif/playback-engine`](packages/playback-engine) | Reprodução em tempo real, mixagem, 8 tipos de efeitos, I/O MIDI, exportação WAV (24/32 bits). |
| [`@motif/sample-lab`](packages/sample-lab) | Cortar, dividir, kit, ferramentas para instrumentos. |
| [`@motif/score-map`](packages/score-map) | Motivos, perfis, famílias de marcadores, derivação. |
| [`@motif/automation`](packages/automation) | Trilhas, macros, envelopes, captura. |
| [`@motif/library`](packages/library) | Modelos, snapshots, ramificações, favoritos, comparar. |

### Infraestrutura

| Pacote | Descrição |
|---------|-------------|
| [`@motif/scene-mapper`](packages/scene-mapper) | Mapeamento de gatilhos e avaliação determinística de vinculação. |
| [`@motif/runtime-pack`](packages/runtime-pack) | Exportação/importação em tempo de execução com serialização determinística. |
| [`@motif/review`](packages/review) | Resumos e ferramentas de auditoria. |
| [`@motif/ui`](packages/ui) | Componentes de interface de usuário compartilhados. |

## Instalação

```bash
npm install @motif/schema @motif/clip-engine @motif/runtime-pack
```

Todos os pacotes são publicados no npm sob o escopo `@motif`.

## Início rápido (monorepo)

```bash
pnpm install
pnpm build
pnpm test       # 1,116 tests across all packages
pnpm dev        # Start Studio dev server
```

**Requisitos:** Node.js >= 22, pnpm >= 10

## Testes

Todos os 16 pacotes possuem testes unitários que abrangem a validação do esquema, auditoria de integridade, operações de exemplo, pontuação do "mundo", automação, gerenciamento de bibliotecas, reprodução, síntese, efeitos, MIDI e integração com o estúdio. Existem 1.116 testes em todos os pacotes.

Para executar todos os testes: `pnpm test`

## Manual do Usuário

O [manual do usuário](https://mcp-tool-shop-org.github.io/motif/handbook/product/) é o manual de operação completo que cobre a definição do produto, a arquitetura, a navegação no estúdio, os fluxos de trabalho criativos e a estratégia. Principais pontos de acesso:

- [Produto: O que é o Motif](https://mcp-tool-shop-org.github.io/motif/handbook/product/)
- [Arquitetura: Visão geral do repositório](https://mcp-tool-shop-org.github.io/motif/handbook/architecture/)
- [Fluxo de trabalho: Criando uma sequência do zero](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/building-a-cue/)
- [Fluxo de trabalho: Trabalhando com amostras personalizadas](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/custom-samples/)
- [Fluxo de trabalho: Pontuação do "mundo"](https://mcp-tool-shop-org.github.io/motif/handbook/workflows/world-scoring/)
- [Estratégia: Glossário](https://mcp-tool-shop-org.github.io/motif/handbook/strategy/glossary/)
- [Pacotes de exemplo](examples/)

## Segurança e Confiança

O Motif funciona **totalmente no navegador**. Não há servidor, sincronização na nuvem ou telemetria.

- **Dados acessados:** Arquivos de pacotes de trilha sonora criados pelo usuário (JSON), referências de ativos de áudio, armazenamento local do navegador.
- **Dados NÃO acessados:** Nenhum armazenamento no lado do servidor, nenhum acesso ao sistema de arquivos além da área de segurança do navegador.
- **Rede:** Zero tráfego de rede – toda a criação e reprodução ocorrem no lado do cliente.
- **Credenciais:** Não lê, armazena ou transmite credenciais.
- **Telemetria:** Nada é coletado ou enviado.
- **Permissões:** Apenas APIs padrão do navegador (Web Audio API).

Consulte o arquivo [SECURITY.md](SECURITY.md) para relatar vulnerabilidades.

## Licença

MIT

---

Desenvolvido por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
