<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/studio

O aplicativo Studio é a principal interface para a criação de pacotes Motif. Ele oferece uma interface de controle com tema escuro para criar, editar e inspecionar cada elemento em um pacote.

## Telas

| Tela | Propósito |
|--------|---------|
| **Project** | Metadados do pacote, visão geral de estatísticas, detecção de elementos não utilizados. |
| **Assets** | CRUD (criar, ler, atualizar, excluir) para ativos de áudio (música, efeitos sonoros, ambiente, efeitos especiais, voz). |
| **Stems** | CRUD para stems com atribuição de ativos e marcação de funções. |
| **Scenes** | CRUD para cenas com edição de camadas inline (adicionar/remover/reordenar). |
| **Bindings** | CRUD para vinculações com edição de condições inline. |
| **Transitions** | CRUD para transições com avisos de validação específicos do modo. |
| **Review** | Resultados de validação em tempo real do `@motif/review`, agrupados por gravidade. |
| **Preview** | Simulação de estado de tempo de execução manual e sequencial com integração do motor. |

## Visualização

A tela de visualização simula o comportamento da trilha sonora em tempo real com base na versão atual do pacote.

Funcionalidades atuais:
- visualização manual do estado em tempo real.
- simulação de sequência editável.
- inspeção de vinculações e cenas selecionadas.
- inspeção de stems ativos.
- visibilidade de transições e avisos.

Esta visualização é baseada em simulação e não realiza reprodução real de áudio.

## Desenvolvimento

```bash
pnpm --filter @motif/studio dev    # Next.js dev server
pnpm --filter @motif/studio build  # Production build
pnpm --filter @motif/studio test   # Run tests
```

## Tecnologias

- **Framework:** Next.js 15 (App Router)
- **Gerenciamento de estado:** Zustand
- **Validação:** `@motif/review` (obtido via hook `useReview`)
- **Testes:** Vitest + Testing Library + jsdom
- **Estilização:** Variáveis CSS, tema escuro (sem CSS-in-JS)
